"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Question, SubRoundConfig, Round1Phase, Participant } from "../lib/types.ts";
import {
  ROUND_1_SUBROUNDS,
  formatTimerDisplay,
  SAMPLE_QUESTIONS,
  calculateLeaderboard,
  isGoldenTicket,
  GOLDEN_TICKET_NAMES,
  getParticipantPhoto,
  getParticipantPhotoPosition,
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
  const lastPlayedSecondRef = useRef<number>(-1);

  // Audio timer effects (trigger only once per full second tick, never on 100ms ticks)
  useEffect(() => {
    if (!timerRunning) {
      lastPlayedSecondRef.current = -1;
      return;
    }
    if (normalizedPhase !== "question_timer" && normalizedPhase !== "question_options") return;

    if (secondsLeft !== lastPlayedSecondRef.current) {
      lastPlayedSecondRef.current = secondsLeft;
      if (secondsLeft <= 5 && secondsLeft > 0) {
        playHurryTick(soundEnabled);
      } else if (secondsLeft > 0) {
        playTick(soundEnabled);
      } else if (secondsLeft === 0) {
        playBuzzer(soundEnabled);
      }
    }
  }, [secondsLeft, timerRunning, normalizedPhase, soundEnabled]);

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

  const isLastQuestionOfSubRound = questionIndex >= currentSubRound.questionCount - 1;

  const handleNextStep = () => {
    if (normalizedPhase === "question_timer") {
      onPhaseChange?.("question_options");
    } else if (normalizedPhase === "question_options") {
      onPhaseChange?.("correct_answer");
    } else if (normalizedPhase === "correct_answer") {
      // Leaderboard only appears when the sub-round finishes (not per question!)
      if (isLastQuestionOfSubRound) {
        onPhaseChange?.("leaderboard");
      } else {
        if (onNextQuestion) {
          onNextQuestion();
        } else {
          onPhaseChange?.("question_timer");
        }
      }
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

  const handleNextStepRef = useRef(handleNextStep);
  handleNextStepRef.current = handleNextStep;
  const handlePrevStepRef = useRef(handlePrevStep);
  handlePrevStepRef.current = handlePrevStep;

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
        handleNextStepRef.current();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevStepRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOptionClick = (key: string) => {
    if (normalizedPhase !== "question_options") return;
    setInternalSelected(key);
    onSelectAnswer?.(key);
  };

  const progressPercent = Math.min(100, Math.max(0, (timeRemainingMs / 30000) * 100));

  // In Round 1 (The Gauntlet), only non-golden-ticket regular participants compete
  const gauntletContenders = participants.filter((p) => !isGoldenTicket(p));
  const rankedGauntlet = calculateLeaderboard(
    gauntletContenders.length > 0 ? gauntletContenders : participants.filter((p) => !isGoldenTicket(p)).slice(0, 23)
  );
  const top18 = rankedGauntlet.slice(0, 18);
  const bottom5 = rankedGauntlet.slice(18, 23);

  return (
    <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 select-none animate-in fade-in duration-300 min-h-0 overflow-hidden">
      {/* 1. Minimalist Top Meta Bar */}
      <header className="flex items-center justify-between gap-4 pb-3 border-b border-white/10 flex-shrink-0">
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
              <div className="flex items-center gap-3 px-8 py-3 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg">
                <Clock
                  className={`w-6 h-6 ${
                    timeRemainingMs <= 5000 && timerRunning
                      ? "text-red-500 animate-pulse"
                      : "text-amber-400"
                  }`}
                />
                <span
                  className={`font-mono text-4xl sm:text-5xl font-black tracking-widest ${
                    timeRemainingMs <= 5000 && timerRunning
                      ? "text-red-500 animate-pulse"
                      : "text-white"
                  }`}
                >
                  {formatTimerDisplay(timeRemainingMs)}
                </span>
              </div>

              {/* Minimalist Progress Line */}
              <div className="w-64 sm:w-80 bg-white/10 h-1.5 rounded-full overflow-hidden mt-4">
                <div
                  className={`h-full transition-all duration-100 ${
                    timeRemainingMs <= 5000 ? "bg-red-500" : "bg-[#8cc63f]"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Prompt (Clear & Prominent) */}
            <div className="py-6 sm:py-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-relaxed tracking-tight max-w-3xl mx-auto">
                {currentQuestion.prompt}
              </h2>
            </div>
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
        {/* FLOW STEP 4: Full-Screen High-Visibility Leaderboard (All 23 Players Clear & Legible) */}
        {/* ============================================================ */}
        {normalizedPhase === "leaderboard" && (
          <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-[#23D700]/20 text-[#23D700] border border-[#23D700]/40">
                    <Trophy className="w-4 h-4" /> Klasemen Akhir: {currentSubRound.name}
                  </span>
                  <span className="text-xs font-mono text-white/60 hidden sm:inline">
                    23 Peserta The Gauntlet
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-1 font-sans">
                  The Gauntlet Leaderboard
                </h2>
              </div>

              {/* Status Legend Badges */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#23D700]/15 border border-[#23D700]/40 text-[#23D700] text-xs font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Top 18 Lolos</span>
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-mono font-bold">
                  <span>5 Gugur</span>
                </div>
              </div>
            </div>

            {/* Split Arena: 18 Qualified (Cols 1-9) + 5 Danger Zone (Cols 10-12) */}
            <div className="flex-1 grid grid-cols-12 gap-3.5 min-h-0 overflow-hidden">
              {/* TOP 18 QUALIFIED (COLUMNS 1 to 9) */}
              <div className="col-span-12 lg:col-span-9 flex flex-col min-h-0 h-full rounded-2xl bg-black/40 border border-white/10 p-2.5 sm:p-3 overflow-hidden">
                <div className="flex items-center justify-between px-1.5 pb-2 flex-shrink-0 border-b border-white/10 mb-2">
                  <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#23D700] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#23D700] animate-pulse" />
                    Kualifikasi Lolos Capital Conquest (Peringkat 1 - 18)
                  </span>
                  <span className="text-xs text-white/50 font-mono font-bold">18 / 23 PESERTA</span>
                </div>

                {/* 3 Columns x 6 Rows Grid = Exactly 18 Contenders */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 grid-rows-6 gap-2 min-h-0 overflow-hidden">
                  {top18.map((p, idx) => {
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
                            : "bg-white/[0.04] border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]"
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
                                : "bg-[#23D700]/20 text-[#23D700] border border-[#23D700]/30"
                            }`}
                          >
                            {rank}
                          </div>

                          {/* Avatar with fixed top alignment */}
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

                          {/* Name & University (Bigger & Crisp) */}
                          <div className="min-w-0 leading-tight">
                            <div className="font-bold text-xs sm:text-sm text-white truncate font-sans">
                              {p.name}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-white/50 truncate font-mono">
                              {p.university}
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="font-mono font-black text-xs sm:text-sm text-[#23D700] flex-shrink-0 text-right">
                          {p.score} <span className="text-[10px] text-white/40">PTS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM 5 ELIMINATION / DANGER ZONE (COLUMNS 10 to 12) */}
              <div className="col-span-12 lg:col-span-3 flex flex-col justify-between min-h-0 h-full rounded-2xl bg-red-950/25 border-2 border-red-500/40 p-2.5 sm:p-3 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <div className="px-1.5 pb-2 flex-shrink-0 border-b border-red-500/30 mb-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      ⚠️ Zona Eliminasi
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold uppercase">
                      5 Peserta
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-mono text-red-300/70 mt-0.5">
                    Peringkat 19 - 23 • Belum Lolos
                  </div>
                </div>

                {/* 5 Compact Cards */}
                <div className="flex-1 flex flex-col justify-between gap-1.5 min-h-0 py-0.5">
                  {bottom5.map((p, idx) => {
                    const rank = 19 + idx;
                    return (
                      <div
                        key={p.id}
                        className="px-2.5 py-2 rounded-xl bg-red-500/[0.08] border border-red-500/25 flex items-center justify-between gap-2 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded-md bg-red-500/25 text-red-300 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                            #{rank}
                          </span>

                          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-red-400/40 flex-shrink-0 opacity-90 bg-neutral-900">
                            <Image
                              src={p.avatar || getParticipantPhoto(p.name)}
                              alt={p.name}
                              fill
                              sizes="32px"
                              style={{ objectPosition: getParticipantPhotoPosition(p.name) }}
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 leading-tight">
                            <div className="font-bold text-xs sm:text-sm text-white/90 truncate font-sans">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-red-200/60 truncate font-mono">
                              {p.university}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 font-mono">
                          <div className="text-xs sm:text-sm font-bold text-red-300">{p.score} PTS</div>
                          <div className="text-[9px] uppercase tracking-wider font-extrabold text-red-400/90">
                            GUGUR
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-red-500/30 text-[10px] sm:text-xs font-mono text-center text-red-300/60 flex-shrink-0">
                  Hanya Top 18 yang maju ke Capital Conquest
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Minimalist Bottom Stage Bar & Floating Navigation */}
      <footer className="pt-3 border-t border-white/10 flex items-center justify-end gap-4 flex-shrink-0">
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
                ? isLastQuestionOfSubRound
                  ? "Tampilkan Leaderboard (Akhir Sub-Round)"
                  : "Soal Berikutnya"
                : subRoundIndex + 1 < ROUND_1_SUBROUNDS.length
                ? `Lanjut ke ${ROUND_1_SUBROUNDS[subRoundIndex + 1].name}`
                : "The Gauntlet Selesai"}
            </span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </footer>
    </div>
  );
}
