"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Participant } from "../lib/types.ts";
import { formatTimerDisplay, getParticipantPhoto, getParticipantPhotoPosition } from "../lib/gameEngine.ts";
import { playWheelClick, playGrandFanfare, playSuccessFanfare, playTick, playHurryTick, playBuzzer } from "../lib/audio.ts";
import { Award, Clock, Play, Pause, RotateCcw, Flame, UserCheck, Plus, Minus, Trophy, Crown, CheckCircle2, Sparkles, LayoutGrid, Disc3, PartyPopper } from "lucide-react";

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
  spunWinners?: string[];
  onSpinEnd?: (winnerName: string) => void;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  onResetTimer?: () => void;
  onEndGame?: () => void;
  onScoreChange?: (participantId: string, delta: number) => void;
  onToggleLeaderboard?: () => void;
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
  spunWinners = [],
  onSpinEnd,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onEndGame,
  onScoreChange,
  onToggleLeaderboard,
}: Round5ExecutivePitchProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(externalWinner);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Remaining active candidates on the wheel (exclude already spun finalists)
  const finalistsList = participants
    .filter((p) => p.eliminatedInRound === undefined || p.eliminatedInRound === null || p.eliminatedInRound >= 6)
    .slice(0, 5);

  const activeNames =
    spinNames && spinNames.length > 0
      ? spinNames
      : finalistsList.map((p) => p.name);

  // Ranked Finalists by total score
  const rankedFinalists = [...finalistsList].sort((a, b) => b.score - a.score);

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

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#120500";
    ctx.fill();
    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("180", 0, 0);

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

  // Grand Finale Confetti
  const triggerGrandConfetti = useCallback(() => {
    try {
      const end = Date.now() + 4000;
      const frame = () => {
        confetti({
          particleCount: 8,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: ["#fbbf24", "#d97706", "#f59e0b", "#ffffff"],
        });
        confetti({
          particleCount: 8,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: ["#fbbf24", "#d97706", "#f59e0b", "#ffffff"],
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch {
      // Confetti fallback
    }
  }, []);

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

  const secLeft = Math.floor(timeRemainingMs / 1000);
  const lastPlayedSecRef = useRef<number>(-1);

  // Timer audio
  useEffect(() => {
    if (!timerRunning) {
      lastPlayedSecRef.current = -1;
      return;
    }
    if (secLeft !== lastPlayedSecRef.current) {
      lastPlayedSecRef.current = secLeft;
      if (secLeft <= 5 && secLeft > 0) {
        playHurryTick(soundEnabled);
      } else if (secLeft > 0) {
        playTick(soundEnabled);
      } else if (secLeft === 0) {
        playBuzzer(soundEnabled);
      }
    }
  }, [secLeft, timerRunning, soundEnabled]);

  // Trigger celebration on game ended
  useEffect(() => {
    if (gameEnded) {
      triggerGrandConfetti();
      playGrandFanfare(soundEnabled);
    }
  }, [gameEnded, soundEnabled, triggerGrandConfetti]);

  const isShowingLeaderboard = showLeaderboard || gameEnded;

  // --------------------------------------------------------------------------
  // LEADERBOARD / FINAL STANDINGS VIEW (Broadcast TV Show Style)
  // --------------------------------------------------------------------------
  if (isShowingLeaderboard) {
    return (
      <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 select-none animate-in fade-in duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-[#D95B00]/25 text-[#fbbf24] border border-[#D95B00]/50">
                <Trophy className="w-4 h-4 text-[#fbbf24]" /> Round 06 • Executive Pitch
              </span>
              <span className="text-xs font-mono text-white/50 hidden sm:inline">
                Grand Finale Official Standings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-1 font-sans gold-gradient">
              TV Show Final Standings & Winners
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Juara 1-3 & Harapan 1-2</span>
            </div>

            {isAdmin && onToggleLeaderboard && (
              <button
                type="button"
                onClick={onToggleLeaderboard}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Disc3 className="w-3.5 h-3.5 text-[#fb923c]" />
                <span>Kembali ke Spin Wheel</span>
              </button>
            )}
          </div>
        </div>

        {/* TV Show Broadcaster Leaderboard Table (Executive Pitch Theme) */}
        <div className="flex-1 overflow-x-auto overflow-y-auto rounded-2xl bg-[#0d0400]/90 border border-[#D95B00]/30 p-2 sm:p-4 shadow-2xl space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 pb-2.5 px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-white/50 border-b border-white/10 items-center text-center">
            <div className="col-span-1 text-left">RANK</div>
            <div className="col-span-5 text-left">NAMA FINALIS</div>
            <div className="col-span-2 text-center text-[#fb923c]">TITLE / PRESTASI</div>
            <div className="col-span-2 text-center text-white/60">STATUS</div>
            <div className="col-span-2 text-right pr-2 text-[#38bdf8]">TOTAL SKOR</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2 mt-2">
            {rankedFinalists.map((p, idx) => {
              const rank = idx + 1;
              const is1st = rank === 1;
              const is2nd = rank === 2;
              const is3rd = rank === 3;

              const titles = [
                "🏆 1st Place Winner",
                "🥈 2nd Place Runner Up",
                "🥉 3rd Place Winner",
                "Harapan 1",
                "Harapan 2",
              ];
              const titleText = titles[idx] || `Finalist #${rank}`;

              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl border transition-all ${
                    is1st
                      ? "bg-gradient-to-r from-amber-500/25 via-[#D95B00]/20 to-transparent border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50 scale-[1.01]"
                      : is2nd
                      ? "bg-gradient-to-r from-slate-300/15 via-[#D95B00]/10 to-transparent border-slate-300/40 shadow-[0_0_15px_rgba(203,213,225,0.15)]"
                      : is3rd
                      ? "bg-gradient-to-r from-amber-700/15 via-[#D95B00]/10 to-transparent border-amber-700/40 shadow-[0_0_15px_rgba(180,83,9,0.15)]"
                      : "bg-white/[0.02] border-white/5 opacity-80"
                  }`}
                >
                  {/* Rank Column */}
                  <div className="col-span-1 flex items-center gap-1.5">
                    {is1st && <Crown className="w-5 h-5 text-amber-400 fill-amber-400 flex-shrink-0 animate-bounce" />}
                    <span className={`font-mono font-black text-base sm:text-xl ${is1st ? "text-amber-300" : "text-white"}`}>
                      {String(rank).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Name + Avatar + University */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-neutral-900 shadow-md ${
                      is1st ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]" : "border-[#00d2ff]"
                    }`}>
                      <Image
                        src={p.avatar || getParticipantPhoto(p.name)}
                        alt={p.name}
                        fill
                        sizes="52px"
                        style={{ objectPosition: getParticipantPhotoPosition(p.name) }}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-sans font-black text-sm sm:text-base uppercase tracking-tight truncate ${
                        is1st ? "text-amber-300" : "text-white"
                      }`}>
                        {p.name}
                      </h4>
                      <p className="font-mono text-[10px] sm:text-[11px] text-[#00d2ff] uppercase truncate">
                        {p.university}
                      </p>
                    </div>
                  </div>

                  {/* Title / Prestasi Column */}
                  <div className="col-span-2 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold uppercase ${
                      is1st
                        ? "bg-amber-400 text-black shadow-sm font-black"
                        : is2nd
                        ? "bg-slate-200 text-black font-black"
                        : is3rd
                        ? "bg-amber-700/60 text-amber-200 border border-amber-600/40"
                        : "bg-white/5 text-white/70"
                    }`}>
                      {titleText}
                    </span>
                  </div>

                  {/* Status Column */}
                  <div className="col-span-2 text-center">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                      Finalist Official
                    </span>
                  </div>

                  {/* Total Skor Column (Deep Blue Solid Box like Image 2) */}
                  <div className="col-span-2 text-right pr-2">
                    <div className={`inline-block px-4 py-2 rounded-lg border shadow-md ${
                      is1st
                        ? "bg-[#D95B00] border-amber-300/60 shadow-[0_0_15px_rgba(217,91,0,0.5)] text-white"
                        : "bg-[#0051C3] border-[#38bdf8]/40 shadow-[0_0_15px_rgba(0,81,195,0.4)] text-white"
                    }`}>
                      <span className="font-mono font-black text-base sm:text-lg">
                        {p.score.toLocaleString()}
                      </span>
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

  // --------------------------------------------------------------------------
  // LIVE SPIN WHEEL VIEW (Exact mirror of Pressure Chamber in Orange/Amber theme)
  // --------------------------------------------------------------------------
  return (
    <div className="w-full space-y-6 select-none animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="stage-panel p-6 sm:p-8 rounded-2xl border-white/10 bg-[#0d0400]/80">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-widest bg-[#D95B00]/25 text-[#fbbf24] border border-[#D95B00]/50">
                <Flame className="w-3.5 h-3.5 text-[#fbbf24]" />
                Round 06
              </span>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-sm bg-white/5 text-white/70 border border-white/10">
                {activeNames.length} Sisa di Roda • 5 Finalis Bersaing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2.5 tracking-tight uppercase font-sans gold-gradient">
              Executive Pitch
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-xl font-mono">
              Final presentation round. Spin the wheel to pick the finalist order. Once spun, finalists leave the wheel.
            </p>
          </div>

          {/* Precision Timer Display */}
          <div className="px-6 py-3 rounded-xl bg-black/40 border border-white/10 text-right min-w-[200px]">
            <div className="text-[11px] uppercase font-mono font-bold tracking-wider text-white/50 flex items-center justify-end gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#fb923c]" />
              Timer Countdown
            </div>
            <div
              className={`font-mono text-3xl sm:text-4xl font-black tracking-wider ${
                timeRemainingMs <= 10000 && timeRemainingMs > 0 && timerRunning
                  ? "text-red-500 animate-pulse"
                  : "text-white"
              }`}
            >
              {formatTimerDisplay(timeRemainingMs)}
            </div>
          </div>
        </div>

        {/* Spin Wheel Arena */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Wheel Display Canvas */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative p-2 rounded-full bg-gradient-to-b from-[#D95B00]/30 via-white/5 to-transparent border border-[#D95B00]/40 shadow-[0_0_40px_rgba(217,91,0,0.25)]">
              <canvas
                ref={canvasRef}
                width={420}
                height={420}
                className="w-full max-w-[340px] sm:max-w-[400px] aspect-square"
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={spinWheel}
                disabled={isSpinning || activeNames.length === 0}
                className="px-8 py-3.5 rounded-xl bg-[#D95B00] hover:bg-[#eb6a0a] disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(217,91,0,0.4)] hover:shadow-[0_0_35px_rgba(217,91,0,0.6)] transition-all transform hover:scale-105 cursor-pointer active:scale-95"
              >
                <Disc3 className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
                {isSpinning ? "Spinning..." : `Spin The Wheel (${activeNames.length} Sisa)`}
              </button>

              {isAdmin && onToggleLeaderboard && (
                <button
                  type="button"
                  onClick={onToggleLeaderboard}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Trophy className="w-4 h-4 text-[#fbbf24]" />
                  <span>Leaderboard</span>
                </button>
              )}
            </div>
          </div>

          {/* Selected Contestant Spotlight & Scoreboard */}
          <div className="lg:col-span-6 space-y-4">
            {currentWinner ? (
              <div className="stage-panel p-6 rounded-xl border-[#D95B00]/60 bg-gradient-to-b from-[#D95B00]/20 to-transparent shadow-[0_0_30px_rgba(217,91,0,0.25)] animate-in zoom-in-95">
                <div className="text-xs uppercase font-mono font-bold tracking-widest text-[#fbbf24] flex items-center gap-1.5 mb-2">
                  <UserCheck className="w-4 h-4" /> Selected For Executive Pitch
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-sans">{currentWinner}</h3>
                <p className="text-xs font-mono text-white/60 mt-1">
                  Finalist on the podium. Presenting the executive recommendation.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-white/10 text-center bg-white/[0.01]">
                <Disc3 className="w-8 h-8 text-white/30 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-mono text-white/60">
                  Ready to spin. Tap &quot;Spin The Wheel&quot; to pick the next finalist.
                </p>
              </div>
            )}

            {/* Finalists List (Active on Wheel + Spun Finalists) */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-white/70">
                  Contenders ({finalistsList.length} Finalists)
                </span>
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#fbbf24]">
                  Score
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {finalistsList.map((p, idx) => {
                  const isCurrent = currentWinner === p.name;
                  const isSpun = !activeNames.includes(p.name);

                  return (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-lg flex items-center justify-between text-xs transition-all ${
                        isCurrent
                          ? "bg-[#D95B00]/30 border border-[#D95B00]/60 font-bold"
                          : isSpun
                          ? "bg-white/[0.02] border border-white/5 opacity-50"
                          : "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white/60 flex items-center justify-center text-[10px] font-mono font-bold">
                          {idx + 1}
                        </span>
                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                          <Image
                            src={p.avatar || getParticipantPhoto(p.name)}
                            alt={p.name}
                            fill
                            sizes="24px"
                            style={{ objectPosition: getParticipantPhotoPosition(p.name) }}
                            className="object-cover"
                          />
                        </div>
                        <span className="font-semibold text-white truncate max-w-[180px] sm:max-w-[220px]">
                          {p.name}
                        </span>
                        {isSpun && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                            Sudah Tampil
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#fbbf24]">
                          {p.score}
                        </span>

                        {isAdmin && onScoreChange && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onScoreChange(p.id, 10)}
                              title="+10 pts"
                              className="p-1 rounded bg-[#D95B00]/30 hover:bg-[#D95B00]/50 text-[#fbbf24]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onScoreChange(p.id, -10)}
                              title="-10 pts"
                              className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
