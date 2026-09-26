"use client";

import { useState } from "react";
import Image from "next/image";
import { GameState } from "../lib/types.ts";
import {
  ROUND_1_SUBROUNDS,
  searchParticipants,
  applyScoreChange,
  updateRound2Status,
  getNextQuestionState,
  getPrevQuestionState,
  SAMPLE_QUESTIONS,
  formatTimerDisplay,
  ROUND_ELIMINATIONS,
  eliminateParticipant,
  reinstateParticipant,
  autoAdvanceTopScorers,
  getActiveRoundParticipants,
  GOLDEN_TICKET_NAMES,
} from "../lib/gameEngine.ts";
import {
  Search,
  Plus,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Layers,
  Clock,
  Award,
  Disc3,
  PartyPopper,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  HelpCircle,
  Ticket,
  UserX,
  UserCheck,
  Zap,
  Filter,
} from "lucide-react";

interface AdminConsoleProps {
  state: GameState;
  onUpdateState: (patch: Partial<GameState>) => void;
}

export function AdminConsole({ state, onUpdateState }: AdminConsoleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "eliminated" | "golden_ticket">("all");

  const currentQuota = ROUND_ELIMINATIONS[state.currentRound] || {
    round: state.currentRound,
    name: `Round ${state.currentRound}`,
    startingCount: 23,
    advancingCount: 18,
    eliminatedCount: 5,
    description: "Elimination quota",
  };

  const handleEliminate = (participantId: string) => {
    const updated = eliminateParticipant(state.participants, participantId, state.currentRound);
    onUpdateState({ participants: updated });
  };

  const handleReinstate = (participantId: string) => {
    const updated = reinstateParticipant(state.participants, participantId);
    onUpdateState({ participants: updated });
  };

  const handleAutoAdvance = (targetCount: number) => {
    if (confirm(`Auto-loloskan Top ${targetCount} peserta dengan skor tertinggi untuk Round ${state.currentRound}?`)) {
      const updated = autoAdvanceTopScorers(state.participants, state.currentRound, targetCount);
      onUpdateState({ participants: updated });
    }
  };

  const handleResetRoundElimination = () => {
    if (confirm(`Reset status eliminasi khusus Round ${state.currentRound}? Semua peserta yang tereliminasi di round ini akan dikembalikan ke status aktif.`)) {
      const updated = state.participants.map((p) => {
        if (p.eliminatedInRound === state.currentRound) {
          return {
            ...p,
            status: p.isGoldenTicket ? ("golden_ticket" as const) : ("active" as const),
            eliminatedInRound: null,
          };
        }
        return p;
      });
      onUpdateState({ participants: updated });
    }
  };

  // Filter participants in real-time without pressing Enter
  const searchedParticipants = searchParticipants(state.participants, searchQuery);

  const filteredParticipants = searchedParticipants.filter((p) => {
    const isGT = p.isGoldenTicket || GOLDEN_TICKET_NAMES.includes(p.name);
    const isEliminated = p.eliminatedInRound !== undefined && p.eliminatedInRound !== null;

    if (filterTab === "active") {
      if (state.currentRound <= 3) {
        return !isGT && !isEliminated;
      }
      return !isEliminated;
    }
    if (filterTab === "eliminated") {
      return isEliminated;
    }
    if (filterTab === "golden_ticket") {
      return isGT;
    }
    return true; // "all"
  });

  const currentSubRound = ROUND_1_SUBROUNDS[state.subRoundIndex] || ROUND_1_SUBROUNDS[0];

  const currentQuestion =
    SAMPLE_QUESTIONS.find(
      (q) => q.subRoundId === currentSubRound.id && q.questionNumber === state.questionIndex + 1
    ) || {
      id: `q-${currentSubRound.id}-${state.questionIndex + 1}`,
      roundId: 1,
      subRoundId: currentSubRound.id,
      questionNumber: state.questionIndex + 1,
      prompt: `Consulting Challenge Case #${state.questionIndex + 1} for ${currentSubRound.name}`,
      options: [],
      correctAnswer: "A",
    };

  // Helper to change score
  const handleScoreChange = (participantId: string, delta: number) => {
    const updated = applyScoreChange(state.participants, participantId, delta);
    onUpdateState({ participants: updated });
  };

  // Helper for Round 2 pass/fail
  const handleRound2Toggle = (participantId: string, status: "pending" | "passed" | "failed") => {
    const updated = updateRound2Status(state.participants, participantId, status);
    onUpdateState({ participants: updated });
  };

  // Switch Round
  const handleSelectRound = (roundNum: number) => {
    onUpdateState({ currentRound: roundNum });
  };

  // Switch Sub-round for Round 1
  const handleSelectSubRound = (subRoundIdx: number) => {
    onUpdateState({
      subRoundIndex: subRoundIdx,
      questionIndex: 0,
      round1Phase: "question_timer",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: false,
    });
  };

  // Step 1: Question & Timer
  const handleStepQuestionTimer = () => {
    onUpdateState({
      round1Phase: "question_timer",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: true,
    });
  };

  // Step 2: Question, Timer, Options
  const handleStepQuestionOptions = () => {
    onUpdateState({
      round1Phase: "question_options",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: true,
    });
  };

  // Step 3: Correct Answer
  const handleStepCorrectAnswer = () => {
    onUpdateState({
      round1Phase: "correct_answer",
      round1TimerRunning: false,
      round1TimeRemainingMs: 0,
    });
  };

  // Step 4: Leaderboard
  const handleStepLeaderboard = () => {
    onUpdateState({
      round1Phase: "leaderboard",
      round1TimerRunning: false,
    });
  };

  // Step 5: Next Soal
  const handleNextQuestion = () => {
    const next = getNextQuestionState(state.subRoundIndex, state.questionIndex);
    onUpdateState({
      subRoundIndex: next.subRoundIndex,
      questionIndex: next.questionIndex,
      round1Phase: "question_timer",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: true,
    });
  };

  // Prev Soal
  const handlePrevQuestion = () => {
    const prev = getPrevQuestionState(state.subRoundIndex, state.questionIndex);
    onUpdateState({
      subRoundIndex: prev.subRoundIndex,
      questionIndex: prev.questionIndex,
      round1Phase: "question_timer",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: false,
    });
  };

  // One-click Next Step
  const handleNextStep = () => {
    const current = state.round1Phase;
    if (current === "question_timer" || current === "preview" || current === "idle") {
      handleStepQuestionOptions();
    } else if (current === "question_options" || current === "answering") {
      handleStepCorrectAnswer();
    } else if (current === "correct_answer") {
      handleStepLeaderboard();
    } else if (current === "leaderboard") {
      handleNextQuestion();
    }
  };

  // One-click Prev Step
  const handlePrevStep = () => {
    const current = state.round1Phase;
    if (current === "leaderboard") {
      handleStepCorrectAnswer();
    } else if (current === "correct_answer") {
      handleStepQuestionOptions();
    } else if (current === "question_options" || current === "answering") {
      handleStepQuestionTimer();
    } else if (current === "question_timer" || current === "preview" || current === "idle") {
      handlePrevQuestion();
    }
  };

  // Pause / Resume Round 1 Timer
  const handleToggleRound1Timer = () => {
    onUpdateState({
      round1TimerRunning: !state.round1TimerRunning,
    });
  };

  // Reset Round 1 Timer
  const handleResetRound1Timer = () => {
    onUpdateState({
      round1TimeRemainingMs: 30000,
      round1TimerRunning: false,
      round1Phase: "question_timer",
    });
  };

  // Reset All Game Data
  const handleResetAllGame = () => {
    if (confirm("Reset all participants scores and round states to default?")) {
      const resetParticipants = state.participants.map((p) => ({
        ...p,
        score: 0,
        round2Status: "pending" as const,
      }));
      onUpdateState({
        currentRound: 1,
        subRoundIndex: 0,
        questionIndex: 0,
        round1Phase: "idle",
        round1TimeRemainingMs: 30000,
        round1TimerRunning: false,
        round3TimeRemainingMs: 300000,
        round3TimerRunning: false,
        round4TimeRemainingMs: 60000,
        round4TimerRunning: false,
        round5TimeRemainingMs: 180000,
        round5TimerRunning: false,
        round5GameEnded: false,
        participants: resetParticipants,
      });
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Top Header & Round Switcher */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#8cc63f] text-black shadow-[0_0_15px_rgba(140,198,63,0.4)]">
                <Shield className="w-3.5 h-3.5" />
                Admin Director Console
              </span>
              <span className="text-xs text-white/50">TV Production Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight uppercase">
              Competition Management & Live Scoring
            </h1>
          </div>

          <button
            onClick={handleResetAllGame}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Game State
          </button>
        </div>

        {/* Master Round Navigation Selector */}
        <div className="mt-6">
          <label className="text-xs uppercase font-extrabold tracking-wider text-white/50 mb-3 block">
            Select Active Competition Round (Broadcasted to Stage & Participants):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { num: 1, title: "The Gauntlet", desc: "23 → 18 Peserta" },
              { num: 2, title: "Capital Conquest", desc: "18 → 15 Peserta" },
              { num: 3, title: "Rootmaster", desc: "15 → 12 Peserta" },
              { num: 4, title: "Sacred Handoff", desc: "12 → 9 (Golden Ticket)" },
              { num: 5, title: "Pressure Chamber", desc: "9 → 5 Peserta" },
              { num: 6, title: "Executive Pitch", desc: "5 Finalis (Juara 1-3, H1-2)" },
            ].map((r) => (
              <button
                key={r.num}
                type="button"
                onClick={() => handleSelectRound(r.num)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  state.currentRound === r.num
                    ? "bg-[#8cc63f] text-black border-[#8cc63f] font-black shadow-[0_0_20px_rgba(140,198,63,0.3)] scale-[1.02]"
                    : "glass-card border-white/10 text-white hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase">Round {r.num}</span>
                  {state.currentRound === r.num && (
                    <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                  )}
                </div>
                <div className="font-extrabold text-xs sm:text-sm mt-1 line-clamp-1">{r.title}</div>
                <div
                  className={`text-[10px] mt-0.5 line-clamp-1 ${
                    state.currentRound === r.num ? "text-black/70 font-semibold" : "text-white/40"
                  }`}
                >
                  {r.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Round-Specific Operations Bar */}
      {state.currentRound === 1 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 space-y-6">
          {/* Header & Flow Title */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#8cc63f] text-black">
                  <Layers className="w-3.5 h-3.5" />
                  Round 1: The Gauntlet Flow Controller
                </span>
                <span className="text-xs text-white/50">
                  Sub-Round #{currentSubRound.id}: {currentSubRound.name} • Soal #{state.questionIndex + 1}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1 uppercase">
                Alur Presentasi Game The Gauntlet
              </h2>
            </div>

            {/* Quick Link to Stage */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#8cc63f]" />
              Buka Layar Stage (Full Screen)
            </a>
          </div>

          {/* Active Question Preview Box & Correct Answer */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8cc63f] uppercase mb-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Soal #{state.questionIndex + 1} ({currentSubRound.name} • +{currentSubRound.points} PTS)
                </div>
                <p className="text-sm font-semibold text-white/90 line-clamp-2">
                  {currentQuestion.prompt}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-[#8cc63f]/20 border border-[#8cc63f]/30 text-center">
                  <div className="text-[10px] uppercase font-bold text-white/50">Kunci Jawaban</div>
                  <div className="text-lg font-black text-[#8cc63f]">
                    Option {currentQuestion.correctAnswer}
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[10px] uppercase font-bold text-white/50">Timer Gauntlet</div>
                  <div
                    className={`text-lg font-mono font-black ${
                      state.round1TimeRemainingMs <= 5000 && state.round1TimerRunning
                        ? "text-red-500 animate-pulse"
                        : "text-white"
                    }`}
                  >
                    {formatTimerDisplay(state.round1TimeRemainingMs)}
                  </div>
                </div>
              </div>
            </div>

            {/* Options Preview for Admin */}
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-white/10">
                {currentQuestion.options.map((opt) => {
                  const isCorrect = opt.key === currentQuestion.correctAnswer;
                  return (
                    <div
                      key={opt.key}
                      className={`p-2 rounded-xl text-xs flex items-start gap-2 border transition-all ${
                        isCorrect
                          ? "bg-[#8cc63f]/20 border-[#8cc63f] text-white font-bold shadow-sm"
                          : "bg-white/[0.02] border-white/5 text-white/70"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] flex-shrink-0 ${
                          isCorrect ? "bg-[#8cc63f] text-black" : "bg-white/10 text-white/70"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="line-clamp-2 leading-snug">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5-Step Flow Buttons (Direct Trigger) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-white/50">
                Pilih Tahap Alur Gauntlet (Questions & Timer → Options → Correct Answer → Leaderboard → Next Soal):
              </span>
              <span className="text-xs font-bold text-[#8cc63f]">
                Aktif: {state.round1Phase}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {/* Step 1 */}
              <button
                type="button"
                onClick={handleStepQuestionTimer}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  state.round1Phase === "question_timer" || state.round1Phase === "preview"
                    ? "bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02]"
                    : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="text-[10px] uppercase font-black opacity-70">Langkah 1</div>
                <div className="font-extrabold text-xs sm:text-sm mt-0.5">1. Soal & Timer</div>
                <div className="text-[11px] opacity-75 mt-0.5">30s Reading Period</div>
              </button>

              {/* Step 2 */}
              <button
                type="button"
                onClick={handleStepQuestionOptions}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  state.round1Phase === "question_options" || state.round1Phase === "answering"
                    ? "bg-blue-500 text-white border-blue-400 font-black shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-[1.02]"
                    : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="text-[10px] uppercase font-black opacity-70">Langkah 2</div>
                <div className="font-extrabold text-xs sm:text-sm mt-0.5">2. Soal, Timer, Opsi</div>
                <div className="text-[11px] opacity-75 mt-0.5">Buka Opsi A–F (30s)</div>
              </button>

              {/* Step 3 */}
              <button
                type="button"
                onClick={handleStepCorrectAnswer}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  state.round1Phase === "correct_answer"
                    ? "bg-[#8cc63f] text-black border-[#8cc63f] font-black shadow-[0_0_15px_rgba(140,198,63,0.4)] scale-[1.02]"
                    : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="text-[10px] uppercase font-black opacity-70">Langkah 3</div>
                <div className="font-extrabold text-xs sm:text-sm mt-0.5">3. Jawaban Benar</div>
                <div className="text-[11px] opacity-75 mt-0.5">Reveal Correct Answer</div>
              </button>

              {/* Step 4 */}
              <button
                type="button"
                onClick={handleStepLeaderboard}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  state.round1Phase === "leaderboard"
                    ? "bg-purple-600 text-white border-purple-400 font-black shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-[1.02]"
                    : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="text-[10px] uppercase font-black opacity-70">Langkah 4</div>
                <div className="font-extrabold text-xs sm:text-sm mt-0.5">4. Leaderboard</div>
                <div className="text-[11px] opacity-75 mt-0.5">Tampilkan Klasemen</div>
              </button>

              {/* Step 5 */}
              <button
                type="button"
                onClick={handleNextQuestion}
                className="p-3 rounded-2xl text-left border transition-all bg-white/[0.03] border-white/10 hover:border-[#8cc63f]/50 hover:bg-[#8cc63f]/10 text-white group"
              >
                <div className="text-[10px] uppercase font-black opacity-70 text-[#8cc63f]">
                  Langkah 5
                </div>
                <div className="font-extrabold text-xs sm:text-sm mt-0.5 group-hover:text-[#8cc63f] flex items-center justify-between">
                  <span>5. Next Soal</span>
                  <ChevronRight className="w-4 h-4 text-[#8cc63f]" />
                </div>
                <div className="text-[11px] opacity-75 mt-0.5">Lanjut Soal #{state.questionIndex + 2}</div>
              </button>
            </div>
          </div>

          {/* Master Flow Actions Bar (Big Next / Prev & Timer Controls) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Langkah Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(140,198,63,0.3)] transition-all active:scale-95"
              >
                <span>
                  {state.round1Phase === "question_timer" || state.round1Phase === "preview" || state.round1Phase === "idle"
                    ? "Buka Opsi (Step 2) →"
                    : state.round1Phase === "question_options" || state.round1Phase === "answering"
                    ? "Tampilkan Jawaban Benar (Step 3) →"
                    : state.round1Phase === "correct_answer"
                    ? "Tampilkan Leaderboard (Step 4) →"
                    : "Lanjut ke Soal Berikutnya (Step 5) →"}
                </span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Quick Timer Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleRound1Timer}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1.5"
              >
                {state.round1TimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {state.round1TimerRunning ? "Pause Timer" : "Mulai Timer"}
              </button>

              <button
                type="button"
                onClick={handleResetRound1Timer}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset 30s</span>
              </button>

              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={state.questionIndex === 0 && state.subRoundIndex === 0}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white font-bold text-xs flex items-center gap-1"
                title="Soal Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Soal Sebelumnya
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1"
                title="Soal Berikutnya"
              >
                Soal Berikutnya <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sub-round Switcher */}
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-white/50 block mb-2">
              Pilih Sub-Round Langsung (8 Sub-rounds):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {ROUND_1_SUBROUNDS.map((sr, idx) => {
                const isSelected = state.subRoundIndex === idx;
                const isCrisis = sr.name.includes("CRISIS");

                return (
                  <button
                    key={sr.id}
                    type="button"
                    onClick={() => handleSelectSubRound(idx)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? isCrisis
                          ? "bg-red-600 text-white border-red-500 font-black shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                          : "bg-[#8cc63f] text-black border-[#8cc63f] font-black shadow-[0_0_15px_rgba(140,198,63,0.3)]"
                        : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold opacity-70">
                      {isCrisis ? "Emergency" : `Rank #${sr.id}`}
                    </div>
                    <div className="text-xs font-extrabold line-clamp-1 mt-0.5">{sr.name}</div>
                    <div className="text-[11px] font-bold text-[#8cc63f] mt-1">+{sr.points} pts</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Round 2 Admin Controls */}
      {state.currentRound === 2 && (
        <div className="glass-panel p-6 rounded-3xl border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Round 2: Capital Conquest Pass / Fail Decider
              </h2>
              <p className="text-xs text-white/50">
                Mark participants as Passed or Failed. Correct answer is configured to {state.round2TargetAnswer}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50 font-semibold">Target Answer:</label>
              <input
                type="number"
                value={state.round2TargetAnswer}
                onChange={(e) =>
                  onUpdateState({ round2TargetAnswer: parseInt(e.target.value, 10) || 1467 })
                }
                className="w-24 bg-neutral-900 border border-white/20 rounded-lg px-2.5 py-1 text-sm text-[#8cc63f] font-bold text-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* Round 3 Admin Controls */}
      {state.currentRound === 3 && (
        <div className="glass-panel p-6 rounded-3xl border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Round 3: Rootmaster Stage Timer
              </h2>
              <p className="text-xs text-white/50">
                Remote control the precision countdown (Mins:Seconds:Hundredths).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateState({ round3TimerRunning: !state.round3TimerRunning })}
                className="px-5 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(140,198,63,0.3)]"
              >
                {state.round3TimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                {state.round3TimerRunning ? "Pause Timer" : "Start Timer"}
              </button>
              <button
                onClick={() =>
                  onUpdateState({ round3TimeRemainingMs: 300000, round3TimerRunning: false })
                }
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Reset (5m)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round 4 Admin Controls (Sacred Handoff: 12 -> 9) */}
      {state.currentRound === 4 && (
        <div className="glass-panel p-6 rounded-3xl border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Ticket className="w-3.5 h-3.5" />
                  Round 4: Sacred Handoff Controller
                </span>
                <span className="text-xs text-white/50">12 Kontender → 9 Lolos</span>
              </div>
              <h2 className="text-lg font-black text-white uppercase mt-1">
                Golden Ticket Official Entrance & Elimination (12 → 9)
              </h2>
              <p className="text-xs text-white/60">
                3 Peserta Golden Ticket (Rifqi, Cyka, Ahmad Reva) resmi aktif dan bersaing bersama 9 kontender yang lolos dari Rootmaster.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateState({ round4TimerRunning: !state.round4TimerRunning })}
                className="px-5 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(140,198,63,0.3)] cursor-pointer"
              >
                {state.round4TimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                {state.round4TimerRunning ? "Pause Timer" : "Start Timer"}
              </button>
              <button
                onClick={() =>
                  onUpdateState({ round4TimeRemainingMs: 300000, round4TimerRunning: false })
                }
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Reset (5m)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round 5 Admin Controls (Pressure Chamber: 9 -> 5) */}
      {state.currentRound === 5 && (
        <div className="glass-panel p-6 rounded-3xl border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                  <Disc3 className="w-3.5 h-3.5" />
                  Round 5: Pressure Chamber Controller
                </span>
                <span className="text-xs text-white/50">9 Kontender → 5 Finalis</span>
              </div>
              <h2 className="text-lg font-black text-white uppercase mt-1">
                Pressure Chamber (9 Names Spin Wheel)
              </h2>
              <p className="text-xs text-white/50">
                Atur 9 nama kandidat roulette dan timer hitung mundur eliminasi.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onUpdateState({
                    round5TimerRunning: !state.round5TimerRunning,
                    round4TimerRunning: !state.round4TimerRunning,
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase flex items-center gap-1 cursor-pointer"
              >
                {state.round5TimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                {state.round5TimerRunning ? "Pause Timer" : "Start Timer"}
              </button>
              <button
                onClick={() =>
                  onUpdateState({
                    round5TimeRemainingMs: 60000,
                    round5TimerRunning: false,
                    round4TimeRemainingMs: 60000,
                    round4TimerRunning: false,
                  })
                }
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset (60s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round 6 Admin Controls (Executive Pitch: 5 Finalists) */}
      {state.currentRound === 6 && (
        <div className="glass-panel p-6 rounded-3xl border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Award className="w-3.5 h-3.5" />
                  Round 6: Executive Pitch Final
                </span>
                <span className="text-xs text-white/50">Penentuan Juara 1, 2, 3, Harapan 1 & 2</span>
              </div>
              <h2 className="text-lg font-black text-white uppercase mt-1 gold-gradient">
                Executive Pitch Final Controls
              </h2>
              <p className="text-xs text-white/50">
                Input skor akhir 5 finalis dan tutup game untuk pengumuman pemenang resmi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  onUpdateState({
                    round6TimerRunning: !state.round6TimerRunning,
                    round5TimerRunning: !state.round5TimerRunning,
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase flex items-center gap-1 cursor-pointer"
              >
                {state.round6TimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                {state.round6TimerRunning ? "Pause Timer" : "Start Timer"}
              </button>
              <button
                onClick={() =>
                  onUpdateState({
                    round6TimeRemainingMs: 180000,
                    round6TimerRunning: false,
                    round5TimeRemainingMs: 180000,
                    round5TimerRunning: false,
                  })
                }
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Timer
              </button>
              <button
                onClick={() => onUpdateState({ round6GameEnded: true, round5GameEnded: true })}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(251,191,36,0.5)] cursor-pointer"
              >
                <PartyPopper className="w-4 h-4" /> End Game & Reveal Winner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elimination Quota Controller Panel (Requirement 5) */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-[#8cc63f] text-black shadow-sm">
                <Zap className="w-3.5 h-3.5" /> Elimination Center
              </span>
              <span className="text-xs text-white/50 font-semibold">
                Alur Eliminasi Round {state.currentRound}: {currentQuota.name}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              Target Kuota: {currentQuota.description}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleAutoAdvance(currentQuota.advancingCount)}
              className="px-4 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Loloskan Top {currentQuota.advancingCount} (Skor Tertinggi)</span>
            </button>

            <button
              type="button"
              onClick={handleResetRoundElimination}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Eliminasi Round Ini</span>
            </button>
          </div>
        </div>

        {/* Golden Ticket Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center gap-3 text-xs">
          <Ticket className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-white/80 leading-relaxed">
            <strong className="text-amber-300 font-extrabold">3 Peserta Golden Ticket: </strong>
            Rifqi Syarifuddin Yasykur, Cyka Srihana Humaera, Ahmad Reva Dany Fawwaz{" "}
            {state.currentRound <= 3 ? (
              <span className="text-white/60">
                (Bypass Round 1-3 dan akan langsung bertanding di Round 4 Sacred Handoff).
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">
                (RESMI AKTIF bertanding di arena mulai Round 4 Sacred Handoff).
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Score Table with BIG Prominent Instant Search Bar & Filter Tabs */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Live Scoring & Participant Directory
            </h2>
            <p className="text-xs text-white/50">
              Template: <span className="text-[#8cc63f] font-mono font-bold">Round Name | Name | Total Score</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/50 font-bold">Current Sub-Round Reward:</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30 font-extrabold">
              +{currentSubRound.points} pts ({currentSubRound.name})
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-white/40 uppercase font-bold text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterTab === "all"
                  ? "bg-[#8cc63f] text-black font-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              Semua ({state.participants.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("active")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterTab === "active"
                  ? "bg-emerald-500 text-black font-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              Aktif Round Ini ({state.participants.filter((p) => {
                const isGT = p.isGoldenTicket || GOLDEN_TICKET_NAMES.includes(p.name);
                const isEliminated = p.eliminatedInRound !== undefined && p.eliminatedInRound !== null;
                if (state.currentRound <= 3) return !isGT && !isEliminated;
                return !isEliminated;
              }).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("eliminated")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterTab === "eliminated"
                  ? "bg-red-500 text-white font-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              Tereliminasi ({state.participants.filter((p) => p.eliminatedInRound !== undefined && p.eliminatedInRound !== null).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("golden_ticket")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterTab === "golden_ticket"
                  ? "bg-amber-400 text-black font-black"
                  : "bg-white/5 text-amber-300/80 hover:bg-white/10"
              }`}
            >
              <Ticket className="w-3 h-3" />
              Golden Ticket (3)
            </button>
          </div>

          {/* Big Prominent Search Bar (Requirement: already shows names without entering) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
              <Search className="w-5 h-5 text-[#8cc63f]" />
            </div>
            <input
              type="text"
              placeholder="Type name or university to filter participants instantly (e.g. Rifqi, Brawijaya, ITS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-900/90 border-2 border-white/20 text-white font-bold text-base sm:text-lg placeholder-white/30 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-white/50 px-1">
          <span>
            Showing <strong className="text-white">{filteredParticipants.length}</strong> of{" "}
            {state.participants.length} participants
          </span>
          <span>Click + or - to update score, or toggle status eliminasi</span>
        </div>

        {/* The Scoring Table (Template: Round Name | Name | Total Score) */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white/60">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Status & Eliminasi</th>
                <th className="py-3 px-4">Participant Name & University</th>
                <th className="py-3 px-4 text-center">Round 2 Status</th>
                <th className="py-3 px-4 text-right">Total Score</th>
                <th className="py-3 px-4 text-center">Manage Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredParticipants.map((p, idx) => {
                const isGT = p.isGoldenTicket || GOLDEN_TICKET_NAMES.includes(p.name);
                const isEliminated = p.eliminatedInRound !== undefined && p.eliminatedInRound !== null;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-xs font-mono text-white/40">{idx + 1}</td>

                    {/* Elimination Status & Quick Toggle Column */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        {isGT && state.currentRound <= 3 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Ticket className="w-3 h-3" /> Golden Ticket
                          </span>
                        ) : isEliminated ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                              <UserX className="w-3 h-3" /> Tereliminasi R{p.eliminatedInRound}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleReinstate(p.id)}
                              title="Kembalikan ke status aktif"
                              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-[10px] font-bold cursor-pointer"
                            >
                              Pulihkan
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              <UserCheck className="w-3 h-3" /> Aktif
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEliminate(p.id)}
                              title={`Eliminasi di Round ${state.currentRound}`}
                              className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[10px] font-bold cursor-pointer"
                            >
                              Eliminasi
                            </button>
                          </div>
                        )}
                        <span className="text-[10px] text-white/40 font-mono">
                          R{state.currentRound}: {currentSubRound.name}
                        </span>
                      </div>
                    </td>

                    {/* Name & University */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-neutral-900">
                          <Image
                            src={p.avatar || "/participants/khal.webp"}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm group-hover:text-[#8cc63f] transition-colors flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isGT && (
                              <span title="Golden Ticket Holder" className="text-amber-400 text-xs">
                                🎫
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/40">{p.university}</div>
                        </div>
                      </div>
                    </td>

                    {/* Round 2 Pass / Fail Toggle */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleRound2Toggle(p.id, "passed")}
                          title="Mark Passed"
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            p.round2Status === "passed"
                              ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)] font-black"
                              : "bg-white/5 text-white/50 hover:bg-emerald-500/20 hover:text-emerald-300"
                          }`}
                        >
                          Passed
                        </button>
                        <button
                          onClick={() => handleRound2Toggle(p.id, "failed")}
                          title="Mark Failed"
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            p.round2Status === "failed"
                              ? "bg-red-500 text-white font-black"
                              : "bg-white/5 text-white/50 hover:bg-red-500/20 hover:text-red-300"
                          }`}
                        >
                          Failed
                        </button>
                        {p.round2Status !== "pending" && (
                          <button
                            onClick={() => handleRound2Toggle(p.id, "pending")}
                            title="Reset to Pending"
                            className="px-1 text-white/30 hover:text-white/70 text-xs cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Total Score Column */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-black text-lg text-[#8cc63f]">
                        {p.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] uppercase text-white/30 font-bold">PTS</div>
                    </td>

                    {/* Add / Remove Points Buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Add current sub-round point */}
                        <button
                          onClick={() => handleScoreChange(p.id, currentSubRound.points)}
                          title={`Add +${currentSubRound.points} pts`}
                          className="px-2.5 py-1 rounded-lg bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />+{currentSubRound.points}
                        </button>

                        {/* Add +10 */}
                        <button
                          onClick={() => handleScoreChange(p.id, 10)}
                          title="Add +10 pts"
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                        >
                          +10
                        </button>

                        {/* Deduct -10 */}
                        <button
                          onClick={() => handleScoreChange(p.id, -10)}
                          title="Deduct -10 pts"
                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold cursor-pointer"
                        >
                          -10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
