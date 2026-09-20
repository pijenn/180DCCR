"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar.tsx";
import { KahootLeaderboard } from "../components/KahootLeaderboard.tsx";
import { Round1Gauntlet } from "../components/Round1Gauntlet.tsx";
import { Round2CapitalConquest } from "../components/Round2CapitalConquest.tsx";
import { Round3Rootmaster } from "../components/Round3Rootmaster.tsx";
import { Round4PressureChamber } from "../components/Round4PressureChamber.tsx";
import { Round5ExecutivePitch } from "../components/Round5ExecutivePitch.tsx";
import { useGameState } from "../lib/useGameState.ts";
import { Tv, Trophy } from "lucide-react";

export default function ParticipantStagePage() {
  const [gameState, updateState] = useGameState();
  const [activeTab, setActiveTab] = useState<"game" | "leaderboard">("game");

  // Timer Tick Loop for active round timers
  useEffect(() => {
    const timerInterval = setInterval(() => {
      let changed = false;
      const next = { ...gameState };

      // Round 1 Timer
      if (next.round1TimerRunning && next.round1TimeRemainingMs > 0) {
        next.round1TimeRemainingMs = Math.max(0, next.round1TimeRemainingMs - 100);
        changed = true;

        // Auto-transition from Preview (30s) to Answering (30s)
        if (next.round1TimeRemainingMs === 0 && next.round1Phase === "preview") {
          next.round1Phase = "answering";
          next.round1TimeRemainingMs = 30000;
        } else if (next.round1TimeRemainingMs === 0 && next.round1Phase === "answering") {
          next.round1TimerRunning = false;
        }
      }

      // Round 3 Timer
      if (next.round3TimerRunning && next.round3TimeRemainingMs > 0) {
        next.round3TimeRemainingMs = Math.max(0, next.round3TimeRemainingMs - 100);
        changed = true;
        if (next.round3TimeRemainingMs === 0) {
          next.round3TimerRunning = false;
        }
      }

      // Round 4 Timer
      if (next.round4TimerRunning && next.round4TimeRemainingMs > 0) {
        next.round4TimeRemainingMs = Math.max(0, next.round4TimeRemainingMs - 100);
        changed = true;
        if (next.round4TimeRemainingMs === 0) {
          next.round4TimerRunning = false;
        }
      }

      // Round 5 Timer
      if (next.round5TimerRunning && next.round5TimeRemainingMs > 0) {
        next.round5TimeRemainingMs = Math.max(0, next.round5TimeRemainingMs - 100);
        changed = true;
        if (next.round5TimeRemainingMs === 0) {
          next.round5TimerRunning = false;
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

  // Participant passes Round 2
  const handleRound2Pass = (participantId: string) => {
    const updatedParticipants = gameState.participants.map((p) =>
      p.id === participantId ? { ...p, round2Status: "passed" as const } : p
    );
    updateState({ participants: updatedParticipants });
  };

  return (
    <div className="min-h-screen bg-[#080a09] bg-grid-pattern text-foreground flex flex-col">
      <Navbar
        currentRound={gameState.currentRound}
        soundEnabled={gameState.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex items-center justify-center p-1 rounded-2xl glass-pill max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab("game")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "game"
                ? "bg-[#8cc63f] text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Stage & Game
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-[#8cc63f] text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Leaderboard
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Game Arena */}
          <div
            className={`lg:col-span-8 space-y-6 ${
              activeTab === "game" ? "block" : "hidden lg:block"
            }`}
          >
            {gameState.currentRound === 1 && (
              <Round1Gauntlet
                subRoundIndex={gameState.subRoundIndex}
                questionIndex={gameState.questionIndex}
                phase={gameState.round1Phase}
                timeRemainingMs={gameState.round1TimeRemainingMs}
                timerRunning={gameState.round1TimerRunning}
                soundEnabled={gameState.soundEnabled}
              />
            )}

            {gameState.currentRound === 2 && (
              <Round2CapitalConquest
                participants={gameState.participants}
                targetAnswer={gameState.round2TargetAnswer}
                soundEnabled={gameState.soundEnabled}
                onParticipantPass={handleRound2Pass}
              />
            )}

            {gameState.currentRound === 3 && (
              <Round3Rootmaster
                timeRemainingMs={gameState.round3TimeRemainingMs}
                timerRunning={gameState.round3TimerRunning}
                soundEnabled={gameState.soundEnabled}
              />
            )}

            {gameState.currentRound === 4 && (
              <Round4PressureChamber
                spinNames={gameState.round4SpinNames}
                participants={gameState.participants}
                timeRemainingMs={gameState.round4TimeRemainingMs}
                timerRunning={gameState.round4TimerRunning}
                selectedWinner={gameState.round4SelectedWinner}
                soundEnabled={gameState.soundEnabled}
                onSpinEnd={(winner) => updateState({ round4SelectedWinner: winner })}
              />
            )}

            {gameState.currentRound === 5 && (
              <Round5ExecutivePitch
                spinNames={gameState.round5SpinNames}
                participants={gameState.participants}
                timeRemainingMs={gameState.round5TimeRemainingMs}
                timerRunning={gameState.round5TimerRunning}
                gameEnded={gameState.round5GameEnded}
                selectedWinner={gameState.round5SelectedWinner}
                soundEnabled={gameState.soundEnabled}
                onSpinEnd={(winner) => updateState({ round5SelectedWinner: winner })}
              />
            )}
          </div>

          {/* Kahoot Live Leaderboard Sidebar */}
          <div
            className={`lg:col-span-4 ${
              activeTab === "leaderboard" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="sticky top-24 glass-panel p-4 sm:p-5 rounded-3xl border-white/10 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <KahootLeaderboard
                participants={gameState.participants}
                highlightTop={gameState.currentRound !== 5}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Sleek Footer inspired by 180dcub.com */}
      <footer className="mt-auto border-t border-white/10 bg-[#060807] py-6 px-4 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8cc63f] animate-pulse" />
            <span className="text-white/60 font-semibold">180 Degrees Consulting UB TV Show Companion</span>
          </div>
          <div>© 2026 180 Degrees Consulting Universitas Brawijaya</div>
        </div>
      </footer>
    </div>
  );
}
