"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Round1Gauntlet } from "./Round1Gauntlet.tsx";
import { Round2CapitalConquest } from "./Round2CapitalConquest.tsx";
import { Round3Rootmaster } from "./Round3Rootmaster.tsx";
import { Round4SacredHandoff } from "./Round4SacredHandoff.tsx";
import { Round4PressureChamber } from "./Round4PressureChamber.tsx";
import { Round5ExecutivePitch } from "./Round5ExecutivePitch.tsx";
import { useGameState } from "../lib/useGameState.ts";
import { getNextQuestionState, getPrevQuestionState, getActiveRoundParticipants } from "../lib/gameEngine.ts";
import { Volume2, VolumeX, Maximize2, Minimize2, Shield, Radio, Copy, Check, LogOut } from "lucide-react";

interface StageArenaProps {
  roomCode?: string;
}

export function StageArena({ roomCode }: StageArenaProps) {
  const [gameState, updateState, activeRoom] = useGameState(roomCode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Timer Tick Loop for active round timers (runs smoothly with zero API calls)
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

  const handleRound2Pass = (participantId: string) => {
    const updatedParticipants = gameState.participants.map((p) =>
      p.id === participantId ? { ...p, round2Status: "passed" as const } : p
    );
    updateState({ participants: updatedParticipants });
  };

  const handleNextQuestion = () => {
    const next = getNextQuestionState(gameState.subRoundIndex, gameState.questionIndex);
    const duration = 120000;
    updateState({
      subRoundIndex: next.subRoundIndex,
      questionIndex: next.questionIndex,
      round1Phase: "question_timer",
      round1TimeRemainingMs: duration,
      round1TimerRunning: true,
      round1TimerEndAt: Date.now() + duration,
    });
  };

  const handlePrevQuestion = () => {
    const prev = getPrevQuestionState(gameState.subRoundIndex, gameState.questionIndex);
    updateState({
      subRoundIndex: prev.subRoundIndex,
      questionIndex: prev.questionIndex,
      round1Phase: "question_timer",
      round1TimeRemainingMs: 120000,
      round1TimerRunning: false,
      round1TimerEndAt: null,
    });
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const adminHref = activeRoom ? `/${activeRoom}/admin` : "/admin";

  const roundThemeColors: Record<number, { border: string; glow: string; text: string; name: string }> = {
    1: { border: "#23D700", glow: "rgba(35, 215, 0, 0.25)", text: "#23D700", name: "The Gauntlet" },
    2: { border: "#0051C3", glow: "rgba(0, 81, 195, 0.25)", text: "#38bdf8", name: "Capital Conquest" },
    3: { border: "#E2A100", glow: "rgba(226, 161, 0, 0.25)", text: "#E2A100", name: "Rootmaster" },
    4: { border: "#9E0000", glow: "rgba(158, 0, 0, 0.25)", text: "#f87171", name: "Sacred Handoff" },
    5: { border: "#7A00B8", glow: "rgba(122, 0, 184, 0.25)", text: "#c084fc", name: "Pressure Chamber" },
    6: { border: "#D95B00", glow: "rgba(217, 91, 0, 0.25)", text: "#fb923c", name: "Executive Pitch" },
  };

  const currentTheme = roundThemeColors[gameState.currentRound] || roundThemeColors[1];

  return (
    <div
      className="h-screen w-screen min-h-screen bg-[#050706] bg-grid-pattern text-foreground flex flex-col justify-between overflow-x-hidden overflow-y-auto relative select-none transition-colors duration-500"
      style={{
        boxShadow: `inset 0 2px 24px ${currentTheme.glow}`,
      }}
    >
      {/* Dynamic Top Edge Prism Ray */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${currentTheme.border} 50%, transparent 100%)`,
          boxShadow: `0 0 16px ${currentTheme.border}`,
        }}
      />
      {/* Discreet Floating Utility Bar */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 opacity-20 hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
        {/* Room Info */}
        <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-white/15 text-xs">
          <Radio className="w-3 h-3 text-[#8cc63f] animate-pulse" />
          <span className="font-mono text-white/90 font-bold uppercase">{activeRoom}</span>
          <button
            onClick={handleCopyLink}
            title="Salin Link Room untuk Laptop Lain"
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#8cc63f]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

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
          href={adminHref}
          title="Buka Admin Control Room"
          className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-[#8cc63f] transition-colors"
        >
          <Shield className="w-4 h-4" />
        </Link>

        {/* Exit Room */}
        <Link
          href="/"
          title="Ganti Room Code"
          className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Full-Screen Game Arena */}
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
            onPhaseChange={(newPhase) => {
              const isRunning =
                newPhase === "question_timer" || newPhase === "question_options";
              const duration = isRunning ? 120000 : 0;
              updateState({
                round1Phase: newPhase,
                round1TimerRunning: isRunning,
                round1TimeRemainingMs: duration,
                round1TimerEndAt: isRunning ? Date.now() + duration : null,
              });
            }}
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
              showLeaderboard={gameState.round2ShowLeaderboard || false}
              onToggleLeaderboard={() =>
                updateState({ round2ShowLeaderboard: !gameState.round2ShowLeaderboard })
              }
            />
          </div>
        )}

        {gameState.currentRound === 3 && (
          <div className="w-full max-w-5xl mx-auto">
            <Round3Rootmaster
              participants={gameState.participants}
              timeRemainingMs={gameState.round3TimeRemainingMs}
              timerRunning={gameState.round3TimerRunning}
              soundEnabled={gameState.soundEnabled}
              showLeaderboard={gameState.round3ShowLeaderboard || false}
              customRanking={gameState.round3CustomRanking}
              onToggleLeaderboard={() =>
                updateState({ round3ShowLeaderboard: !gameState.round3ShowLeaderboard })
              }
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
              showLeaderboard={gameState.round4ShowLeaderboard || false}
              onToggleLeaderboard={() =>
                updateState({ round4ShowLeaderboard: !gameState.round4ShowLeaderboard })
              }
            />
          </div>
        )}

        {gameState.currentRound === 5 && (
          <div className="w-full max-w-6xl mx-auto">
            <Round4PressureChamber
              spinNames={
                gameState.round5SpinNames !== undefined
                  ? gameState.round5SpinNames
                  : getActiveRoundParticipants(gameState.participants, 5).slice(0, 9).map((p) => p.name)
              }
              participants={gameState.participants}
              timeRemainingMs={gameState.round5TimeRemainingMs ?? gameState.round4TimeRemainingMs ?? 0}
              timerRunning={gameState.round5TimerRunning ?? gameState.round4TimerRunning ?? false}
              selectedWinner={gameState.round5SelectedWinner ?? gameState.round4SelectedWinner ?? null}
              soundEnabled={gameState.soundEnabled}
              showLeaderboard={gameState.round5ShowLeaderboard || false}
              viewMode={gameState.round5ViewMode || (gameState.round5ShowLeaderboard ? "leaderboard" : "wheel")}
              spunWinners={gameState.round5SpunWinners || []}
              onSetViewMode={(mode) =>
                updateState({
                  round5ViewMode: mode,
                  round5ShowLeaderboard: mode === "leaderboard",
                })
              }
              onToggleLeaderboard={() =>
                updateState({
                  round5ShowLeaderboard: !gameState.round5ShowLeaderboard,
                  round5ViewMode: !gameState.round5ShowLeaderboard ? "leaderboard" : "wheel",
                })
              }
              onSpinEnd={(winner) => {
                const currentSpin =
                  gameState.round5SpinNames !== undefined
                    ? gameState.round5SpinNames
                    : getActiveRoundParticipants(gameState.participants, 5).slice(0, 9).map((p) => p.name);
                const updatedSpin = currentSpin.filter((n) => n !== winner);
                const currentSpun = gameState.round5SpunWinners || [];
                const updatedSpun = currentSpun.includes(winner) ? currentSpun : [...currentSpun, winner];

                updateState({
                  round5SelectedWinner: winner,
                  round4SelectedWinner: winner,
                  round5SpinNames: updatedSpin,
                  round4SpinNames: updatedSpin,
                  round5SpunWinners: updatedSpun,
                });
              }}
            />
          </div>
        )}

        {gameState.currentRound === 6 && (
          <div className="w-full max-w-6xl mx-auto">
            <Round5ExecutivePitch
              spinNames={
                gameState.round6SpinNames !== undefined
                  ? gameState.round6SpinNames
                  : getActiveRoundParticipants(gameState.participants, 6).slice(0, 5).map((p) => p.name)
              }
              participants={gameState.participants}
              timeRemainingMs={gameState.round6TimeRemainingMs ?? gameState.round5TimeRemainingMs ?? 0}
              timerRunning={gameState.round6TimerRunning ?? gameState.round5TimerRunning ?? false}
              gameEnded={gameState.round6GameEnded || gameState.round5GameEnded || false}
              selectedWinner={gameState.round6SelectedWinner ?? gameState.round5SelectedWinner ?? null}
              soundEnabled={gameState.soundEnabled}
              showLeaderboard={gameState.round6ShowLeaderboard || gameState.round6GameEnded || gameState.round5GameEnded || false}
              viewMode={gameState.round6ViewMode || (gameState.round6ShowLeaderboard || gameState.round6GameEnded ? "leaderboard" : "wheel")}
              spunWinners={gameState.round6SpunWinners || []}
              onSetViewMode={(mode) =>
                updateState({
                  round6ViewMode: mode,
                  round6ShowLeaderboard: mode === "leaderboard",
                })
              }
              onToggleLeaderboard={() =>
                updateState({
                  round6ShowLeaderboard: !gameState.round6ShowLeaderboard,
                  round6ViewMode: !gameState.round6ShowLeaderboard ? "leaderboard" : "wheel",
                })
              }
              onSpinEnd={(winner) => {
                const currentSpin =
                  gameState.round6SpinNames !== undefined
                    ? gameState.round6SpinNames
                    : getActiveRoundParticipants(gameState.participants, 6).slice(0, 5).map((p) => p.name);
                const updatedSpin = currentSpin.filter((n) => n !== winner);
                const currentSpun = gameState.round6SpunWinners || [];
                const updatedSpun = currentSpun.includes(winner) ? currentSpun : [...currentSpun, winner];

                updateState({
                  round6SelectedWinner: winner,
                  round5SelectedWinner: winner,
                  round6SpinNames: updatedSpin,
                  round6SpunWinners: updatedSpun,
                });
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
