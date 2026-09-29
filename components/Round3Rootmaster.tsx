"use client";

import { useEffect, useRef } from "react";
import { formatPrecisionCountdown } from "../lib/gameEngine.ts";
import { playTick, playHurryTick, playBuzzer } from "../lib/audio.ts";
import { Play, Pause, RotateCcw, Flame } from "lucide-react";

interface Round3RootmasterProps {
  timeRemainingMs: number;
  timerRunning: boolean;
  soundEnabled?: boolean;
  isAdmin?: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSetDuration?: (mins: number) => void;
}

export function Round3Rootmaster({
  timeRemainingMs,
  timerRunning,
  soundEnabled = true,
  isAdmin = false,
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
              : "bg-[#8cc63f]/15"
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
