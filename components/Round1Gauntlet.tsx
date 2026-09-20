"use client";

import { useState, useEffect } from "react";
import { Question, SubRoundConfig } from "../lib/types.ts";
import { ROUND_1_SUBROUNDS, formatTimerDisplay, SAMPLE_QUESTIONS } from "../lib/gameEngine.ts";
import { playTick, playHurryTick, playBuzzer } from "../lib/audio.ts";
import { Clock, AlertTriangle, CheckCircle2, Award, HelpCircle } from "lucide-react";

interface Round1GauntletProps {
  subRoundIndex: number;
  questionIndex: number;
  phase: "preview" | "answering" | "idle";
  timeRemainingMs: number;
  timerRunning: boolean;
  soundEnabled?: boolean;
  onPhaseComplete?: () => void;
  selectedAnswer?: string | null;
  onSelectAnswer?: (choice: string) => void;
}

export function Round1Gauntlet({
  subRoundIndex,
  questionIndex,
  phase,
  timeRemainingMs,
  timerRunning,
  soundEnabled = true,
  selectedAnswer: externalSelectedAnswer,
  onSelectAnswer,
}: Round1GauntletProps) {
  const currentSubRound: SubRoundConfig = ROUND_1_SUBROUNDS[subRoundIndex] || ROUND_1_SUBROUNDS[0];
  const isCrisis = currentSubRound.name.includes("CRISIS");

  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const activeAnswer = externalSelectedAnswer !== undefined ? externalSelectedAnswer : internalSelected;

  const currentQuestion: Question =
    SAMPLE_QUESTIONS.find(
      (q) => q.subRoundId === currentSubRound.id && q.questionNumber === questionIndex + 1
    ) || {
      id: `q-${currentSubRound.id}-${questionIndex + 1}`,
      roundId: 1,
      subRoundId: currentSubRound.id,
      questionNumber: questionIndex + 1,
      prompt: `Consulting Challenge Case #${questionIndex + 1} for ${currentSubRound.name}: Formulate strategic rationale and identify the optimal decision matrix for market transformation.`,
      options: [
        { key: "A", text: "Organic Greenfield Expansion with localized supply-chain partners" },
        { key: "B", text: "Targeted Bolt-on M&A to acquire critical proprietary IP" },
        { key: "C", text: "Divest non-core assets to fund margin optimization pilot" },
        { key: "D", text: "Implement dynamic pricing and direct-to-consumer digital channels" },
        { key: "E", text: "Form strategic joint-venture with incumbent regional distribution leader" },
        { key: "F", text: "Execute full operational restructuring and headcount re-allocation" },
      ],
      correctAnswer: "A",
    };

  const secondsLeft = Math.floor(timeRemainingMs / 1000);

  useEffect(() => {
    if (!timerRunning || phase === "idle") return;

    if (secondsLeft <= 5 && secondsLeft > 0) {
      playHurryTick(soundEnabled);
    } else if (secondsLeft > 0) {
      playTick(soundEnabled);
    } else if (secondsLeft === 0 && timeRemainingMs <= 100) {
      playBuzzer(soundEnabled);
    }
  }, [secondsLeft, timerRunning, phase, soundEnabled, timeRemainingMs]);

  const handleOptionClick = (key: string) => {
    if (phase !== "answering") return;
    setInternalSelected(key);
    if (onSelectAnswer) {
      onSelectAnswer(key);
    }
  };

  const progressPercent = Math.min(100, Math.max(0, (timeRemainingMs / 30000) * 100));

  const optionColors: Record<string, { bg: string; hover: string; border: string; text: string; badge: string }> = {
    A: {
      bg: "bg-red-500/10",
      hover: "hover:bg-red-500/20",
      border: "border-red-500/30",
      text: "text-red-400",
      badge: "bg-red-500 text-white",
    },
    B: {
      bg: "bg-blue-500/10",
      hover: "hover:bg-blue-500/20",
      border: "border-blue-500/30",
      text: "text-blue-400",
      badge: "bg-blue-500 text-white",
    },
    C: {
      bg: "bg-amber-500/10",
      hover: "hover:bg-amber-500/20",
      border: "border-amber-500/30",
      text: "text-amber-400",
      badge: "bg-amber-500 text-black",
    },
    D: {
      bg: "bg-emerald-500/10",
      hover: "hover:bg-emerald-500/20",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      badge: "bg-emerald-500 text-black",
    },
    E: {
      bg: "bg-purple-500/10",
      hover: "hover:bg-purple-500/20",
      border: "border-purple-500/30",
      text: "text-purple-400",
      badge: "bg-purple-500 text-white",
    },
    F: {
      bg: "bg-cyan-500/10",
      hover: "hover:bg-cyan-500/20",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      badge: "bg-cyan-500 text-black",
    },
  };

  return (
    <div className="w-full space-y-6">
      {/* Sub-rounds Breadcrumb Bar */}
      <div className="glass-panel p-3 rounded-2xl overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {ROUND_1_SUBROUNDS.map((sr, idx) => {
            const isCurrent = idx === subRoundIndex;
            const isPassed = idx < subRoundIndex;
            const isCrisisSub = sr.name.includes("CRISIS");

            return (
              <div
                key={sr.id}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? isCrisisSub
                      ? "bg-red-600 text-white ring-2 ring-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse"
                      : "bg-[#8cc63f] text-black ring-2 ring-[#8cc63f]/60 shadow-[0_0_15px_rgba(140,198,63,0.4)]"
                    : isPassed
                    ? "bg-white/10 text-white/50 border border-white/5"
                    : "bg-white/5 text-white/40 border border-white/5"
                }`}
              >
                <span>{sr.id}.</span>
                <span>{sr.name}</span>
                <span className="opacity-80 text-[10px]">({sr.points}p)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Showcase Card */}
      <div
        className={`glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden transition-all ${
          isCrisis
            ? "border-red-500/40 bg-gradient-to-b from-red-950/20 via-neutral-900/60 to-black/80"
            : "border-white/10 bg-gradient-to-b from-[#8cc63f]/5 via-neutral-900/60 to-black/80"
        }`}
      >
        {/* Top Meta Details */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              {isCrisis ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Crisis Emergency Round
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30">
                  <Award className="w-3.5 h-3.5" />
                  Sub-Round {currentSubRound.id}: {currentSubRound.name}
                </span>
              )}

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70">
                Question {questionIndex + 1} of {currentSubRound.questionCount}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              Round 1: The Gauntlet
            </h1>
          </div>

          {/* Points Value Tag */}
          <div className="text-right">
            <div className="text-xs text-white/50 uppercase font-bold tracking-wider">Question Reward</div>
            <div className="text-2xl sm:text-3xl font-black text-[#8cc63f] tracking-tight">
              +{currentSubRound.points}{" "}
              <span className="text-xs uppercase text-white/60 font-semibold">PTS</span>
            </div>
          </div>
        </div>

        {/* Dynamic Timer Display (ss:ms format e.g. 29:59) */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                phase === "preview"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : phase === "answering"
                  ? "bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/40 animate-pulse"
                  : "bg-white/10 text-white/40"
              }`}
            >
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-white/50">
                {phase === "preview"
                  ? "Phase 1: Question Preview"
                  : phase === "answering"
                  ? "Phase 2: Answering Period (Options A-F)"
                  : "Timer Paused / Idle"}
              </div>
              <div className="text-xs text-white/70">
                {phase === "preview"
                  ? "30 Seconds to analyze the case prompt"
                  : phase === "answering"
                  ? "30 Seconds to lock in your answer choice"
                  : "Waiting for Admin to start question"}
              </div>
            </div>
          </div>

          {/* Big Digital Timer */}
          <div className="text-right">
            <div
              className={`font-mono text-3xl sm:text-4xl font-black tracking-wider ${
                timeRemainingMs <= 5000 && phase !== "idle"
                  ? "text-red-500 animate-pulse"
                  : "text-white"
              }`}
            >
              {formatTimerDisplay(timeRemainingMs)}
            </div>
            <div className="text-[10px] text-white/40 uppercase font-mono tracking-widest">
              Seconds : Hundredths
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-6 border border-white/10">
          <div
            className={`h-full transition-all duration-100 ${
              isCrisis
                ? "bg-gradient-to-r from-red-600 to-amber-500"
                : "bg-gradient-to-r from-[#8cc63f] to-emerald-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Prompt */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#8cc63f] mb-2">
            <HelpCircle className="w-4 h-4" />
            Case Question #{questionIndex + 1}
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white leading-relaxed p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            {currentQuestion.prompt}
          </div>
        </div>

        {/* Options Phase (A B C D E F) */}
        {phase === "preview" ? (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2 animate-spin" />
            <h3 className="font-extrabold text-white text-base uppercase tracking-wider">
              Preview Phase Active
            </h3>
            <p className="text-sm text-white/50 max-w-md mx-auto mt-1">
              Read the case prompt above. The 6 multiple-choice options (A through F) will unlock automatically when the 30-second countdown reaches zero!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-white/60">
                Choose Your Answer (Options A - F):
              </span>
              {activeAnswer && (
                <span className="text-xs font-bold text-[#8cc63f] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Option {activeAnswer} Locked In
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {currentQuestion.options.map((option) => {
                const colors = optionColors[option.key] || optionColors.A;
                const isSelected = activeAnswer === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleOptionClick(option.key)}
                    disabled={phase !== "answering"}
                    className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden flex items-start gap-3 group ${
                      isSelected
                        ? "bg-[#8cc63f]/20 border-[#8cc63f] shadow-[0_0_20px_rgba(140,198,63,0.3)] scale-[1.01]"
                        : `${colors.bg} ${colors.hover} ${colors.border} hover:border-white/40`
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isSelected ? "bg-[#8cc63f] text-black font-black" : colors.badge
                      }`}
                    >
                      {option.key}
                    </div>

                    <div className="flex-grow pt-1">
                      <p className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-white leading-snug">
                        {option.text}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="flex-shrink-0 text-[#8cc63f]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-center text-xs text-white/40 pt-2">
              Note: Answers are manually judged and points are awarded by the Admin in the control room.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
