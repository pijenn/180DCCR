"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Participant } from "../lib/types.ts";
import { calculateLeaderboard, formatTimerDisplay } from "../lib/gameEngine.ts";
import { playWheelClick, playGrandFanfare } from "../lib/audio.ts";
import {
  Trophy,
  Crown,
  Disc3,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  PartyPopper,
} from "lucide-react";

interface Round5ExecutivePitchProps {
  spinNames: string[];
  participants: Participant[];
  timeRemainingMs: number;
  timerRunning: boolean;
  gameEnded: boolean;
  selectedWinner: string | null;
  soundEnabled?: boolean;
  isAdmin?: boolean;
  onSpinEnd?: (winnerName: string) => void;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  onResetTimer?: () => void;
  onEndGame?: () => void;
  onScoreChange?: (participantId: string, delta: number) => void;
}

export function Round5ExecutivePitch({
  spinNames,
  participants,
  timeRemainingMs,
  timerRunning,
  gameEnded,
  selectedWinner: externalWinner,
  soundEnabled = true,
  isAdmin = false,
  onSpinEnd,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onEndGame,
  onScoreChange,
}: Round5ExecutivePitchProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(externalWinner);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // 5 names guaranteed
  const activeNames = spinNames.length > 0 ? spinNames : participants.slice(0, 5).map((p) => p.name);

  // Ranked participants
  const ranked = calculateLeaderboard(participants);

  // Draw 5-slice wheel
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

    const numSlices = activeNames.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    const sliceColors = ["#8cc63f", "#005a36", "#d97706", "#111827", "#00bb7f"];

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

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = sliceColors[i % sliceColors.length] === "#8cc63f" ? "#000000" : "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 4;

      const name = activeNames[i];
      const truncated = name.length > 18 ? name.substring(0, 17) + "…" : name;
      ctx.fillText(truncated, radius - 22, 5);
      ctx.restore();
    }

    // Outer wheel border with golden glow
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#080a09";
    ctx.fill();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FINAL", 0, 0);

    ctx.restore();

    // Top Pointer Arrow
    ctx.save();
    ctx.translate(centerX, centerY - radius + 5);
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(-14, -12);
    ctx.lineTo(14, -12);
    ctx.closePath();
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }, [activeNames]);

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  // Grand Finale Confetti & Fireworks
  const triggerGrandConfetti = useCallback(() => {
    try {
      const end = Date.now() + 4000;
      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: ["#fbbf24", "#8cc63f", "#ffffff", "#34d399"],
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: ["#fbbf24", "#8cc63f", "#ffffff", "#34d399"],
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch {
      // Confetti safety
    }
  }, []);

  // Spin wheel
  const spinWheel = () => {
    if (isSpinning || activeNames.length === 0) return;
    setIsSpinning(true);
    setCurrentWinner(null);

    const totalRounds = 6 + Math.random() * 4;
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
        playGrandFanfare(soundEnabled);
        if (onSpinEnd) {
          onSpinEnd(winner);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // End Game Champion trigger
  useEffect(() => {
    if (gameEnded) {
      triggerGrandConfetti();
      playGrandFanfare(soundEnabled);
    }
  }, [gameEnded, soundEnabled, triggerGrandConfetti]);

  return (
    <div className="w-full space-y-8">
      {/* Grand Finale Header */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-neutral-900/60 to-black relative overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse">
                <Crown className="w-4 h-4 text-amber-400" />
                Grand Finale • Round 5
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white">
                5 Finalists Showdown
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight uppercase gold-gradient">
              Executive Pitch
            </h1>
            <p className="text-sm text-white/70 mt-1 max-w-xl">
              The decisive boardroom pitch. Finalists present turnaround recommendations directly to C-level judges to determine the grand champion.
            </p>
          </div>

          {/* Precision Pitch Timer */}
          <div className="glass-card px-6 py-4 rounded-2xl border-amber-500/30 text-right min-w-[220px] shadow-[0_0_20px_rgba(251,191,36,0.15)]">
            <div className="text-xs uppercase font-extrabold tracking-wider text-amber-300 flex items-center justify-end gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Executive Pitch Timer
            </div>
            <div
              className={`font-mono text-3xl sm:text-4xl font-black tracking-wider ${
                timeRemainingMs <= 10000 && timeRemainingMs > 0 ? "text-red-500 animate-pulse" : "text-white"
              }`}
            >
              {formatTimerDisplay(timeRemainingMs)}
            </div>
          </div>
        </div>

        {/* Spin Wheel & Finalist Pitch Selector */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 5-Name Spin Wheel */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative p-2 rounded-full bg-gradient-to-b from-amber-400/30 via-white/5 to-transparent border border-amber-400/40 shadow-[0_0_50px_rgba(251,191,36,0.25)]">
              <canvas
                ref={canvasRef}
                width={380}
                height={380}
                className="w-full max-w-[320px] sm:max-w-[360px] aspect-square"
              />
            </div>

            <button
              onClick={spinWheel}
              disabled={isSpinning || activeNames.length === 0}
              className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-black font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all transform hover:scale-105"
            >
              <Disc3 className={`w-5 h-5 ${isSpinning ? "animate-spin" : ""}`} />
              {isSpinning ? "Spinning 5 Finalists..." : "Spin Finalist Wheel (5 Names)"}
            </button>
          </div>

          {/* Selected Finalist & Admin Controls */}
          <div className="lg:col-span-7 space-y-4">
            {currentWinner ? (
              <div className="glass-panel p-6 rounded-2xl border-amber-400/50 bg-gradient-to-b from-amber-400/20 to-transparent shadow-[0_0_35px_rgba(251,191,36,0.3)] animate-in zoom-in-95">
                <div className="text-xs uppercase font-extrabold tracking-widest text-amber-300 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-300" /> Currently Pitching To Executive Board
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{currentWinner}</h3>
                <p className="text-xs text-white/70 mt-1">
                  Finalist has taken the podium. Board members: prepare executive scoring!
                </p>
              </div>
            ) : (
              <div className="glass-card p-6 rounded-2xl border-dashed border-amber-400/30 text-center">
                <Disc3 className="w-8 h-8 text-amber-400/50 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white/70">
                  Spin the 5-Name Wheel above to determine the pitch order for the Grand Finale.
                </p>
              </div>
            )}

            {/* Finalist Score Management (NAME | SCORE) */}
            <div className="glass-card p-4 rounded-2xl border-white/10">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
                  Top Finalists (NAME | SCORE)
                </span>
                <span className="text-xs uppercase font-extrabold tracking-wider text-white/50">
                  Live Standings
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {activeNames.map((name, idx) => {
                  const participant = participants.find((p) => p.name === name);
                  const isCurrent = currentWinner === name;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl flex items-center justify-between text-xs transition-all ${
                        isCurrent
                          ? "bg-amber-400/20 border border-amber-400/40 font-bold"
                          : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-[11px] font-black">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white truncate max-w-[200px] sm:max-w-[260px]">
                          {name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-[#8cc63f]">
                          {participant ? participant.score : 0}
                        </span>

                        {isAdmin && participant && onScoreChange && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onScoreChange(participant.id, 50)}
                              title="+50 pts"
                              className="px-2 py-1 rounded bg-[#8cc63f]/20 hover:bg-[#8cc63f]/40 text-[#8cc63f] font-bold"
                            >
                              +50
                            </button>
                            <button
                              onClick={() => onScoreChange(participant.id, -50)}
                              title="-50 pts"
                              className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold"
                            >
                              -50
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin Timer & End Game Controller */}
            {isAdmin && (
              <div className="glass-card p-4 rounded-2xl border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {timerRunning ? (
                    <button
                      onClick={onPauseTimer}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase flex items-center gap-1.5"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={onStartTimer}
                      className="px-4 py-1.5 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" /> Start
                    </button>
                  )}
                  <button
                    onClick={onResetTimer}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Timer
                  </button>
                </div>

                {onEndGame && (
                  <button
                    onClick={onEndGame}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all"
                  >
                    <PartyPopper className="w-4 h-4" />
                    End Game & Reveal Winner
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grand Finale Fancy Podium Leaderboard (1st, 2nd, 3rd Highlighted) */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" /> TV Show Final Standings
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Finalist Podium & Winner Ceremony
          </h2>
          <p className="text-xs text-white/50">
            Top 3 highlighted with grand presentation styling.
          </p>
        </div>

        {/* Fancy Top 3 Podium */}
        {ranked.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-5xl mx-auto pt-4">
            {/* 2nd Place Silver */}
            <div className="order-2 md:order-1 glass-card p-6 rounded-3xl border-slate-300/40 bg-gradient-to-b from-slate-300/10 via-neutral-900/60 to-black flex flex-col items-center text-center shadow-[0_0_30px_rgba(203,213,225,0.15)] relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-black font-black text-base flex items-center justify-center mb-3 shadow-lg">
                2
              </div>
              <div className="relative w-20 h-20 rounded-full ring-4 ring-slate-300 overflow-hidden mb-3 shadow-xl">
                <Image
                  src={ranked[1].avatar || "/participants/khal.webp"}
                  alt={ranked[1].name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider mb-1">
                Runner Up
              </span>
              <h3 className="font-extrabold text-base text-white line-clamp-1">{ranked[1].name}</h3>
              <p className="text-xs text-white/50 line-clamp-1 mb-4">{ranked[1].university}</p>
              <div className="w-full py-2.5 rounded-2xl bg-white/10 border border-white/10 font-black text-lg text-white">
                {ranked[1].score.toLocaleString()} <span className="text-xs text-slate-300 font-semibold">PTS</span>
              </div>
            </div>

            {/* 1st Place Gold Champion (Elevated & Pulsing) */}
            <div className="order-1 md:order-2 glass-panel p-8 rounded-3xl border-amber-400 bg-gradient-to-b from-amber-400/25 via-neutral-900 to-black flex flex-col items-center text-center shadow-[0_0_60px_rgba(251,191,36,0.35)] relative overflow-hidden transform md:-translate-y-4 ring-2 ring-amber-400/60">
              <div className="absolute top-3 right-3 text-amber-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/30 border border-amber-400/50 animate-pulse">
                👑 Champion
              </div>

              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-black font-black text-2xl flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(251,191,36,0.6)]">
                <Trophy className="w-7 h-7 fill-black" />
              </div>

              <div className="relative w-28 h-28 rounded-full ring-4 ring-amber-400 overflow-hidden mb-3 shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                <Image
                  src={ranked[0].avatar || "/participants/khal.webp"}
                  alt={ranked[0].name}
                  fill
                  className="object-cover"
                />
              </div>

              <span className="text-xs uppercase font-black text-amber-300 tracking-widest mb-1">
                Grand Winner
              </span>
              <h3 className="font-black text-lg sm:text-xl text-white line-clamp-1">{ranked[0].name}</h3>
              <p className="text-xs text-amber-300/80 font-semibold line-clamp-1 mb-4">{ranked[0].university}</p>

              <div className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black text-xl shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                {ranked[0].score.toLocaleString()} <span className="text-xs uppercase font-extrabold">PTS</span>
              </div>
            </div>

            {/* 3rd Place Bronze */}
            <div className="order-3 glass-card p-6 rounded-3xl border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-neutral-900/60 to-black flex flex-col items-center text-center shadow-[0_0_30px_rgba(180,83,9,0.15)] relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-black font-black text-base flex items-center justify-center mb-3 shadow-lg">
                3
              </div>
              <div className="relative w-20 h-20 rounded-full ring-4 ring-amber-600 overflow-hidden mb-3 shadow-xl">
                <Image
                  src={ranked[2].avatar || "/participants/khal.webp"}
                  alt={ranked[2].name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider mb-1">
                3rd Place
              </span>
              <h3 className="font-extrabold text-base text-white line-clamp-1">{ranked[2].name}</h3>
              <p className="text-xs text-white/50 line-clamp-1 mb-4">{ranked[2].university}</p>
              <div className="w-full py-2.5 rounded-2xl bg-white/10 border border-white/10 font-black text-lg text-white">
                {ranked[2].score.toLocaleString()} <span className="text-xs text-amber-400 font-semibold">PTS</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
