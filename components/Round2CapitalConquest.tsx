"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Participant } from "../lib/types.ts";
import { validateRound2Answer } from "../lib/gameEngine.ts";
import { playSuccessFanfare } from "../lib/audio.ts";
import { CheckCircle2, XCircle, Clock, Sparkles, Send, X, Award } from "lucide-react";

interface Round2CapitalConquestProps {
  participants: Participant[];
  targetAnswer?: number;
  soundEnabled?: boolean;
  onParticipantPass?: (participantId: string) => void;
  onParticipantFail?: (participantId: string) => void;
  isAdmin?: boolean;
}

export function Round2CapitalConquest({
  participants,
  targetAnswer = 1467,
  soundEnabled = true,
  onParticipantPass,
  onParticipantFail,
  isAdmin = false,
}: Round2CapitalConquestProps) {
  const [inputVal, setInputVal] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(participants[0]?.id || "");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationCountdown, setCelebrationCountdown] = useState(10);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Confetti trigger
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
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  };

  // Handle participant submit
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    const isCorrect = validateRound2Answer(inputVal, targetAnswer);

    if (isCorrect) {
      triggerConfetti();
      playSuccessFanfare(soundEnabled);
      setCelebrationCountdown(10);
      setShowCelebration(true);

      if (onParticipantPass && selectedParticipantId) {
        onParticipantPass(selectedParticipantId);
      }
    } else {
      setSubmissionError("Incorrect value. Re-analyze financial metrics and try again.");
    }
  };

  // 10 second auto-dismiss timer for celebration pop-up
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

  const passedCount = participants.filter((p) => p.round2Status === "passed").length;
  const failedCount = participants.filter((p) => p.round2Status === "failed").length;

  return (
    <div className="w-full space-y-6">
      {/* Round 2 Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30">
                <Sparkles className="w-3.5 h-3.5" />
                Round 2
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70">
                Qualification Round
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              Capital Conquest
            </h1>
            <p className="text-sm text-white/60 mt-1 max-w-xl">
              Calculate the required target valuation capital (in integer). Correct submission immediately unlocks qualification to the subsequent round.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="glass-card px-4 py-2.5 rounded-xl border-emerald-500/30 text-center">
              <div className="text-xs text-white/50 uppercase font-bold">Passed</div>
              <div className="text-2xl font-black text-emerald-400">{passedCount}</div>
            </div>
            <div className="glass-card px-4 py-2.5 rounded-xl border-red-500/30 text-center">
              <div className="text-xs text-white/50 uppercase font-bold">Failed</div>
              <div className="text-2xl font-black text-red-400">{failedCount}</div>
            </div>
            <div className="glass-card px-4 py-2.5 rounded-xl border-white/10 text-center">
              <div className="text-xs text-white/50 uppercase font-bold">Total</div>
              <div className="text-2xl font-black text-white">{participants.length}</div>
            </div>
          </div>
        </div>

        {/* Participant Input Console */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-extrabold tracking-wider text-[#8cc63f] flex items-center gap-2">
                <Send className="w-4 h-4" /> Submit Calculated Capital Valuation
              </label>
              <span className="text-xs text-white/40">Expected format: Integer (e.g. 1467)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Select Active Participant */}
              <div className="md:col-span-4">
                <select
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value)}
                  className="w-full bg-neutral-900/90 border border-white/20 rounded-xl px-3 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#8cc63f]"
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                      {p.name} ({p.round2Status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Integer Input */}
              <div className="md:col-span-5">
                <input
                  type="number"
                  placeholder="Enter integer answer (e.g. 1467)"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full bg-neutral-900/90 border border-white/20 rounded-xl px-4 py-3 text-sm text-white font-bold placeholder-white/30 focus:outline-none focus:border-[#8cc63f] focus:ring-1 focus:ring-[#8cc63f]"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full h-full min-h-[44px] bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(140,198,63,0.3)] hover:shadow-[0_0_25px_rgba(140,198,63,0.5)] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Answer
                </button>
              </div>
            </div>

            {submissionError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 26 Participants TV Stage Grid (faded default, highlighted Passed / Failed) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm uppercase font-extrabold tracking-wider text-white/70">
            Contestants Arena (All 26 Participants)
          </h3>
          <span className="text-xs text-white/40">
            Green: Passed • Red: Failed • Dim: Pending
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {participants.map((p) => {
            const isPassed = p.round2Status === "passed";
            const isFailed = p.round2Status === "failed";
            const isPending = p.round2Status === "pending";

            return (
              <div
                key={p.id}
                className={`glass-card p-3 rounded-2xl flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 ${
                  isPassed
                    ? "border-emerald-500/80 bg-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/50 scale-[1.02] opacity-100"
                    : isFailed
                    ? "border-red-500/40 bg-red-950/20 opacity-70"
                    : "border-white/5 bg-white/[0.015] opacity-35 hover:opacity-75"
                }`}
              >
                {/* Status Badge */}
                <div className="w-full flex justify-end mb-2">
                  {isPassed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                      <CheckCircle2 className="w-3 h-3" /> Passed
                    </span>
                  )}
                  {isFailed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/80 text-white">
                      <XCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] uppercase font-bold text-white/40 px-1.5 py-0.5 rounded bg-white/5">
                      Waiting
                    </span>
                  )}
                </div>

                {/* Avatar with Khal fallback */}
                <div
                  className={`relative w-14 h-14 rounded-full overflow-hidden mb-2 transition-all ${
                    isPassed
                      ? "ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                      : isFailed
                      ? "ring-1 ring-red-500/40 grayscale"
                      : "ring-1 ring-white/10 grayscale"
                  }`}
                >
                  <Image
                    src={p.avatar || "/participants/khal.webp"}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <h4 className="font-bold text-xs text-white line-clamp-1 w-full">
                  {p.name}
                </h4>
                <p className="text-[10px] text-white/50 line-clamp-1 w-full mt-0.5">
                  {p.university}
                </p>

                {/* Admin Quick Action (if admin enabled) */}
                {isAdmin && (
                  <div className="flex items-center gap-1 mt-3 pt-2 border-t border-white/10 w-full justify-center">
                    <button
                      onClick={() => onParticipantPass && onParticipantPass(p.id)}
                      title="Pass"
                      className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-[10px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onParticipantFail && onParticipantFail(p.id)}
                      title="Fail"
                      className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[10px]"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebration Popup Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative glass-panel p-8 sm:p-10 rounded-3xl max-w-lg w-full border-[#8cc63f]/60 bg-gradient-to-b from-[#8cc63f]/20 via-neutral-900 to-black text-center shadow-[0_0_60px_rgba(140,198,63,0.4)] animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowCelebration(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#8cc63f] to-emerald-500 flex items-center justify-center text-black shadow-[0_0_35px_rgba(140,198,63,0.6)] mb-6 animate-bounce">
              <Award className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30 text-xs font-black uppercase tracking-wider mb-2">
              🎉 Capital Conquest Clear
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              You made it to the next round!
            </h2>

            <p className="text-sm text-white/70 mt-3 leading-relaxed">
              Outstanding valuation analysis. Your financial projection is locked in, and your qualification has been confirmed!
            </p>

            {/* Auto-close indicator & Action button */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-white/50 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8cc63f]" />
                <span>Auto-closing in {celebrationCountdown}s</span>
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(140,198,63,0.4)]"
              >
                Continue / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
