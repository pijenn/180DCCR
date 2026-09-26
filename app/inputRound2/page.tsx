"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useGameState } from "../../lib/useGameState.ts";
import { validateRound2Answer, searchParticipants } from "../../lib/gameEngine.ts";
import { playSuccessFanfare } from "../../lib/audio.ts";
import { Participant } from "../../lib/types.ts";
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
  ShieldAlert,
} from "lucide-react";

export default function InputRound2Page() {
  const [gameState, updateState] = useGameState();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationCountdown, setCelebrationCountdown] = useState(10);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Sync selected participant data if state updates in real-time
  useEffect(() => {
    if (selectedParticipant) {
      const refreshed = gameState.participants.find((p) => p.id === selectedParticipant.id);
      if (refreshed) {
        setSelectedParticipant(refreshed);
      }
    }
  }, [gameState.participants, selectedParticipant]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter recommendations in real time without pressing Enter
  const recommendations = searchParticipants(gameState.participants, searchQuery);

  const handleSelectParticipant = (p: Participant) => {
    setSelectedParticipant(p);
    setIsDropdownOpen(false);
    setSearchQuery("");
    setSubmissionError(null);
  };

  const handleResetSelection = () => {
    setSelectedParticipant(null);
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
    } catch {
      // Safe fail
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) return;
    setSubmissionError(null);

    const isCorrect = validateRound2Answer(answerInput, gameState.round2TargetAnswer);

    if (isCorrect) {
      triggerConfetti();
      playSuccessFanfare(gameState.soundEnabled);
      setCelebrationCountdown(10);
      setShowCelebration(true);

      // Update participant status in global game state
      const updatedParticipants = gameState.participants.map((p) =>
        p.id === selectedParticipant.id ? { ...p, round2Status: "passed" as const } : p
      );
      updateState({ participants: updatedParticipants });
    } else {
      setSubmissionError("Jawaban salah! Nilai valuasi tidak sesuai. Silakan hitung kembali dan coba lagi.");
    }
  };

  // Celebration auto-close timer
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
    <div className="min-h-screen bg-[#080a09] bg-grid-pattern text-foreground flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none">
      {/* Top Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8cc63f] to-[#005a36] flex items-center justify-center font-bold text-black text-lg shadow-[0_0_20px_rgba(140,198,63,0.3)]">
            180
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white">180 CR</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30">
                Portal Peserta
              </span>
            </div>
            <p className="text-xs text-white/50">Round 2 • Capital Conquest Answer Submission</p>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Tv className="w-3.5 h-3.5 text-[#8cc63f]" />
          <span>Lihat Layar Panggung</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full my-auto py-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent shadow-2xl space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Capital Conquest Submission
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Input Jawaban Valuasi
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto">
              Pilih nama Anda terlebih dahulu dari daftar rekomendasi, kemudian masukkan angka integer valuasi hasil perhitungan kelompok/individu Anda.
            </p>
          </div>

          {/* STEP 1: Participant Search with Real-time Recommendations (No enter needed!) */}
          <div className="space-y-3" ref={dropdownRef}>
            <label className="text-xs font-extrabold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#8cc63f] text-black flex items-center justify-center font-black text-[11px]">
                1
              </span>
              Pilih Identitas Peserta:
            </label>

            {!selectedParticipant ? (
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                    <Search className="w-5 h-5 text-[#8cc63f]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ketik nama Anda (contoh: Rifqi, Ali, Cyka, Diva)..."
                    value={searchQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-neutral-900/90 border-2 border-white/20 text-white font-bold text-sm sm:text-base placeholder-white/30 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/30 transition-all shadow-inner"
                  />
                </div>

                {/* Instant Recommendation List (visible while typing or focused) */}
                {isDropdownOpen && (
                  <div className="absolute z-30 mt-2 inset-x-0 bg-neutral-950/95 border-2 border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2 text-[11px] font-bold text-white/40 uppercase tracking-wider bg-white/[0.02]">
                      Rekomendasi Nama Peserta ({recommendations.length} ditemukan):
                    </div>

                    {recommendations.length > 0 ? (
                      recommendations.map((p) => {
                        const isPassed = p.round2Status === "passed";
                        const isFailed = p.round2Status === "failed";

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectParticipant(p)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#8cc63f]/10 text-left transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                <Image
                                  src={p.avatar || "/participants/khal.webp"}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="truncate">
                                <div className="font-bold text-sm text-white group-hover:text-[#8cc63f] transition-colors truncate">
                                  {p.name}
                                </div>
                                <div className="text-[11px] text-white/40 truncate">
                                  {p.university}
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0 pl-2">
                              {isPassed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Lolos
                                </span>
                              ) : isFailed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                  <XCircle className="w-3 h-3" /> Gagal
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-white/40 group-hover:text-white/70">
                                  Pilih →
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-white/40">
                        Nama tidak ditemukan. Coba ketik nama panggilan atau universitas Anda.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Selected Participant Profile Card */
              <div className="p-4 rounded-2xl bg-white/[0.04] border-2 border-[#8cc63f]/60 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(140,198,63,0.15)] animate-in fade-in duration-200">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#8cc63f] flex-shrink-0">
                    <Image
                      src={selectedParticipant.avatar || "/participants/khal.webp"}
                      alt={selectedParticipant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] uppercase font-bold text-[#8cc63f] flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Peserta Terpilih
                    </div>
                    <div className="font-extrabold text-base text-white truncate">
                      {selectedParticipant.name}
                    </div>
                    <div className="text-xs text-white/50 truncate">
                      {selectedParticipant.university}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSelection}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-bold transition-colors flex-shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Ganti Nama</span>
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: Answer Input (Unlocked ONLY after participant is selected) */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="text-xs font-extrabold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[11px] ${
                selectedParticipant ? "bg-[#8cc63f] text-black" : "bg-white/10 text-white/40"
              }`}>
                2
              </span>
              Input Jawaban Valuasi:
            </label>

            {!selectedParticipant ? (
              <div className="p-5 rounded-2xl bg-white/[0.015] border border-white/5 text-center text-xs text-white/40 italic">
                Silakan pilih nama Anda pada langkah 1 di atas untuk mengaktifkan input jawaban.
              </div>
            ) : isAlreadyPassed ? (
              /* Already Passed Notice */
              <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-black text-white text-lg">
                  Anda Sudah Dinyatakan Lolos!
                </h3>
                <p className="text-xs text-emerald-300 max-w-sm mx-auto">
                  Selamat, jawaban valuasi Anda telah terverifikasi dan status Anda sudah aktif sebagai <strong>PASSED</strong> pada layar stage.
                </p>
              </div>
            ) : (
              /* Submission Form */
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Nilai Valuasi (Format Integer):</span>
                    <span className="text-[#8cc63f] font-mono text-[11px]">Hanya angka bulat</span>
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 1467"
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-neutral-900/90 border-2 border-white/20 text-white font-mono font-black text-xl sm:text-2xl placeholder-white/20 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/40 tracking-wider shadow-inner"
                  />
                </div>

                {submissionError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submissionError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(140,198,63,0.3)] hover:shadow-[0_0_35px_rgba(140,198,63,0.5)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Jawaban Valuasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full text-center text-xs text-white/40 pt-4 border-t border-white/10">
        <div>180 Degrees Consulting UB TV Companion • Real-time Participant Submission Portal</div>
      </footer>

      {/* Celebration Modal Pop-up */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative glass-panel p-8 sm:p-10 rounded-3xl max-w-lg w-full border-2 border-[#8cc63f] bg-gradient-to-b from-[#8cc63f]/25 via-neutral-900 to-black text-center shadow-[0_0_70px_rgba(140,198,63,0.4)] animate-in zoom-in-95 duration-300">
            {/* Trophy Icon */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#8cc63f] to-emerald-500 flex items-center justify-center text-black shadow-[0_0_40px_rgba(140,198,63,0.6)] mb-6 animate-bounce">
              <Award className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30 text-xs font-black uppercase tracking-wider mb-2">
              🎉 Capital Conquest Clear
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              You made it to the next round!
            </h2>

            <p className="text-sm text-white/80 mt-3 leading-relaxed">
              Selamat, <strong className="text-white">{selectedParticipant?.name}</strong>! Perhitungan valuasi Anda tepat. Status Anda telah berubah menjadi <strong>PASSED</strong> pada layar utama kompetisi.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-white/50 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8cc63f]" />
                <span>Menutup otomatis dalam {celebrationCountdown}s</span>
              </div>

              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(140,198,63,0.4)] cursor-pointer"
              >
                Tutup & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
