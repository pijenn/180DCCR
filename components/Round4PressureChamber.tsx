"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Participant } from "../lib/types.ts";
import { formatTimerDisplay } from "../lib/gameEngine.ts";
import { playWheelClick, playSuccessFanfare, playTick, playHurryTick, playBuzzer } from "../lib/audio.ts";
import { Disc3, Clock, Play, Pause, RotateCcw, Flame, UserCheck, Plus, Minus } from "lucide-react";

interface Round4PressureChamberProps {
  spinNames: string[];
  participants: Participant[];
  timeRemainingMs: number;
  timerRunning: boolean;
  selectedWinner: string | null;
  soundEnabled?: boolean;
  isAdmin?: boolean;
  onSpinEnd?: (winnerName: string) => void;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  onResetTimer?: () => void;
  onSetTimerSeconds?: (secs: number) => void;
  onScoreChange?: (participantId: string, delta: number) => void;
}

export function Round4PressureChamber({
  spinNames,
  participants,
  timeRemainingMs,
  timerRunning,
  selectedWinner: externalWinner,
  soundEnabled = true,
  isAdmin = false,
  onSpinEnd,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSetTimerSeconds,
  onScoreChange,
}: Round4PressureChamberProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(externalWinner);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // 9 names fallback or guaranteed
  const activeNames = spinNames.length > 0 ? spinNames : participants.slice(0, 9).map((p) => p.name);

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

    const numSlices = activeNames.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    const sliceColors = [
      "#005a36",
      "#1a2e22",
      "#8cc63f",
      "#111827",
      "#007956",
      "#27272a",
      "#00bb7f",
      "#090c0a",
      "#15803d",
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
      ctx.fillStyle = sliceColors[i % sliceColors.length] === "#8cc63f" ? "#000000" : "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 4;

      const name = activeNames[i];
      const truncated = name.length > 16 ? name.substring(0, 15) + "…" : name;
      ctx.fillText(truncated, radius - 20, 5);
      ctx.restore();
    }

    // Outer wheel ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#8cc63f";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#080a09";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#8cc63f";
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
    ctx.strokeStyle = "#8cc63f";
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

  const secLeft = Math.floor(timeRemainingMs / 1000);

  // Timer audio
  useEffect(() => {
    if (!timerRunning) return;
    if (secLeft <= 5 && secLeft > 0) {
      playHurryTick(soundEnabled);
    } else if (secLeft > 0) {
      playTick(soundEnabled);
    } else if (timeRemainingMs <= 100 && secLeft === 0) {
      playBuzzer(soundEnabled);
    }
  }, [secLeft, timerRunning, soundEnabled, timeRemainingMs]);

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                Round 4
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70">
                9 Candidates Roulette
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight uppercase">
              Pressure Chamber
            </h1>
            <p className="text-sm text-white/60 mt-1 max-w-xl">
              High-intensity interrogation round. Spin the wheel among 9 shortlisted candidates to face the executive panel.
            </p>
          </div>

          {/* Precision Timer Display */}
          <div className="glass-card px-6 py-3 rounded-2xl border-white/10 text-right min-w-[200px]">
            <div className="text-xs uppercase font-extrabold tracking-wider text-white/50 flex items-center justify-end gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#8cc63f]" />
              Timer Countdown
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

        {/* Spin Wheel Arena */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Wheel Display Canvas */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative p-2 rounded-full bg-gradient-to-b from-[#8cc63f]/20 via-white/5 to-transparent border border-white/10 shadow-[0_0_40px_rgba(140,198,63,0.15)]">
              <canvas
                ref={canvasRef}
                width={420}
                height={420}
                className="w-full max-w-[340px] sm:max-w-[400px] aspect-square"
              />
            </div>

            <button
              onClick={spinWheel}
              disabled={isSpinning || activeNames.length === 0}
              className="mt-6 px-8 py-3.5 rounded-2xl bg-[#8cc63f] hover:bg-[#9de047] disabled:opacity-50 text-black font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(140,198,63,0.4)] hover:shadow-[0_0_35px_rgba(140,198,63,0.6)] transition-all transform hover:scale-105"
            >
              <Disc3 className={`w-5 h-5 ${isSpinning ? "animate-spin" : ""}`} />
              {isSpinning ? "Spinning Chamber..." : "Spin The Wheel (9 Names)"}
            </button>
          </div>

          {/* Selected Contestant Spotlight & Scoreboard */}
          <div className="lg:col-span-6 space-y-4">
            {currentWinner ? (
              <div className="glass-panel p-6 rounded-2xl border-[#8cc63f]/50 bg-gradient-to-b from-[#8cc63f]/15 to-transparent shadow-[0_0_30px_rgba(140,198,63,0.2)] animate-in zoom-in-95">
                <div className="text-xs uppercase font-extrabold tracking-widest text-[#8cc63f] flex items-center gap-1.5 mb-2">
                  <UserCheck className="w-4 h-4" /> Selected For Pressure Chamber
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{currentWinner}</h3>
                <p className="text-xs text-white/60 mt-1">
                  Candidate selected to enter the hot seat. Prepare for executive grilling!
                </p>
              </div>
            ) : (
              <div className="glass-card p-6 rounded-2xl border-dashed border-white/10 text-center">
                <Disc3 className="w-8 h-8 text-white/30 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white/60">
                  Ready to spin. Tap &quot;Spin The Wheel&quot; to pick the next contestant.
                </p>
              </div>
            )}

            {/* Chamber Candidates (9 Names | Score Table) */}
            <div className="glass-card p-4 rounded-2xl border-white/10">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                <span className="text-xs uppercase font-extrabold tracking-wider text-white/70">
                  Chamber Contestants (9 Active)
                </span>
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#8cc63f]">
                  Score
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {activeNames.map((name, idx) => {
                  const participant = participants.find((p) => p.name === name);
                  const isWinner = currentWinner === name;

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-all ${
                        isWinner
                          ? "bg-[#8cc63f]/20 border border-[#8cc63f]/40 font-bold"
                          : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white/60 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white truncate max-w-[180px] sm:max-w-[240px]">
                          {name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#8cc63f]">
                          {participant ? participant.score : 0}
                        </span>

                        {isAdmin && participant && onScoreChange && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onScoreChange(participant.id, 20)}
                              title="+20 pts"
                              className="p-1 rounded bg-[#8cc63f]/20 hover:bg-[#8cc63f]/40 text-[#8cc63f]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onScoreChange(participant.id, -20)}
                              title="-20 pts"
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

            {/* Admin Timer Controller Bar */}
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
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                {onSetTimerSeconds && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <span>Preset:</span>
                    {[30, 60, 90, 120].map((s) => (
                      <button
                        key={s}
                        onClick={() => onSetTimerSeconds(s)}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-white/80 border border-white/10"
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
