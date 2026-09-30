"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Participant, StageViewMode } from "../lib/types.ts";
import {
  formatPrecisionCountdown,
  formatTimerDisplay,
  calculateLeaderboard,
  getParticipantPhoto,
  getParticipantPhotoPosition,
  getActiveRoundParticipants,
} from "../lib/gameEngine.ts";
import { playWheelClick, playGrandFanfare, playSuccessFanfare, playTick, playHurryTick, playBuzzer } from "../lib/audio.ts";
import { Disc3, Trophy, Crown, CheckCircle2, UserCheck, Sparkles, Clock, PartyPopper } from "lucide-react";

interface Round5ExecutivePitchProps {
  spinNames: string[];
  participants: Participant[];
  timeRemainingMs: number;
  timerRunning: boolean;
  gameEnded?: boolean;
  selectedWinner: string | null;
  soundEnabled?: boolean;
  isAdmin?: boolean;
  showLeaderboard?: boolean;
  viewMode?: StageViewMode;
  spunWinners?: string[];
  onSpinEnd?: (winnerName: string) => void;
  onToggleLeaderboard?: () => void;
  onSetViewMode?: (mode: StageViewMode) => void;
  onEndGame?: () => void;
}

export function Round5ExecutivePitch({
  spinNames,
  participants,
  timeRemainingMs,
  timerRunning,
  gameEnded = false,
  selectedWinner: externalWinner,
  soundEnabled = true,
  isAdmin = false,
  showLeaderboard = false,
  viewMode = "wheel",
  spunWinners = [],
  onSpinEnd,
  onToggleLeaderboard,
  onSetViewMode,
  onEndGame,
}: Round5ExecutivePitchProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(externalWinner);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Active finalists in Executive Pitch (top 5 active contenders for Round 6)
  const finalistsList = getActiveRoundParticipants(participants, 6).slice(0, 5);
  const eligibleFinalistsSet = new Set(finalistsList.map((p) => p.name));

  // Remaining active candidates on the wheel (strictly excluding any eliminated participants)
  const activeNames =
    spinNames && spinNames.length > 0
      ? spinNames.filter((n) => eligibleFinalistsSet.has(n))
      : finalistsList.map((p) => p.name);

  // Ranked Finalists by total score
  const rankedFinalists = calculateLeaderboard(finalistsList);

  // Draw wheel on canvas (Theme: D95B00 / Amber / Orange / Gold)
  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    if (activeNames.length === 0) {
      // Empty wheel state
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#1a0800";
      ctx.fill();
      ctx.strokeStyle = "#D95B00";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#fb923c";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Semua Finalis Selesai Di-Pitch", centerX, centerY);
      ctx.restore();
      return;
    }

    const numSlices = activeNames.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    const sliceColors = [
      "#D95B00",
      "#2e1002",
      "#f59e0b",
      "#150600",
      "#ea580c",
      "#3b1302",
      "#fbbf24",
      "#0f0400",
      "#c2410c",
    ];

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sliceColors[i % sliceColors.length];
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;

      const name = activeNames[i];
      const truncated = name.length > 16 ? name.substring(0, 15) + "…" : name;
      ctx.fillText(truncated, radius - 20, 5);
      ctx.restore();
    }

    // Outer wheel ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#D95B00";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center hub circle
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    ctx.fillStyle = "#120500";
    ctx.fill();
    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Top Pointer Arrow (fixed)
    ctx.save();
    ctx.translate(centerX, centerY - radius + 5);
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(-14, -12);
    ctx.lineTo(14, -12);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#D95B00";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }, [activeNames]);

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  // Spin function
  const spinWheel = () => {
    if (isSpinning || activeNames.length === 0) return;
    setIsSpinning(true);
    setCurrentWinner(null);

    const totalRounds = 5 + Math.random() * 4;
    const randomStopOffset = Math.random() * 2 * Math.PI;
    const targetRotation = rotationRef.current + totalRounds * 2 * Math.PI + randomStopOffset;

    const duration = 5000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;
    let lastSectorIndex = -1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startRotation + (targetRotation - startRotation) * easeOut;
      rotationRef.current = currentAngle;

      drawWheel(currentAngle);

      const sliceAngle = (2 * Math.PI) / activeNames.length;
      const normalizedAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const pointerSector = Math.floor(
        ((2 * Math.PI - normalizedAngle - Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)) / sliceAngle
      );

      if (pointerSector !== lastSectorIndex) {
        lastSectorIndex = pointerSector;
        playWheelClick(soundEnabled);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winnerIndex = pointerSector % activeNames.length;
        const winner = activeNames[winnerIndex] || activeNames[0];
        setCurrentWinner(winner);
        playSuccessFanfare(soundEnabled);
        if (onSpinEnd) {
          onSpinEnd(winner);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const totalSec = Math.floor(timeRemainingMs / 1000);
  const lastPlayedSecRef = useRef<number>(-1);

  // Timer audio
  useEffect(() => {
    if (!timerRunning) {
      lastPlayedSecRef.current = -1;
      return;
    }
    if (totalSec !== lastPlayedSecRef.current) {
      lastPlayedSecRef.current = totalSec;
      if (totalSec <= 10 && totalSec > 0) {
        playHurryTick(soundEnabled);
      } else if (totalSec > 0) {
        playTick(soundEnabled);
      } else if (totalSec === 0) {
        playBuzzer(soundEnabled);
      }
    }
  }, [totalSec, timerRunning, soundEnabled]);

  const isLowTime = timeRemainingMs <= 30000 && timeRemainingMs > 0;
  const isCriticalTime = timeRemainingMs <= 10000 && timeRemainingMs > 0;

  const effectiveMode = showLeaderboard || gameEnded ? "leaderboard" : viewMode;

  // =========================================================================
  // 1. LEADERBOARD / FINAL STANDINGS VIEW
  // =========================================================================
  if (effectiveMode === "leaderboard") {
    return (
      <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto overflow-hidden animate-in fade-in duration-300">
        {/* Header - Only Executive Pitch */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans gold-gradient">
              EXECUTIVE PITCH
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>5 Finalis</span>
            </div>
            {onToggleLeaderboard && (
              <button
                type="button"
                onClick={onToggleLeaderboard}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Disc3 className="w-3.5 h-3.5 text-amber-300" />
                <span>Roda Putar</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Finalists Cards Grid */}
        <div className="flex-1 flex flex-col min-h-0 h-full rounded-2xl bg-black/40 border border-white/10 p-3 sm:p-4 overflow-hidden">
          <div className="flex items-center justify-between px-1.5 pb-2.5 flex-shrink-0 border-b border-white/10 mb-3">
            <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              Klasemen Final Executive Pitch (Juara 1, 2, 3, Harapan 1 & 2)
            </span>
            <span className="text-xs text-white/50 font-mono font-bold">
              GRAND FINAL 180DC CR
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-2.5 min-h-0 overflow-y-auto pr-1">
            {rankedFinalists.map((p, idx) => {
              const rank = idx + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;
              const rankTitle =
                rank === 1
                  ? "🏆 JUARA 1"
                  : rank === 2
                  ? "🥈 JUARA 2"
                  : rank === 3
                  ? "🥉 JUARA 3"
                  : rank === 4
                  ? "HARAPAN 1"
                  : "HARAPAN 2";

              return (
                <div
                  key={p.id}
                  className={`px-4 py-3 rounded-2xl border flex items-center justify-between gap-4 transition-all overflow-hidden ${
                    isGold
                      ? "bg-gradient-to-r from-amber-500/30 via-yellow-500/15 to-transparent border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)] scale-[1.01]"
                      : isSilver
                      ? "bg-gradient-to-r from-slate-300/30 via-slate-400/15 to-transparent border-slate-300/80 shadow-[0_0_15px_rgba(203,213,225,0.2)]"
                      : isBronze
                      ? "bg-gradient-to-r from-amber-700/30 via-amber-800/15 to-transparent border-amber-600/80 shadow-[0_0_15px_rgba(217,119,6,0.2)]"
                      : "bg-white/[0.04] border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs sm:text-sm flex-shrink-0 ${
                        isGold
                          ? "bg-amber-400 text-black shadow-lg animate-pulse"
                          : isSilver
                          ? "bg-slate-200 text-black shadow-md"
                          : isBronze
                          ? "bg-amber-600 text-white shadow-md"
                          : "bg-white/10 text-white/70 border border-white/15"
                      }`}
                    >
                      {rank}
                    </div>

                    {/* Avatar */}
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-neutral-900">
                      <Image
                        src={p.avatar || getParticipantPhoto(p.name)}
                        alt={p.name}
                        fill
                        sizes="48px"
                        style={{ objectPosition: getParticipantPhotoPosition(p.name) }}
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${
                          isGold ? "bg-amber-400 text-black" : isSilver ? "bg-slate-200 text-black" : isBronze ? "bg-amber-600 text-white" : "bg-white/10 text-white/60"
                        }`}>
                          {rankTitle}
                        </span>
                      </div>
                      <div className="font-black text-sm sm:text-base text-white truncate mt-0.5">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-white/50 truncate font-mono">
                        {p.university}
                      </div>
                    </div>
                  </div>

                  {/* Total Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-mono font-black text-lg sm:text-xl text-amber-400">
                      {p.score.toLocaleString()}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                      TOTAL PTS
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. TIMER VIEW (Giant Standalone Precision Countdown)
  // =========================================================================
  if (effectiveMode === "timer") {
    return (
      <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto overflow-hidden animate-in fade-in duration-300">
        {/* Header - Only Executive Pitch */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans gold-gradient">
            EXECUTIVE PITCH
          </h1>
          {onSetViewMode && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSetViewMode("wheel")}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Disc3 className="w-3.5 h-3.5 text-amber-300" />
                <span>Roda Putar</span>
              </button>
            </div>
          )}
        </div>

        {/* Big Giant Timer Box */}
        <div className="glass-panel p-8 sm:p-14 rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.03] via-[#080a09] to-black text-center relative overflow-hidden shadow-2xl my-auto">
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isCriticalTime
                ? "bg-red-600/20"
                : isLowTime
                ? "bg-amber-500/20"
                : "bg-amber-600/20"
            }`}
          />

          <div className="relative z-10 my-8 sm:my-12">
            <div
              className={`font-mono text-6xl sm:text-8xl md:text-9xl font-black tracking-wider transition-colors duration-300 drop-shadow-[0_0_35px_rgba(0,0,0,0.8)] ${
                isCriticalTime
                  ? "text-red-500 animate-pulse drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]"
                  : isLowTime
                  ? "text-amber-400 drop-shadow-[0_0_35px_rgba(251,191,36,0.4)]"
                  : "text-white"
              }`}
            >
              {formatPrecisionCountdown(timeRemainingMs)}
            </div>
            <div className="flex items-center justify-center gap-12 sm:gap-24 text-xs sm:text-sm text-white/40 uppercase font-mono tracking-widest mt-4">
              <span>Minutes</span>
              <span>Seconds</span>
              <span>Hundredths</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. SPIN WHEEL VIEW (Only Spin Wheel + CR Logo in Center)
  // =========================================================================
  return (
    <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto overflow-hidden animate-in fade-in duration-300 select-none">
      {/* Header - Only Executive Pitch */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans gold-gradient">
          EXECUTIVE PITCH
        </h1>
        {onSetViewMode && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSetViewMode("timer")}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Timer</span>
            </button>
            <button
              type="button"
              onClick={() => onSetViewMode("leaderboard")}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Final Standings</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Wheel Display with CR Logo in Center */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-2">
        <div className="relative flex items-center justify-center">
          {/* Wheel Canvas */}
          <div className="relative p-3 rounded-full bg-gradient-to-b from-[#D95B00]/30 via-white/5 to-transparent border border-[#D95B00]/40 shadow-[0_0_50px_rgba(217,91,0,0.3)]">
            <canvas
              ref={canvasRef}
              width={460}
              height={460}
              className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] aspect-square"
            />
            {/* Center CR Logo Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#120500] border-2 border-[#fb923c] shadow-[0_0_20px_rgba(251,146,60,0.5)] flex items-center justify-center overflow-hidden z-20 pointer-events-none">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11">
                <Image
                  src="/LogoCR.png"
                  alt="CR Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Finalist Spotlight Card */}
        {currentWinner && (
          <div className="mt-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D95B00]/40 via-amber-950/60 to-[#D95B00]/40 border border-[#fb923c]/50 shadow-[0_0_30px_rgba(251,146,60,0.3)] text-center animate-in zoom-in-95">
            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#fb923c] flex items-center justify-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Selected Finalist
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-sans mt-0.5">
              {currentWinner}
            </div>
          </div>
        )}

        {/* Spin Trigger Button */}
        <div className="mt-4">
          <button
            onClick={spinWheel}
            disabled={isSpinning || activeNames.length === 0}
            className="px-8 py-3.5 rounded-2xl bg-[#D95B00] hover:bg-[#eb6a0a] disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(217,91,0,0.4)] hover:shadow-[0_0_35px_rgba(217,91,0,0.6)] transition-all transform hover:scale-105 cursor-pointer"
          >
            <Disc3 className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
            {isSpinning ? "Spinning..." : `Spin Finalist (${activeNames.length} Sisa)`}
          </button>
        </div>
      </div>
    </div>
  );
}
