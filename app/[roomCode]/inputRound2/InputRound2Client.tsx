"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useGameState } from "../../../lib/useGameState.ts";
import {
  validateRound2Answer,
  searchParticipants,
  getParticipantPhoto,
  getParticipantPhotoPosition,
  getActiveRoundParticipants,
} from "../../../lib/gameEngine.ts";
import { playSuccessFanfare } from "../../../lib/audio.ts";
import { Participant } from "../../../lib/types.ts";
import {
  Send,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Award,
  UserCheck,
  RefreshCw,
  Tv,
  ArrowRight,
  Radio,
} from "lucide-react";

interface InputRound2ClientProps {
  roomCode: string;
}

export function InputRound2Client({ roomCode }: InputRound2ClientProps) {
  const [gameState, updateState, activeRoom] = useGameState(roomCode);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationCountdown, setCelebrationCountdown] = useState(10);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedParticipant = selectedParticipantId
    ? gameState.participants.find((p) => p.id === selectedParticipantId) || null
    : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeRound2Contenders = getActiveRoundParticipants(gameState.participants, 2);
  const recommendations = searchParticipants(activeRound2Contenders, searchQuery);

  const handleSelectParticipant = (p: Participant) => {
    setSelectedParticipantId(p.id);
    setIsDropdownOpen(false);
    setSearchQuery("");
    setSubmissionError(null);
  };

  const handleResetSelection = () => {
    setSelectedParticipantId(null);
    setAnswerInput("");
    setSubmissionError(null);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#8cc63f", "#34d399", "#fbbf24", "#ffffff"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.6 },
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.6 },
        });
      }, 300);
    } catch {}
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) return;
    setSubmissionError(null);

    const isCorrect = validateRound2Answer(answerInput, gameState.round2TargetAnswer);
    // Clear input field whether wrong or right
    setAnswerInput("");

    if (isCorrect) {
      triggerConfetti();
      playSuccessFanfare(gameState.soundEnabled);
      setCelebrationCountdown(10);
      setShowCelebration(true);

      const now = Date.now();
      const updatedParticipants = gameState.participants.map((p) =>
        p.id === selectedParticipant.id
          ? { ...p, round2Status: "passed" as const, passedAt: p.passedAt || now }
          : p
      );
      updateState({ participants: updatedParticipants });
    } else {
      // Clear all inputs on incorrect answer
      setSelectedParticipantId(null);
      setSearchQuery("");
      setSubmissionError("Jawaban salah! Nilai valuasi tidak sesuai. Silakan hitung kembali dan coba lagi.");
    }
  };

  useEffect(() => {
    if (!showCelebration) return;

    const autoCloseTimer = setTimeout(() => {
      setShowCelebration(false);
    }, 10000);

    const interval = setInterval(() => {
      setCelebrationCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(autoCloseTimer);
      clearInterval(interval);
    };
  }, [showCelebration]);

  const isAlreadyPassed = selectedParticipant?.round2Status === "passed";

  return (
    <div className="min-h-screen bg-[#05070a] bg-grid-pattern text-foreground flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none">
      {/* Top Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/40 border border-white/15 p-1 flex items-center justify-center flex-shrink-0">
            <Image
              src="/LogoCR.png"
              alt="180 Degrees Consulting UB"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white font-sans">180 CR</span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-[#0051C3]/20 text-[#38bdf8] border border-[#0051C3]/40">
                Participant Portal
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/15">
                Room: {activeRoom}
              </span>
            </div>
            <p className="text-xs font-mono text-white/50">Round 02 • Capital Conquest Valuation Submission</p>
          </div>
        </div>

        <Link
          href={`/${activeRoom}`}
          target="_blank"
          className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Tv className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Stage Screen</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full my-auto py-8">
        <div className="stage-panel p-6 sm:p-8 rounded-2xl border-white/10 bg-[#070b14]/90 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-[#0051C3]/20 text-[#38bdf8] border border-[#0051C3]/40">
              <Sparkles className="w-3.5 h-3.5" />
              Capital Conquest Submission
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Submit Calculated Valuation
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-mono max-w-md mx-auto">
              Select your contestant profile from the index, then input your calculated integer valuation.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitAnswer} className="space-y-6">
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white/70">
                1. Select Contestant
              </label>

              {!selectedParticipant ? (
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-4 h-4 text-white/40 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Search participant name or university..."
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-sm font-mono focus:outline-none focus:border-[#0051C3] focus:ring-1 focus:ring-[#0051C3] transition-all"
                    />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto rounded-xl bg-[#080d1a] border border-white/15 shadow-2xl p-2 divide-y divide-white/5">
                      {recommendations.length > 0 ? (
                        recommendations.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectParticipant(p)}
                            className="w-full text-left p-2.5 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 border border-white/20 relative flex-shrink-0">
                              <Image
                                src={getParticipantPhoto(p.name)}
                                alt={p.name}
                                fill
                                sizes="36px"
                                style={{ objectPosition: getParticipantPhotoPosition(p.name) }}
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="text-sm font-bold text-white group-hover:text-[#38bdf8] truncate font-sans">
                                {p.name}
                              </div>
                              <div className="text-[11px] font-mono text-white/50 truncate">{p.university}</div>
                            </div>
                            {p.round2Status === "passed" && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Passed
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs font-mono text-white/40">
                          No contestant found matching &quot;{searchQuery}&quot;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#0051C3]/10 border border-[#0051C3]/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-white/10 border border-[#38bdf8]/50 relative flex-shrink-0">
                      <Image
                        src={getParticipantPhoto(selectedParticipant.name)}
                        alt={selectedParticipant.name}
                        fill
                        sizes="44px"
                        style={{ objectPosition: getParticipantPhotoPosition(selectedParticipant.name) }}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                        {selectedParticipant.name}
                        <UserCheck className="w-4 h-4 text-[#38bdf8]" />
                      </div>
                      <div className="text-xs font-mono text-white/50">{selectedParticipant.university}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetSelection}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Answer Input */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white/70">
                2. Calculated Valuation (Integer)
              </label>
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                disabled={!selectedParticipant || isAlreadyPassed}
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={
                  !selectedParticipant
                    ? "Select participant first..."
                    : isAlreadyPassed
                    ? "Participant has already passed this round!"
                    : "Enter integer valuation (e.g. 1467)"
                }
                className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-lg font-mono focus:outline-none focus:border-[#0051C3] focus:ring-1 focus:ring-[#0051C3] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            {submissionError && (
              <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedParticipant || !answerInput || isAlreadyPassed}
              className="w-full py-3.5 rounded-xl bg-[#0051C3] hover:bg-[#0060e6] text-white font-mono font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(0,81,195,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Verify & Submit Valuation</span>
            </button>
          </form>
        </div>
      </main>

      {/* Success Celebration Modal */}
      {showCelebration && selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="stage-panel border border-[#0051C3] rounded-2xl p-8 max-w-md w-full text-center space-y-6 bg-[#080e1c] shadow-[0_0_50px_rgba(0,81,195,0.4)]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0051C3]/20 border border-[#0051C3] flex items-center justify-center text-[#38bdf8]">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#38bdf8] px-3 py-1 rounded bg-[#0051C3]/10 border border-[#0051C3]/30">
                Valuation Confirmed
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Qualification Confirmed
              </h2>
              <div className="text-lg font-bold text-white/90">{selectedParticipant.name}</div>
              <div className="text-xs font-mono text-white/60">{selectedParticipant.university}</div>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white/70">
              Your valuation integer is accurate and has been synced live to the stage display screen (Room: {activeRoom}).
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCelebration(false);
                handleResetSelection();
              }}
              className="w-full py-3 rounded-lg bg-[#0051C3] hover:bg-[#0060e6] text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Close ({celebrationCountdown}s)</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full text-center text-xs text-white/30 pt-6 border-t border-white/10">
        180 Degrees Consulting UB • Official Competition TV Show Companion (Room: {activeRoom})
      </footer>
    </div>
  );
}
