"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Question, SubRoundConfig, Round1Phase, Participant } from "../lib/types.ts";
import {
  ROUND_1_SUBROUNDS,
  formatTimerDisplay,
  SAMPLE_QUESTIONS,
  calculateLeaderboard,
} from "../lib/gameEngine.ts";
import { playTick, playHurryTick, playBuzzer, playSuccessFanfare } from "../lib/audio.ts";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Trophy,
} from "lucide-react";

interface Round1GauntletProps {
  subRoundIndex: number;
  questionIndex: number;
  phase: Round1Phase;
  timeRemainingMs: number;
  timerRunning: boolean;
  soundEnabled?: boolean;
  participants?: Participant[];
  onPhaseChange?: (newPhase: Round1Phase) => void;
  onNextQuestion?: () => void;
  onPrevQuestion?: () => void;
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
  participants = [],
  onPhaseChange,
  onNextQuestion,
  onPrevQuestion,
  selectedAnswer: externalSelectedAnswer,
  onSelectAnswer,
}: Round1GauntletProps) {
  const currentSubRound: SubRoundConfig =
    ROUND_1_SUBROUNDS[subRoundIndex] || ROUND_1_SUBROUNDS[0];
  const isCrisis = currentSubRound.name.includes("CRISIS");

  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const activeAnswer =
    externalSelectedAnswer !== undefined ? externalSelectedAnswer : internalSelected;

  // Normalize legacy phase names to the 5-step flow
  const normalizedPhase: "question_timer" | "question_options" | "correct_answer" | "leaderboard" =
    phase === "question_options" || phase === "answering"
      ? "question_options"
      : phase === "correct_answer"
      ? "correct_answer"
      : phase === "leaderboard"
      ? "leaderboard"
      : "question_timer";

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

  // Audio timer effects
  useEffect(() => {
    if (!timerRunning) return;
    if (normalizedPhase !== "question_timer" && normalizedPhase !== "question_options") return;

    if (secondsLeft <= 5 && secondsLeft > 0) {
      playHurryTick(soundEnabled);
    } else if (secondsLeft > 0) {
      playTick(soundEnabled);
    } else if (secondsLeft === 0 && timeRemainingMs <= 100) {
      playBuzzer(soundEnabled);
    }
  }, [secondsLeft, timerRunning, normalizedPhase, soundEnabled, timeRemainingMs]);

  // Audio & confetti fanfare when entering correct answer or leaderboard
  useEffect(() => {
    if (normalizedPhase === "correct_answer") {
      playSuccessFanfare(soundEnabled);
    } else if (normalizedPhase === "leaderboard") {
      playSuccessFanfare(soundEnabled);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#8cc63f", "#34d399", "#fbbf24", "#ffffff"],
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0.1, y: 0.6 },
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 0.9, y: 0.6 },
          });
        }, 1200);
      } catch {
        // Safe fail for tests or non-browser environments
      }
    }
  }, [normalizedPhase, soundEnabled]);

  const handleNextStep = () => {
    if (normalizedPhase === "question_timer") {
      onPhaseChange?.("question_options");
    } else if (normalizedPhase === "question_options") {
      onPhaseChange?.("correct_answer");
    } else if (normalizedPhase === "correct_answer") {
      onPhaseChange?.("leaderboard");
    } else if (normalizedPhase === "leaderboard") {
      if (onNextQuestion) {
        onNextQuestion();
      } else {
        onPhaseChange?.("question_timer");
      }
    }
  };

  const handlePrevStep = () => {
    if (normalizedPhase === "leaderboard") {
      onPhaseChange?.("correct_answer");
    } else if (normalizedPhase === "correct_answer") {
      onPhaseChange?.("question_options");
    } else if (normalizedPhase === "question_options") {
      onPhaseChange?.("question_timer");
    } else if (normalizedPhase === "question_timer") {
      onPrevQuestion?.();
    }
  };

  // Presenter Keyboard Shortcuts (ArrowRight/Space to advance, ArrowLeft to go back)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleOptionClick = (key: string) => {
    if (normalizedPhase !== "question_options") return;
    setInternalSelected(key);
    onSelectAnswer?.(key);
  };

  const progressPercent = Math.min(100, Math.max(0, (timeRemainingMs / 30000) * 100));
  const rankedParticipants = calculateLeaderboard(participants);

  return (
    <div className="w-full h-full flex flex-col justify-between max-w-6xl mx-auto px-4 py-4 sm:py-6 select-none animate-in fade-in duration-300">
      {/* 1. Minimalist Top Meta Bar */}
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isCrisis
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse"
                : "bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30"
            }`}
          >
            {isCrisis ? "CRISIS ROUND" : `R1 • SUB-ROUND ${currentSubRound.id}`}
          </span>
          <span className="text-xs font-bold text-white/70 tracking-wide uppercase hidden sm:inline">
            {currentSubRound.name}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
            Soal {questionIndex + 1} / {currentSubRound.questionCount}
          </span>
        </div>

        {/* 5-Step Flow Breadcrumb Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold tracking-wider">
          <span
            className={`px-2.5 py-1 rounded-lg transition-all ${
              normalizedPhase === "question_timer"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black shadow-sm"
                : "text-white/40"
            }`}
          >
            1. Soal & Timer
          </span>
          <span className="text-white/20">→</span>
          <span
            className={`px-2.5 py-1 rounded-lg transition-all ${
              normalizedPhase === "question_options"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black shadow-sm"
                : "text-white/40"
            }`}
          >
            2. Opsi
          </span>
          <span className="text-white/20">→</span>
          <span
            className={`px-2.5 py-1 rounded-lg transition-all ${
              normalizedPhase === "correct_answer"
                ? "bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30 font-black shadow-sm"
                : "text-white/40"
            }`}
          >
            3. Jawaban Benar
          </span>
          <span className="text-white/20">→</span>
          <span
            className={`px-2.5 py-1 rounded-lg transition-all ${
              normalizedPhase === "leaderboard"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black shadow-sm"
                : "text-white/40"
            }`}
          >
            4. Leaderboard
          </span>
        </div>

        {/* Question Reward */}
        <div className="text-right flex items-center gap-2">
          <span className="text-xs text-white/40 uppercase font-semibold hidden sm:inline">
            Reward:
          </span>
          <span className="text-lg sm:text-xl font-black text-[#8cc63f] tracking-tight">
            +{currentSubRound.points}{" "}
            <span className="text-[10px] text-white/50 uppercase">PTS</span>
          </span>
        </div>
      </header>

      {/* 2. Main Content Area Switcher */}
      <main className="flex-1 flex flex-col justify-center my-auto py-6 sm:py-8 w-full">
        {/* ============================================================ */}
        {/* FLOW STEP 1: Questions & Timer (Only Question and Timer) */}
        {/* ============================================================ */}
        {normalizedPhase === "question_timer" && (
          <div className="space-y-8 max-w-4xl mx-auto w-full text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Minimalist Digital Countdown Timer */}
            <div className="inline-flex flex-col items-center">
              <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg">
                <Clock
                  className={`w-5 h-5 ${
                    timeRemainingMs <= 5000 && timerRunning
                      ? "text-red-500 animate-pulse"
                      : "text-amber-400"
                  }`}
                />
                <span
                  className={`font-mono text-3xl sm:text-4xl font-black tracking-widest ${
                    timeRemainingMs <= 5000 && timerRunning
                      ? "text-red-500 animate-pulse"
                      : "text-white"
                  }`}
                >
                  {formatTimerDisplay(timeRemainingMs)}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-bold text-white/40 border-l border-white/10 pl-3">
                  Waktu Membaca
                </span>
              </div>

              {/* Minimalist Progress Line */}
              <div className="w-64 sm:w-80 bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all duration-100 ${
                    timeRemainingMs <= 5000 ? "bg-red-500" : "bg-[#8cc63f]"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Prompt */}
            <div className="py-4 sm:py-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#8cc63f] bg-[#8cc63f]/10 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Case Challenge #{questionIndex + 1}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-relaxed tracking-tight max-w-3xl mx-auto">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* Preview Hint */}
            <p className="text-xs sm:text-sm text-white/40 tracking-wide uppercase font-semibold">
              Opsi jawaban A–F akan terbuka otomatis setelah waktu membaca selesai
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* FLOW STEP 2: Questions, Timer, Options */}
        {/* ============================================================ */}
        {normalizedPhase === "question_options" && (
          <div className="space-y-6 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
            {/* Question & Timer Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-center sm:text-left flex-1">
                <div className="text-[11px] uppercase font-bold tracking-widest text-[#8cc63f] mb-1">
                  Pertanyaan #{questionIndex + 1}:
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white line-clamp-3">
                  {currentQuestion.prompt}
                </h3>
              </div>

              {/* Digital Timer */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                <Clock
                  className={`w-4 h-4 ${
                    timeRemainingMs <= 5000 && timerRunning
                      ? "text-red-500 animate-pulse"
                      : "text-[#8cc63f]"
                  }`}
                />
                <span
                  className={`font-mono text-2xl font-black ${
                    timeRemainingMs <= 5000 && timerRunning
                      ? "text-red-500 animate-pulse"
                      : "text-white"
                  }`}
                >
                  {formatTimerDisplay(timeRemainingMs)}
                </span>
              </div>
            </div>

            {/* Options Grid (A - F) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = activeAnswer === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleOptionClick(option.key)}
                    className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3.5 group cursor-pointer ${
                      isSelected
                        ? "bg-[#8cc63f]/20 border-[#8cc63f] shadow-[0_0_20px_rgba(140,198,63,0.3)] scale-[1.01]"
                        : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? "bg-[#8cc63f] text-black"
                          : "bg-white/10 text-white/90 group-hover:bg-white/20"
                      }`}
                    >
                      {option.key}
                    </div>

                    <div className="flex-grow pt-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-white/90 group-hover:text-white leading-snug">
                        {option.text}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="flex-shrink-0 text-[#8cc63f] pt-1">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FLOW STEP 3: Correct Answer Revealed */}
        {/* ============================================================ */}
        {normalizedPhase === "correct_answer" && (
          <div className="space-y-6 max-w-5xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
            {/* Question Summary */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/40 mb-3 shadow-[0_0_15px_rgba(140,198,63,0.2)]">
                <CheckCircle2 className="w-4 h-4" /> Kunci Jawaban Resmi Terbuka
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                {currentQuestion.prompt}
              </h3>
            </div>

            {/* Options with Correct Answer Highlighted & Others Dimmed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {currentQuestion.options.map((option) => {
                const isCorrect = option.key === currentQuestion.correctAnswer;

                return (
                  <div
                    key={option.key}
                    className={`p-4 sm:p-5 rounded-2xl text-left border transition-all flex items-start gap-4 relative overflow-hidden ${
                      isCorrect
                        ? "bg-[#8cc63f]/20 border-2 border-[#8cc63f] shadow-[0_0_35px_rgba(140,198,63,0.35)] scale-[1.02] z-10"
                        : "bg-white/[0.02] border-white/5 opacity-25"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 ${
                        isCorrect
                          ? "bg-[#8cc63f] text-black shadow-md"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {option.key}
                    </div>

                    <div className="flex-grow pt-0.5 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isCorrect && (
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#8cc63f] text-black tracking-wider">
                            JAWABAN BENAR
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm sm:text-base font-semibold leading-snug ${
                          isCorrect ? "text-white" : "text-white/60"
                        }`}
                      >
                        {option.text}
                      </p>
                    </div>

                    {isCorrect && (
                      <div className="flex-shrink-0 text-[#8cc63f]">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FLOW STEP 4: Full-Screen Minimalist Leaderboard */}
        {/* ============================================================ */}
        {normalizedPhase === "leaderboard" && (
          <div className="space-y-6 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 mb-2">
                <Trophy className="w-3.5 h-3.5" /> Klasemen Sementara
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Official Leaderboard
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Klasemen perolehan poin setelah Soal #{questionIndex + 1}
              </p>
            </div>

            {/* Top 3 Dramatic Podium Highlights (Kahoot / TV Gameshow Style) */}
            {rankedParticipants.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto items-end pt-4">
                {/* 2nd Place (Silver) */}
                <div className="order-2 sm:order-1 p-5 rounded-3xl bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-slate-700/20 border-2 border-slate-300/40 text-center flex flex-col items-center shadow-[0_10px_30px_rgba(203,213,225,0.15)] animate-podium-2 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-75" />
                  <div className="text-[11px] uppercase font-black px-3 py-1 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/30 mb-3 shadow-inner flex items-center gap-1">
                    🥈 Runner Up #2
                  </div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-3 ring-4 ring-slate-300/60 shadow-[0_0_20px_rgba(203,213,225,0.3)]">
                    <Image
                      src={rankedParticipants[1].avatar || "/participants/khal.webp"}
                      alt={rankedParticipants[1].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-white line-clamp-1 w-full">
                    {rankedParticipants[1].name}
                  </h4>
                  <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                    {rankedParticipants[1].university}
                  </p>
                  <div className="mt-3 px-4 py-1.5 rounded-xl bg-white/10 border border-white/15 font-black text-slate-200 text-base shadow-sm">
                    {rankedParticipants[1].score.toLocaleString()} <span className="text-[10px] text-white/40 uppercase">PTS</span>
                  </div>
                </div>

                {/* 1st Place (Gold Champion) */}
                <div className="order-1 sm:order-2 p-6 sm:p-7 rounded-3xl bg-gradient-to-t from-[#005a36]/90 via-[#8cc63f]/20 to-amber-500/20 border-2 border-[#8cc63f] text-center flex flex-col items-center shadow-[0_0_50px_rgba(140,198,63,0.35)] animate-podium-1 relative overflow-hidden backdrop-blur-md z-10 scale-105">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-crown select-none pointer-events-none">
                    👑
                  </div>
                  <div className="text-xs uppercase font-black px-4 py-1 rounded-full bg-[#8cc63f] text-black mb-3 shadow-[0_0_15px_rgba(140,198,63,0.6)] font-mono tracking-wider animate-pulse">
                    🏆 LEADER #1
                  </div>
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 ring-4 ring-[#8cc63f] shadow-[0_0_35px_rgba(140,198,63,0.6)]">
                    <Image
                      src={rankedParticipants[0].avatar || "/participants/khal.webp"}
                      alt={rankedParticipants[0].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-black text-base sm:text-lg text-white line-clamp-1 w-full">
                    {rankedParticipants[0].name}
                  </h4>
                  <p className="text-xs text-[#8cc63f]/90 line-clamp-1 font-semibold mt-0.5">
                    {rankedParticipants[0].university}
                  </p>
                  <div className="mt-3 px-5 py-2 rounded-2xl bg-[#8cc63f] text-black font-black text-lg sm:text-xl shadow-[0_0_20px_rgba(140,198,63,0.5)]">
                    {rankedParticipants[0].score.toLocaleString()} <span className="text-xs text-black/70 uppercase">PTS</span>
                  </div>
                </div>

                {/* 3rd Place (Bronze) */}
                <div className="order-3 p-5 rounded-3xl bg-gradient-to-t from-amber-950/90 via-amber-900/40 to-amber-800/20 border-2 border-amber-600/40 text-center flex flex-col items-center shadow-[0_10px_30px_rgba(217,119,6,0.15)] animate-podium-3 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-75" />
                  <div className="text-[11px] uppercase font-black px-3 py-1 rounded-full bg-amber-600/20 text-amber-300 border border-amber-500/30 mb-3 shadow-inner flex items-center gap-1">
                    🥉 3rd Place #3
                  </div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-3 ring-4 ring-amber-600/60 shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                    <Image
                      src={rankedParticipants[2].avatar || "/participants/khal.webp"}
                      alt={rankedParticipants[2].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-white line-clamp-1 w-full">
                    {rankedParticipants[2].name}
                  </h4>
                  <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                    {rankedParticipants[2].university}
                  </p>
                  <div className="mt-3 px-4 py-1.5 rounded-xl bg-white/10 border border-white/15 font-black text-amber-300 text-base shadow-sm">
                    {rankedParticipants[2].score.toLocaleString()} <span className="text-[10px] text-white/40 uppercase">PTS</span>
                  </div>
                </div>
              </div>
            )}

            {/* Minimalist Ranked Scrollable List with Staggered Cascade Entrance */}
            <div className="max-h-60 sm:max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.015] divide-y divide-white/5 pr-1">
              {rankedParticipants.map((p, idx) => (
                <div
                  key={p.id}
                  style={{ animationDelay: `${Math.min(2.2, 1.2 + idx * 0.04)}s` }}
                  className="px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm hover:bg-white/[0.04] transition-all animate-cascade-row group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-7 font-mono font-black text-center rounded-lg py-0.5 text-xs ${
                      idx === 0
                        ? "bg-[#8cc63f] text-black"
                        : idx === 1
                        ? "bg-slate-300 text-black"
                        : idx === 2
                        ? "bg-amber-600 text-white"
                        : "text-white/40 bg-white/5"
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                      <Image
                        src={p.avatar || "/participants/khal.webp"}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-white group-hover:text-[#8cc63f] transition-colors truncate">{p.name}</span>
                      <span className="text-white/40 text-[11px] ml-2 hidden sm:inline truncate">
                        • {p.university}
                      </span>
                    </div>
                  </div>

                  <div className="font-mono font-black text-[#8cc63f] pl-2 flex-shrink-0 text-sm">
                    {p.score.toLocaleString()} PTS
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. Minimalist Bottom Stage Bar & Floating Navigation */}
      <footer className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        {/* Left: Sub-round Navigation Indicator */}
        <div className="text-xs text-white/40 hidden sm:block">
          Gunakan tombol <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">Spasi</kbd> atau <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">→</kbd> untuk melanjutkan
        </div>

        {/* Center / Right: Step Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Previous Step Button */}
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {/* Next Step / Next Question Button */}
          <button
            type="button"
            onClick={handleNextStep}
            className="px-4 sm:px-5 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(140,198,63,0.3)] hover:shadow-[0_0_25px_rgba(140,198,63,0.5)] flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>
              {normalizedPhase === "question_timer"
                ? "Buka Opsi (Options)"
                : normalizedPhase === "question_options"
                ? "Tampilkan Jawaban"
                : normalizedPhase === "correct_answer"
                ? "Tampilkan Leaderboard"
                : "Soal Berikutnya"}
            </span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </footer>
    </div>
  );
}
