"use client";

import { useEffect, useRef } from "react";
import { Participant } from "../lib/types.ts";
import { formatPrecisionCountdown } from "../lib/gameEngine.ts";
import { playTick, playHurryTick, playBuzzer } from "../lib/audio.ts";

interface Round4SacredHandoffProps {
  participants?: Participant[];
  timeRemainingMs: number;
  timerRunning: boolean;
  soundEnabled?: boolean;
}

export function Round4SacredHandoff({
  timeRemainingMs,
  timerRunning,
  soundEnabled = true,
}: Round4SacredHandoffProps) {
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
      {/* Broadcast Stage Container - Timer Only */}
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
      </div>
    </div>
  );
}
