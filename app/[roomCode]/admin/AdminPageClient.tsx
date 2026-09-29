"use client";

import { useEffect, useRef } from "react";
import { Navbar } from "../../../components/Navbar.tsx";
import { AdminConsole } from "../../../components/AdminConsole.tsx";
import { useGameState } from "../../../lib/useGameState.ts";

interface AdminPageClientProps {
  roomCode: string;
}

export function AdminPageClient({ roomCode }: AdminPageClientProps) {
  const [gameState, updateState, activeRoom] = useGameState(roomCode);

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Timer loop for admin side (keeps timers ticking locally with zero network spam)
  useEffect(() => {
    const isAnyRunning =
      gameState.round1TimerRunning ||
      gameState.round3TimerRunning ||
      gameState.round4TimerRunning ||
      gameState.round5TimerRunning ||
      Boolean(gameState.round6TimerRunning);

    if (!isAnyRunning) return;

    const timerInterval = setInterval(() => {
      let changed = false;
      let timerEnded = false;
      const current = gameStateRef.current;
      const next = { ...current };

      // Round 1 Timer
      if (next.round1TimerRunning) {
        const remaining = next.round1TimerEndAt
          ? Math.max(0, next.round1TimerEndAt - Date.now())
          : Math.max(0, next.round1TimeRemainingMs - 100);

        if (remaining !== next.round1TimeRemainingMs) {
          next.round1TimeRemainingMs = remaining;
          changed = true;
        }

        if (remaining === 0) {
          next.round1TimerRunning = false;
          next.round1TimerEndAt = null;
          timerEnded = true;
        }
      }

      // Round 3 Timer
      if (next.round3TimerRunning) {
        const remaining = next.round3TimerEndAt
          ? Math.max(0, next.round3TimerEndAt - Date.now())
          : Math.max(0, next.round3TimeRemainingMs - 100);

        if (remaining !== next.round3TimeRemainingMs) {
          next.round3TimeRemainingMs = remaining;
          changed = true;
        }
        if (remaining === 0) {
          next.round3TimerRunning = false;
          next.round3TimerEndAt = null;
          timerEnded = true;
        }
      }

      // Round 4 Timer
      if (next.round4TimerRunning) {
        const remaining = next.round4TimerEndAt
          ? Math.max(0, next.round4TimerEndAt - Date.now())
          : Math.max(0, (next.round4TimeRemainingMs || 0) - 100);

        if (remaining !== next.round4TimeRemainingMs) {
          next.round4TimeRemainingMs = remaining;
          changed = true;
        }
        if (remaining === 0) {
          next.round4TimerRunning = false;
          next.round4TimerEndAt = null;
          timerEnded = true;
        }
      }

      // Round 5 Timer
      if (next.round5TimerRunning) {
        const remaining = next.round5TimerEndAt
          ? Math.max(0, next.round5TimerEndAt - Date.now())
          : Math.max(0, (next.round5TimeRemainingMs || 0) - 100);

        if (remaining !== next.round5TimeRemainingMs) {
          next.round5TimeRemainingMs = remaining;
          changed = true;
        }
        if (remaining === 0) {
          next.round5TimerRunning = false;
          next.round5TimerEndAt = null;
          timerEnded = true;
        }
      }

      // Round 6 Timer
      if (next.round6TimerRunning) {
        const remaining = next.round6TimerEndAt
          ? Math.max(0, next.round6TimerEndAt - Date.now())
          : Math.max(0, (next.round6TimeRemainingMs || 0) - 100);

        if (remaining !== next.round6TimeRemainingMs) {
          next.round6TimeRemainingMs = remaining;
          changed = true;
        }
        if (remaining === 0) {
          next.round6TimerRunning = false;
          next.round6TimerEndAt = null;
          timerEnded = true;
        }
      }

      if (timerEnded) {
        updateState({
          round1TimerRunning: next.round1TimerRunning,
          round1TimeRemainingMs: next.round1TimeRemainingMs,
          round1TimerEndAt: next.round1TimerEndAt,
          round3TimerRunning: next.round3TimerRunning,
          round3TimeRemainingMs: next.round3TimeRemainingMs,
          round3TimerEndAt: next.round3TimerEndAt,
          round4TimerRunning: next.round4TimerRunning,
          round4TimeRemainingMs: next.round4TimeRemainingMs,
          round4TimerEndAt: next.round4TimerEndAt,
          round5TimerRunning: next.round5TimerRunning,
          round5TimeRemainingMs: next.round5TimeRemainingMs,
          round5TimerEndAt: next.round5TimerEndAt,
          round6TimerRunning: next.round6TimerRunning,
          round6TimeRemainingMs: next.round6TimeRemainingMs,
          round6TimerEndAt: next.round6TimerEndAt,
        });
      } else if (changed) {
        updateState(next, { localOnly: true });
      }
    }, 100);

    return () => clearInterval(timerInterval);
  }, [
    gameState.round1TimerRunning,
    gameState.round3TimerRunning,
    gameState.round4TimerRunning,
    gameState.round5TimerRunning,
    gameState.round6TimerRunning,
    updateState,
  ]);

  const handleToggleSound = () => {
    updateState({ soundEnabled: !gameState.soundEnabled });
  };

  return (
    <div className="min-h-screen bg-[#080a09] bg-grid-pattern text-foreground flex flex-col">
      <Navbar
        currentRound={gameState.currentRound}
        soundEnabled={gameState.soundEnabled}
        onToggleSound={handleToggleSound}
        roomCode={activeRoom}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AdminConsole state={gameState} onUpdateState={updateState} roomCode={activeRoom} />
      </main>

      <footer className="mt-auto border-t border-white/10 bg-[#060807] py-6 px-4 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8cc63f] animate-pulse" />
            <span className="text-white/60 font-semibold">180CR Admin Control Room (Room: {activeRoom})</span>
          </div>
          <div>Authorized Personnel Only • Real-time Broadcast Node Active</div>
        </div>
      </footer>
    </div>
  );
}
