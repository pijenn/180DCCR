"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Participant } from "../lib/types.ts";
import {
  formatPrecisionCountdown,
  calculateLeaderboard,
  isGoldenTicket,
  getParticipantPhoto,
  getParticipantPhotoPosition,
  getActiveRoundParticipants,
} from "../lib/gameEngine.ts";
import { playTick, playHurryTick, playBuzzer } from "../lib/audio.ts";
import { Play, Pause, RotateCcw, Flame, Trophy, Sparkles, LayoutGrid, Clock } from "lucide-react";

interface Round3RootmasterProps {
  participants?: Participant[];
  timeRemainingMs: number;
  timerRunning: boolean;
  soundEnabled?: boolean;
  isAdmin?: boolean;
  showLeaderboard?: boolean;
  onToggleLeaderboard?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSetDuration?: (mins: number) => void;
}

export function Round3Rootmaster({
  participants = [],
  timeRemainingMs,
  timerRunning,
  soundEnabled = true,
  isAdmin = false,
  showLeaderboard = false,
  onToggleLeaderboard,
  onStart,
  onPause,
  onReset,
  onSetDuration,
}: Round3RootmasterProps) {
  const totalSec = Math.floor(timeRemainingMs / 1000);
  const lastPlayedSecRef = useRef<number>(-1);

  // Audio tick trigger (runs only once per full second tick)
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

  // Active contenders in Round 3 (non-golden-ticket, active / not eliminated in earlier rounds)
  const rootmasterParticipants = getActiveRoundParticipants(participants, 3);

  const rankedRootmaster = calculateLeaderboard(rootmasterParticipants);
  const top12 = rankedRootmaster.slice(0, 12);
  const dangerZone = rankedRootmaster.slice(12);

  // =========================================================================
  // LEADERBOARD VIEW (Gauntlet & Sacred Handoff Design Style with Elimination Zone)
  // =========================================================================
  if (showLeaderboard) {
    return (
      <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Trophy className="w-4 h-4" /> Klasemen Round 3: Rootmaster
              </span>
              <span className="text-xs font-mono text-white/60 hidden sm:inline">
                {rootmasterParticipants.length} Kontender
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-1 font-sans">
              Rootmaster Leaderboard
            </h2>
          </div>

          {/* Action / Badges */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
              <span>{top12.length} Lolos (Top 12)</span>
            </div>
            {dangerZone.length > 0 && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-mono font-bold">
                <span>{dangerZone.length} Gugur (Zona Eliminasi)</span>
              </div>
            )}
            {onToggleLeaderboard && (
              <button
                type="button"
                onClick={onToggleLeaderboard}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Timer Countdown</span>
              </button>
            )}
          </div>
        </div>

        {/* 12-Column Two-Zone Arena (Top 12 Safe Zone vs Danger Zone) */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
          {/* TOP 12 QUALIFIED (Safe Zone) */}
          <div className={`${dangerZone.length > 0 ? "col-span-12 lg:col-span-8" : "col-span-12"} flex flex-col min-h-0 h-full rounded-2xl bg-black/40 border border-white/10 p-2.5 sm:p-3 overflow-hidden`}>
            <div className="flex items-center justify-between px-1.5 pb-2 flex-shrink-0 border-b border-white/10 mb-2">
              <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                Kualifikasi Lolos Sacred Handoff (Peringkat 1 - 12)
              </span>
              <span className="text-xs text-white/50 font-mono font-bold">
                {top12.length} / {rootmasterParticipants.length} PESERTA
              </span>
            </div>

            {/* Responsive grid for top 12 */}
            <div className={`flex-1 grid grid-cols-1 sm:grid-cols-2 ${dangerZone.length > 0 ? "md:grid-cols-3" : "md:grid-cols-4"} gap-2 min-h-0 overflow-y-auto pr-1`}>
              {top12.map((p, idx) => {
                const rank = idx + 1;
                const isGold = rank === 1;
                const isSilver = rank === 2;
                const isBronze = rank === 3;

                return (
                  <div
                    key={p.id}
                    className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2.5 transition-all overflow-hidden ${
                      isGold
                        ? "bg-gradient-to-r from-amber-500/25 via-yellow-500/10 to-transparent border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
                        : isSilver
                        ? "bg-gradient-to-r from-slate-300/25 via-slate-400/10 to-transparent border-slate-300/60"
                        : isBronze
                        ? "bg-gradient-to-r from-amber-700/25 via-amber-800/10 to-transparent border-amber-600/60"
                        : "bg-white/[0.04] border-white/10 hover:border-amber-500/40 hover:bg-amber-500/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs sm:text-sm flex-shrink-0 ${
                          isGold
                            ? "bg-amber-400 text-black shadow-md"
                            : isSilver
                            ? "bg-slate-200 text-black shadow-md"
                            : isBronze
                            ? "bg-amber-600 text-white shadow-md"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {rank}
                      </div>

                      {/* Avatar */}
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-neutral-900">
                        <Image
                          src={p.avatar || getParticipantPhoto(p.name)}
                          alt={p.name}
                          fill
                          sizes="36px"
                          style={{ objectPosition: getParticipantPhotoPosition(p.name) }}
                          className="object-cover"
                        />
                      </div>

                      {/* Name & University */}
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
                      <div className="font-mono font-black text-sm sm:text-base text-amber-300">
                        {p.score.toLocaleString()}
                      </div>
                      <div className="text-[8px] uppercase font-bold text-white/40">PTS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DANGER / ELIMINATION ZONE (Peringkat 13+) */}
          {dangerZone.length > 0 && (
            <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0 h-full rounded-2xl bg-red-950/20 border border-red-500/30 p-2.5 sm:p-3 overflow-hidden">
              <div className="flex items-center justify-between px-1.5 pb-2 flex-shrink-0 border-b border-red-500/20 mb-2">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  Zona Eliminasi (Peringkat 13 - {rootmasterParticipants.length})
                </span>
                <span className="text-xs text-red-300/70 font-mono font-bold">
                  {dangerZone.length} GUGUR
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-start gap-2 min-h-0 overflow-y-auto pr-1">
                {dangerZone.map((p, idx) => {
                  const rank = 13 + idx;

                  return (
                    <div
                      key={p.id}
                      className="px-3 py-2.5 rounded-xl border border-red-500/30 bg-red-950/40 flex items-center justify-between gap-2.5 opacity-85"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs bg-red-500/30 text-red-300 border border-red-500/40 flex-shrink-0">
                          {rank}
                        </div>

                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-neutral-900 grayscale">
                          <Image
                            src={p.avatar || getParticipantPhoto(p.name)}
                            alt={p.name}
                            fill
                            sizes="32px"
                            style={{ objectPosition: getParticipantPhotoPosition(p.name) }}
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-white/80 truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-white/40 truncate font-mono">
                            {p.university}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="font-mono font-black text-sm text-red-400">
                          {p.score.toLocaleString()}
                        </div>
                        <div className="text-[8px] uppercase font-bold text-red-400/60">GUGUR</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // PRECISION COUNTDOWN TIMER VIEW
  // =========================================================================
  return (
    <div className="w-full space-y-6">
      {/* Broadcast Stage Container */}
      <div className="glass-panel p-8 sm:p-14 rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.03] via-[#080a09] to-black text-center relative overflow-hidden shadow-2xl">
        {/* Glow Accent */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isCriticalTime
              ? "bg-red-600/20"
              : isLowTime
              ? "bg-amber-500/20"
              : "bg-amber-500/15"
          }`}
        />

        {/* Giant Precision Countdown Timer */}
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

        {/* Interactive Controls (For Stage Operator / Admin) */}
        {isAdmin && (
          <div className="relative z-10 mt-10 pt-8 border-t border-white/10 max-w-lg mx-auto space-y-4">
            <div className="text-xs uppercase font-extrabold tracking-wider text-white/50">
              Stage Timer Controls
            </div>

            <div className="flex items-center justify-center gap-3">
              {timerRunning ? (
                <button
                  onClick={onPause}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
              ) : (
                <button
                  onClick={onStart}
                  className="px-6 py-2.5 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(140,198,63,0.4)] transition-all"
                >
                  <Play className="w-4 h-4 fill-black" /> Start Countdown
                </button>
              )}

              <button
                onClick={onReset}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-white/10 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>

              {onToggleLeaderboard && (
                <button
                  onClick={onToggleLeaderboard}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-amber-500/30 transition-all"
                >
                  <Trophy className="w-4 h-4" /> Leaderboard
                </button>
              )}
            </div>

            {onSetDuration && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-xs text-white/40">Presets:</span>
                {[1, 3, 5, 10].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => onSetDuration(mins)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-white/70 hover:text-white border border-white/10"
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
