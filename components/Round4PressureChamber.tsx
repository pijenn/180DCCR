"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Participant } from "../lib/types.ts";
import { formatTimerDisplay, getParticipantPhoto, getParticipantPhotoPosition } from "../lib/gameEngine.ts";
import { playWheelClick, playSuccessFanfare, playTick, playHurryTick, playBuzzer } from "../lib/audio.ts";
import { Disc3, Clock, Play, Pause, RotateCcw, Flame, UserCheck, Plus, Minus, Trophy, CheckCircle2, Sparkles, LayoutGrid } from "lucide-react";

interface Round4PressureChamberProps {
  spinNames: string[];
  participants: Participant[];
  timeRemainingMs: number;
  timerRunning: boolean;
  selectedWinner: string | null;
  soundEnabled?: boolean;
  isAdmin?: boolean;
  showLeaderboard?: boolean;
  spunWinners?: string[];
  onSpinEnd?: (winnerName: string) => void;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  onResetTimer?: () => void;
  onSetTimerSeconds?: (secs: number) => void;
  onScoreChange?: (participantId: string, delta: number) => void;
  onToggleLeaderboard?: () => void;
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
  spunWinners = [],
  onSpinEnd,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSetTimerSeconds,
  onScoreChange,
  onToggleLeaderboard,
}: Round4PressureChamberProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(externalWinner);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Remaining active candidates on the wheel (exclude already spun winners if available)
  const activeNames =
    spinNames && spinNames.length > 0
      ? spinNames
      : participants.filter((p) => !p.isGoldenTicket).slice(0, 9).map((p) => p.name);

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

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#0c0314";
    ctx.fill();
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#c084fc";
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

  // Ranked Pressure Chamber Candidates (All 9 contenders for Round 5)
  const chamberCandidates = participants
    .filter((p) => !p.isGoldenTicket && (p.eliminatedInRound === undefined || p.eliminatedInRound === null || p.eliminatedInRound >= 5))
    .slice(0, 9)
    .map((p) => {
      const rubric = p.pressureRubric || {};
      const ps = rubric.problemStructuring ?? 0;
      const orig = rubric.originality ?? 0;
      const adapt = rubric.adaptability ?? 0;
      const deck = rubric.deckQuality ?? 0;
      const exec = rubric.executivePresence ?? 0;
      const totalRubric = ps + orig + adapt + deck + exec;
      const effectiveScore = totalRubric > 0 ? totalRubric : p.score;
      return {
        ...p,
        rubric: { ps, orig, adapt, deck, exec },
        calculatedScore: effectiveScore,
      };
    })
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  // --------------------------------------------------------------------------
  // LEADERBOARD VIEW (Image 2 style with Image 1 rubric headers)
  // --------------------------------------------------------------------------
  if (showLeaderboard) {
    return (
      <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 select-none animate-in fade-in duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-[#7A00B8]/30 text-[#c084fc] border border-[#7A00B8]/50">
                <Trophy className="w-4 h-4" /> Round 05 • Pressure Chamber
              </span>
              <span className="text-xs font-mono text-white/50 hidden sm:inline">
                Evaluation Rubric & Final Standings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-1 font-sans">
              Pressure Chamber Official Standings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Top 5 Maju ke Final (Executive Pitch)</span>
            </div>

            {isAdmin && onToggleLeaderboard && (
              <button
                type="button"
                onClick={onToggleLeaderboard}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Disc3 className="w-3.5 h-3.5 text-[#c084fc]" />
                <span>Kembali ke Spin Wheel</span>
              </button>
            )}
          </div>
        </div>

        {/* TV Show Broadcaster Leaderboard Table (Image 2 design with Image 1 titles) */}
        <div className="flex-1 overflow-x-auto overflow-y-auto rounded-2xl bg-[#090312]/90 border border-[#7A00B8]/30 p-2 sm:p-4 shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 pb-2.5 px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-white/50 border-b border-white/10 items-center text-center">
            <div className="col-span-1 text-left">RANK</div>
            <div className="col-span-4 text-left">NAMA PESERTA</div>
            <div className="col-span-1 text-[#f87171] leading-tight" title="Problem Structuring & Analytical Thinking (Max 30)">
              PROBLEM (30)
            </div>
            <div className="col-span-1 text-[#f87171] leading-tight" title="Originality of Recommendation (Max 20)">
              ORIGINAL (20)
            </div>
            <div className="col-span-1 text-[#f87171] leading-tight" title="Adaptability Under Pressure (Max 20)">
              ADAPT (20)
            </div>
            <div className="col-span-1 text-[#f87171] leading-tight" title="Deck Quality & Communication (Max 15)">
              DECK (15)
            </div>
            <div className="col-span-1 text-[#f87171] leading-tight" title="Executive Presence (Max 15)">
              EXEC (15)
            </div>
            <div className="col-span-2 text-right pr-2 text-[#38bdf8]">TOTAL SKOR</div>
          </div>

          {/* Table Rows (Matching Image 2 exact structure) */}
          <div className="space-y-2 mt-2">
            {chamberCandidates.map((p, idx) => {
              const rank = idx + 1;
              const isTop5 = rank <= 5;

              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-12 gap-2 items-center p-2.5 sm:p-3 rounded-xl border transition-all ${
                    isTop5
                      ? "bg-gradient-to-r from-[#0051C3]/20 via-[#7A00B8]/15 to-transparent border-[#7A00B8]/40 shadow-[0_0_15px_rgba(122,0,184,0.15)]"
                      : "bg-white/[0.02] border-white/5 opacity-50"
                  }`}
                >
                  {/* Rank Column */}
                  <div className="col-span-1 flex items-center">
                    <span className="font-mono font-black text-base sm:text-xl text-white">
                      {String(rank).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Name + Avatar + University Column (Cyan/Teal block accent like Image 2) */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-[#00d2ff] flex-shrink-0 bg-neutral-900 shadow-[0_0_12px_rgba(0,210,255,0.4)]">
                      <Image
                        src={p.avatar || getParticipantPhoto(p.name)}
                        alt={p.name}
                        fill
                        sizes="48px"
                        style={{ objectPosition: getParticipantPhotoPosition(p.name) }}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-sans font-black text-sm sm:text-base text-white uppercase tracking-tight truncate">
                        {p.name}
                      </h4>
                      <p className="font-mono text-[10px] sm:text-[11px] text-[#00d2ff] uppercase truncate">
                        {p.university}
                      </p>
                    </div>
                  </div>

                  {/* Criteria 1: Problem Structuring (30) */}
                  <div className="col-span-1 text-center py-2 rounded-lg bg-red-950/40 border border-red-500/20 font-mono font-black text-sm sm:text-base text-white">
                    {p.rubric.ps}
                  </div>

                  {/* Criteria 2: Originality (20) */}
                  <div className="col-span-1 text-center py-2 rounded-lg bg-red-950/40 border border-red-500/20 font-mono font-black text-sm sm:text-base text-white">
                    {p.rubric.orig}
                  </div>

                  {/* Criteria 3: Adaptability (20) */}
                  <div className="col-span-1 text-center py-2 rounded-lg bg-red-950/40 border border-red-500/20 font-mono font-black text-sm sm:text-base text-white">
                    {p.rubric.adapt}
                  </div>

                  {/* Criteria 4: Deck Quality (15) */}
                  <div className="col-span-1 text-center py-2 rounded-lg bg-red-950/40 border border-red-500/20 font-mono font-black text-sm sm:text-base text-white">
                    {p.rubric.deck}
                  </div>

                  {/* Criteria 5: Executive Presence (15) */}
                  <div className="col-span-1 text-center py-2 rounded-lg bg-red-950/40 border border-red-500/20 font-mono font-black text-sm sm:text-base text-white">
                    {p.rubric.exec}
                  </div>

                  {/* Total Skor Column (Deep Blue Solid Box like Image 2) */}
                  <div className="col-span-2 text-right pr-2">
                    <div className="inline-block px-4 py-2 rounded-lg bg-[#0051C3] border border-[#38bdf8]/40 shadow-[0_0_15px_rgba(0,81,195,0.4)]">
                      <span className="font-mono font-black text-base sm:text-lg text-white">
                        {p.calculatedScore.toLocaleString()}
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
  // LIVE SPIN WHEEL VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="stage-panel p-6 sm:p-8 rounded-2xl border-white/10 bg-[#0d0418]/80">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-widest bg-[#7A00B8]/25 text-[#c084fc] border border-[#7A00B8]/50">
                <Flame className="w-3.5 h-3.5 text-[#c084fc]" />
                Round 05
              </span>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-sm bg-white/5 text-white/70 border border-white/10">
                {activeNames.length} Sisa di Roda • 5 Maju ke Final
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2.5 tracking-tight uppercase font-sans">
              Pressure Chamber
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-xl font-mono">
              High-intensity interrogation round. Spin the wheel to pick candidates. Once spun, candidates leave the wheel.
            </p>
          </div>

          {/* Precision Timer Display */}
          <div className="px-6 py-3 rounded-xl bg-black/40 border border-white/10 text-right min-w-[200px]">
            <div className="text-[11px] uppercase font-mono font-bold tracking-wider text-white/50 flex items-center justify-end gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#c084fc]" />
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
            <div className="relative p-2 rounded-full bg-gradient-to-b from-[#7A00B8]/30 via-white/5 to-transparent border border-[#7A00B8]/40 shadow-[0_0_40px_rgba(122,0,184,0.25)]">
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
                className="px-8 py-3.5 rounded-xl bg-[#7A00B8] hover:bg-[#8f12d4] disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(122,0,184,0.4)] hover:shadow-[0_0_35px_rgba(122,0,184,0.6)] transition-all transform hover:scale-105 cursor-pointer"
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
                  <Trophy className="w-4 h-4 text-[#c084fc]" />
                  <span>Leaderboard</span>
                </button>
              )}
            </div>
          </div>

          {/* Selected Contestant Spotlight & Scoreboard */}
          <div className="lg:col-span-6 space-y-4">
            {currentWinner ? (
              <div className="stage-panel p-6 rounded-xl border-[#7A00B8]/60 bg-gradient-to-b from-[#7A00B8]/20 to-transparent shadow-[0_0_30px_rgba(122,0,184,0.25)] animate-in zoom-in-95">
                <div className="text-xs uppercase font-mono font-bold tracking-widest text-[#c084fc] flex items-center gap-1.5 mb-2">
                  <UserCheck className="w-4 h-4" /> Selected For Pressure Chamber
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-sans">{currentWinner}</h3>
                <p className="text-xs font-mono text-white/60 mt-1">
                  Candidate selected to enter the hot seat. Prepare for executive grilling!
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-white/10 text-center bg-white/[0.01]">
                <Disc3 className="w-8 h-8 text-white/30 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-mono text-white/60">
                  Ready to spin. Tap &quot;Spin The Wheel&quot; to pick the next contestant.
                </p>
              </div>
            )}

            {/* Chamber Candidates (Active on Wheel + Spun Winners) */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-white/70">
                  Chamber Contestants ({chamberCandidates.length} Active)
                </span>
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#c084fc]">
                  Score
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {chamberCandidates.map((p, idx) => {
                  const isCurrent = currentWinner === p.name;
                  const isSpun = !activeNames.includes(p.name);

                  return (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-lg flex items-center justify-between text-xs transition-all ${
                        isCurrent
                          ? "bg-[#7A00B8]/30 border border-[#7A00B8]/60 font-bold"
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
                        <span className="font-mono font-black text-sm text-[#c084fc]">
                          {p.calculatedScore}
                        </span>

                        {isAdmin && onScoreChange && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onScoreChange(p.id, 10)}
                              title="+10 pts"
                              className="p-1 rounded bg-[#7A00B8]/30 hover:bg-[#7A00B8]/50 text-[#c084fc]"
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
