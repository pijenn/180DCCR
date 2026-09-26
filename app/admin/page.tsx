"use client";

import { useEffect } from "react";
import { Navbar } from "../../components/Navbar.tsx";
import { AdminConsole } from "../../components/AdminConsole.tsx";
import { useGameState } from "../../lib/useGameState.ts";

export default function AdminPage() {
  const [gameState, updateState] = useGameState();

  // Timer loop for admin side
  useEffect(() => {
    const timerInterval = setInterval(() => {
      let changed = false;
      const next = { ...gameState };

      if (next.round1TimerRunning && next.round1TimeRemainingMs > 0) {
        next.round1TimeRemainingMs = Math.max(0, next.round1TimeRemainingMs - 100);
        changed = true;
        if (
          next.round1TimeRemainingMs === 0 &&
          (next.round1Phase === "question_timer" || next.round1Phase === "preview" || next.round1Phase === "idle")
        ) {
          next.round1Phase = "question_options";
          next.round1TimeRemainingMs = 30000;
          next.round1TimerRunning = true;
        } else if (
          next.round1TimeRemainingMs === 0 &&
          (next.round1Phase === "question_options" || next.round1Phase === "answering")
        ) {
          next.round1TimerRunning = false;
        }
      }

      if (next.round3TimerRunning && next.round3TimeRemainingMs > 0) {
        next.round3TimeRemainingMs = Math.max(0, next.round3TimeRemainingMs - 100);
        changed = true;
        if (next.round3TimeRemainingMs === 0) {
          next.round3TimerRunning = false;
        }
      }

      if (next.round4TimerRunning && next.round4TimeRemainingMs > 0) {
        next.round4TimeRemainingMs = Math.max(0, next.round4TimeRemainingMs - 100);
        changed = true;
        if (next.round4TimeRemainingMs === 0) {
          next.round4TimerRunning = false;
        }
      }

      if (next.round5TimerRunning && next.round5TimeRemainingMs > 0) {
        next.round5TimeRemainingMs = Math.max(0, next.round5TimeRemainingMs - 100);
        changed = true;
        if (next.round5TimeRemainingMs === 0) {
          next.round5TimerRunning = false;
        }
      }

      if (next.round6TimerRunning && (next.round6TimeRemainingMs || 0) > 0) {
        next.round6TimeRemainingMs = Math.max(0, (next.round6TimeRemainingMs || 0) - 100);
        changed = true;
        if (next.round6TimeRemainingMs === 0) {
          next.round6TimerRunning = false;
        }
      }

      if (changed) {
        updateState(next);
      }
    }, 100);

    return () => clearInterval(timerInterval);
  }, [gameState, updateState]);

  const handleToggleSound = () => {
    updateState({ soundEnabled: !gameState.soundEnabled });
  };

  return (
    <div className="min-h-screen bg-[#080a09] bg-grid-pattern text-foreground flex flex-col">
      <Navbar
        currentRound={gameState.currentRound}
        soundEnabled={gameState.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AdminConsole state={gameState} onUpdateState={updateState} />
      </main>

      <footer className="mt-auto border-t border-white/10 bg-[#060807] py-6 px-4 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8cc63f] animate-pulse" />
            <span className="text-white/60 font-semibold">180CR Admin Control Room</span>
          </div>
          <div>Authorized Personnel Only • Real-time Broadcast Node Active</div>
        </div>
      </footer>
    </div>
  );
}
