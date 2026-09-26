"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Round1Gauntlet } from "../components/Round1Gauntlet.tsx";
import { Round2CapitalConquest } from "../components/Round2CapitalConquest.tsx";
import { Round3Rootmaster } from "../components/Round3Rootmaster.tsx";
import { Round4SacredHandoff } from "../components/Round4SacredHandoff.tsx";
import { Round4PressureChamber } from "../components/Round4PressureChamber.tsx";
import { Round5ExecutivePitch } from "../components/Round5ExecutivePitch.tsx";
import { useGameState } from "../lib/useGameState.ts";
import { getNextQuestionState, getPrevQuestionState } from "../lib/gameEngine.ts";
import { Volume2, VolumeX, Maximize2, Minimize2, Shield } from "lucide-react";

export default function ParticipantStagePage() {
  const [gameState, updateState] = useGameState();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle browser fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen change events (e.g. user pressed Escape or F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Timer Tick Loop for active round timers
  useEffect(() => {
    const timerInterval = setInterval(() => {
      let changed = false;
      const next = { ...gameState };

      // Round 1 Timer
      if (next.round1TimerRunning && next.round1TimeRemainingMs > 0) {
        next.round1TimeRemainingMs = Math.max(0, next.round1TimeRemainingMs - 100);
        changed = true;

        // Auto-transition from Question & Timer (30s) to Question & Options (30s)
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

  // Advance question in Round 1
  const handleNextQuestion = () => {
    const next = getNextQuestionState(gameState.subRoundIndex, gameState.questionIndex);
    updateState({
      subRoundIndex: next.subRoundIndex,
      questionIndex: next.questionIndex,
      round1Phase: "question_timer",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: true,
    });
  };

  // Previous question in Round 1
  const handlePrevQuestion = () => {
    const prev = getPrevQuestionState(gameState.subRoundIndex, gameState.questionIndex);
    updateState({
      subRoundIndex: prev.subRoundIndex,
      questionIndex: prev.questionIndex,
      round1Phase: "question_timer",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: false,
    });
  };

  return (
    <div className="h-screen w-screen min-h-screen bg-[#080a09] bg-grid-pattern text-foreground flex flex-col justify-between overflow-x-hidden overflow-y-auto relative select-none">
      {/* Discreet Floating Utility Bar (virtually invisible until hovered) */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 opacity-15 hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 shadow-lg">
        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          title={gameState.soundEnabled ? "Mute Game Audio" : "Unmute Game Audio"}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          {gameState.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#8cc63f]" />
          ) : (
            <VolumeX className="w-4 h-4 text-white/40" />
          )}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-white/70" />
          ) : (
            <Maximize2 className="w-4 h-4 text-white/70" />
          )}
        </button>

        {/* Admin Link */}
        <Link
          href="/admin"
          title="Buka Admin Control Room"
          className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-[#8cc63f] transition-colors"
        >
          <Shield className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Full-Screen Game Arena (No navbar, no footer, pure game content) */}
      <main className="flex-1 flex flex-col justify-center items-center w-full h-full p-2 sm:p-4 md:p-6 lg:p-8">
        {gameState.currentRound === 1 && (
          <Round1Gauntlet
            subRoundIndex={gameState.subRoundIndex}
            questionIndex={gameState.questionIndex}
            phase={gameState.round1Phase}
            timeRemainingMs={gameState.round1TimeRemainingMs}
            timerRunning={gameState.round1TimerRunning}
            soundEnabled={gameState.soundEnabled}
            participants={gameState.participants}
            onPhaseChange={(newPhase) =>
              updateState({
                round1Phase: newPhase,
                round1TimerRunning:
                  newPhase === "question_timer" || newPhase === "question_options",
                round1TimeRemainingMs:
                  newPhase === "question_timer" || newPhase === "question_options"
                    ? 30000
                    : 0,
              })
            }
            onNextQuestion={handleNextQuestion}
            onPrevQuestion={handlePrevQuestion}
          />
        )}

        {gameState.currentRound === 2 && (
          <div className="w-full max-w-6xl mx-auto">
            <Round2CapitalConquest
              participants={gameState.participants}
              targetAnswer={gameState.round2TargetAnswer}
              soundEnabled={gameState.soundEnabled}
              onParticipantPass={handleRound2Pass}
              showInputForm={false}
            />
          </div>
        )}

        {gameState.currentRound === 3 && (
          <div className="w-full max-w-5xl mx-auto">
            <Round3Rootmaster
              timeRemainingMs={gameState.round3TimeRemainingMs}
              timerRunning={gameState.round3TimerRunning}
              soundEnabled={gameState.soundEnabled}
            />
          </div>
        )}

        {gameState.currentRound === 4 && (
          <div className="w-full max-w-6xl mx-auto">
            <Round4SacredHandoff
              participants={gameState.participants}
              timeRemainingMs={gameState.round4TimeRemainingMs || 300000}
              timerRunning={gameState.round4TimerRunning || false}
              soundEnabled={gameState.soundEnabled}
            />
          </div>
        )}

        {gameState.currentRound === 5 && (
          <div className="w-full max-w-5xl mx-auto">
            <Round4PressureChamber
              spinNames={gameState.round5SpinNames || gameState.round4SpinNames || []}
              participants={gameState.participants}
              timeRemainingMs={gameState.round5TimeRemainingMs ?? gameState.round4TimeRemainingMs ?? 0}
              timerRunning={gameState.round5TimerRunning ?? gameState.round4TimerRunning ?? false}
              selectedWinner={gameState.round5SelectedWinner ?? gameState.round4SelectedWinner ?? null}
              soundEnabled={gameState.soundEnabled}
              onSpinEnd={(winner) => updateState({ round5SelectedWinner: winner, round4SelectedWinner: winner })}
            />
          </div>
        )}

        {gameState.currentRound === 6 && (
          <div className="w-full max-w-5xl mx-auto">
            <Round5ExecutivePitch
              spinNames={gameState.round6SpinNames || gameState.round5SpinNames || []}
              participants={gameState.participants}
              timeRemainingMs={gameState.round6TimeRemainingMs ?? gameState.round5TimeRemainingMs ?? 0}
              timerRunning={gameState.round6TimerRunning ?? gameState.round5TimerRunning ?? false}
              gameEnded={gameState.round6GameEnded || gameState.round5GameEnded || false}
              selectedWinner={gameState.round6SelectedWinner ?? gameState.round5SelectedWinner ?? null}
              soundEnabled={gameState.soundEnabled}
              onSpinEnd={(winner) => updateState({ round6SelectedWinner: winner, round5SelectedWinner: winner })}
            />
          </div>
        )}
      </main>
    </div>
  );
}
