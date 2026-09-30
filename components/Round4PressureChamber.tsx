"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Participant, StageViewMode } from "../lib/types.ts";
import {
  formatPrecisionCountdown,
  formatTimerDisplay,
  calculateLeaderboard,
  getParticipantPhoto,
  getParticipantPhotoPosition,
  getActiveRoundParticipants,
} from "../lib/gameEngine.ts";
import { playWheelClick, playSuccessFanfare, playTick, playHurryTick, playBuzzer } from "../lib/audio.ts";
import { Disc3, Trophy, CheckCircle2, UserCheck, Sparkles, Clock } from "lucide-react";

interface Round4PressureChamberProps {
  spinNames: string[];
  participants: Participant[];
  timeRemainingMs: number;
  timerRunning: boolean;
  selectedWinner: string | null;
  soundEnabled?: boolean;
  isAdmin?: boolean;
  showLeaderboard?: boolean;
  viewMode?: StageViewMode;
  spunWinners?: string[];
  onSpinEnd?: (winnerName: string) => void;
  onToggleLeaderboard?: () => void;
  onSetViewMode?: (mode: StageViewMode) => void;
}

export function Round4PressureChamber({
  spinNames,
  participants,
  timeRemainingMs,
  timerRunning,
  selectedWinner: externalWinner,
  soundEnabled = true,
  isAdmin = false,
  showLeaderboard = false,
  viewMode = "wheel",
  spunWinners = [],
  onSpinEnd,
  onToggleLeaderboard,
  onSetViewMode,
}: Round4PressureChamberProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(externalWinner);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Active contenders in Pressure Chamber (top 9 active contenders for Round 5)
  const chamberCandidates = getActiveRoundParticipants(participants, 5).slice(0, 9);
  const eligibleNamesSet = new Set(chamberCandidates.map((p) => p.name));

  // Remaining active candidates on the wheel (strictly excluding any eliminated participants)
  const activeNames =
    spinNames && spinNames.length > 0
      ? spinNames.filter((n) => eligibleNamesSet.has(n))
      : chamberCandidates.map((p) => p.name);

  // Ranked Pressure Chamber Candidates by accumulated score
  const rankedChamber = calculateLeaderboard(chamberCandidates);

  // Draw the wheel on canvas
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
      ctx.fillStyle = "#150422";
      ctx.fill();
      ctx.strokeStyle = "#7A00B8";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#c084fc";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Semua Peserta Selesai Di-Spin", centerX, centerY);
      ctx.restore();
      return;
    }

    const numSlices = activeNames.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    const sliceColors = [
      "#7A00B8",
      "#26083b",
      "#9d24e0",
      "#150422",
      "#620094",
      "#380c54",
      "#b84dff",
      "#0d0214",
      "#50037a",
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
    ctx.strokeStyle = "#7A00B8";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center hub background circle (Center logo will be overlaid crisp on top)
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    ctx.fillStyle = "#0c0314";
    ctx.fill();
    ctx.strokeStyle = "#c084fc";
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
    ctx.strokeStyle = "#7A00B8";
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

  const effectiveMode = showLeaderboard ? "leaderboard" : viewMode;

  // =========================================================================
  // 1. LEADERBOARD VIEW (All 9 participants with accumulated scores)
  // =========================================================================
  if (effectiveMode === "leaderboard") {
    return (
      <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto overflow-hidden animate-in fade-in duration-300">
        {/* Header - Only Pressure Chamber */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
              PRESSURE CHAMBER
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
              <Trophy className="w-4 h-4" />
              <span>9 Kontender</span>
            </div>
            {onToggleLeaderboard && (
              <button
                type="button"
                onClick={onToggleLeaderboard}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Disc3 className="w-3.5 h-3.5 text-purple-300" />
                <span>Roda Putar</span>
              </button>
            )}
          </div>
        </div>

        {/* 9 Participants Multi-Column Leaderboard Grid (Gauntlet Style) */}
        <div className="flex-1 flex flex-col min-h-0 h-full rounded-2xl bg-black/40 border border-white/10 p-3 sm:p-4 overflow-hidden">
          <div className="flex items-center justify-between px-1.5 pb-2.5 flex-shrink-0 border-b border-white/10 mb-3">
            <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              Akumulasi Skor 9 Peserta Pressure Chamber
            </span>
            <span className="text-xs text-white/50 font-mono font-bold">
              TOP 5 LOLOS KE EXECUTIVE PITCH
            </span>
          </div>

          {/* 3 Columns x 3 Rows = All 9 Participants perfectly framed */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 grid-rows-3 gap-3 min-h-0 overflow-hidden">
            {rankedChamber.map((p, idx) => {
              const rank = idx + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;
              const isTop5 = rank <= 5;

              return (
                <div
                  key={p.id}
                  className={`px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-all overflow-hidden ${
                    isGold
                      ? "bg-gradient-to-r from-amber-500/25 via-yellow-500/10 to-transparent border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
                      : isSilver
                      ? "bg-gradient-to-r from-slate-300/25 via-slate-400/10 to-transparent border-slate-300/60"
                      : isBronze
                      ? "bg-gradient-to-r from-amber-700/25 via-amber-800/10 to-transparent border-amber-600/60"
                      : isTop5
                      ? "bg-purple-950/30 border-purple-500/40"
                      : "bg-white/[0.03] border-white/10 opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs sm:text-sm flex-shrink-0 ${
                        isGold
                          ? "bg-amber-400 text-black shadow-md"
                          : isSilver
                          ? "bg-slate-200 text-black shadow-md"
                          : isBronze
                          ? "bg-amber-600 text-white shadow-md"
                          : isTop5
                          ? "bg-purple-500/30 text-purple-300 border border-purple-500/40"
                          : "bg-white/10 text-white/50 border border-white/15"
                      }`}
                    >
                      {rank}
                    </div>

                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-neutral-900">
                      <Image
                        src={p.avatar || getParticipantPhoto(p.name)}
                        alt={p.name}
                        fill
                        sizes="40px"
                        style={{ objectPosition: getParticipantPhotoPosition(p.name) }}
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-white/50 truncate font-mono">
                        {p.university}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-mono font-black text-base sm:text-lg text-purple-300">
                      {p.score.toLocaleString()}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                      PTS
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
        {/* Header - Only Pressure Chamber */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
            PRESSURE CHAMBER
          </h1>
          {onSetViewMode && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSetViewMode("wheel")}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Disc3 className="w-3.5 h-3.5 text-purple-300" />
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
                : "bg-purple-600/20"
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
      {/* Header - Only Pressure Chamber */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
          PRESSURE CHAMBER
        </h1>
        {onSetViewMode && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSetViewMode("timer")}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-purple-300" />
              <span>Timer</span>
            </button>
            <button
              type="button"
              onClick={() => onSetViewMode("leaderboard")}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-purple-300" />
              <span>Leaderboard</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Wheel Display with CR Logo in Center */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-2">
        <div className="relative flex items-center justify-center">
          {/* Wheel Canvas */}
          <div className="relative p-3 rounded-full bg-gradient-to-b from-[#7A00B8]/30 via-white/5 to-transparent border border-[#7A00B8]/40 shadow-[0_0_50px_rgba(122,0,184,0.3)]">
            <canvas
              ref={canvasRef}
              width={460}
              height={460}
              className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] aspect-square"
            />
            {/* Center CR Logo Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0a0212] border-2 border-[#c084fc] shadow-[0_0_20px_rgba(192,132,252,0.5)] flex items-center justify-center overflow-hidden z-20 pointer-events-none">
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

        {/* Selected Winner Spotlight Card */}
        {currentWinner && (
          <div className="mt-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7A00B8]/40 via-purple-950/60 to-[#7A00B8]/40 border border-[#c084fc]/50 shadow-[0_0_30px_rgba(192,132,252,0.3)] text-center animate-in zoom-in-95">
            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#c084fc] flex items-center justify-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Selected Contestant
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
            className="px-8 py-3.5 rounded-2xl bg-[#7A00B8] hover:bg-[#8f12d4] disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(122,0,184,0.4)] hover:shadow-[0_0_35px_rgba(122,0,184,0.6)] transition-all transform hover:scale-105 cursor-pointer"
          >
            <Disc3 className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
            {isSpinning ? "Spinning..." : `Spin The Wheel (${activeNames.length} Sisa)`}
          </button>
        </div>
      </div>
    </div>
  );
}
