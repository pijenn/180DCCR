"use client";

import { useState } from "react";
import Image from "next/image";
import { Participant } from "../lib/types.ts";
import { formatPrecisionCountdown, GOLDEN_TICKET_NAMES } from "../lib/gameEngine.ts";
import {
  Ticket,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  Award,
  ChevronRight,
} from "lucide-react";

interface Round4SacredHandoffProps {
  participants: Participant[];
  timeRemainingMs: number;
  timerRunning: boolean;
  soundEnabled?: boolean;
}

export function Round4SacredHandoff({
  participants,
  timeRemainingMs,
  timerRunning,
}: Round4SacredHandoffProps) {
  // Golden ticket participants
  const goldenTicketHolders = participants.filter((p) =>
    p.isGoldenTicket || GOLDEN_TICKET_NAMES.includes(p.name)
  );

  // Active contenders for Round 4 (not eliminated in rounds 1-3)
  const activeContenders = participants.filter(
    (p) => p.eliminatedInRound === undefined || p.eliminatedInRound === null || p.eliminatedInRound >= 4
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 bg-gradient-to-b from-amber-500/[0.06] via-white/[0.02] to-transparent relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Ticket className="w-3.5 h-3.5" />
                Round 4
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70">
                Golden Ticket Entrance • 12 → 9 Contenders
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight uppercase">
              Sacred Handoff
            </h1>
            <p className="text-sm text-white/60 mt-1 max-w-xl">
              3 Peserta Golden Ticket resmi bergabung ke dalam kompetisi bersama para finalis yang lolos dari Rootmaster. 12 Peserta bertarung untuk 9 tiket menuju Pressure Chamber.
            </p>
          </div>

          {/* Stage Digital Timer Countdown */}
          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-[10px] uppercase font-bold text-white/40 mb-1 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Waktu Sesi
              </div>
              <div
                className={`font-mono text-3xl font-black tracking-wider ${
                  timeRemainingMs <= 30000 && timerRunning
                    ? "text-red-500 animate-pulse"
                    : "text-white"
                }`}
              >
                {formatPrecisionCountdown(timeRemainingMs)}
              </div>
            </div>
          </div>
        </div>

        {/* Golden Ticket Ceremony Spotlight */}
        <div className="mt-6 pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎫</span>
              <span className="text-xs uppercase font-black tracking-wider text-amber-300">
                The 3 Golden Ticket Entrants (Direct Qualification):
              </span>
            </div>
            <span className="text-[11px] text-amber-400/80 font-semibold hidden sm:inline">
              Resmi Bergabung di Round 4 Sacred Handoff
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {goldenTicketHolders.map((gt) => (
              <div
                key={gt.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-900/10 to-transparent border-2 border-amber-500/40 flex items-center gap-3.5 relative overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.15)] group hover:border-amber-400 transition-all"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-amber-400/70 flex-shrink-0 shadow-md">
                  <Image
                    src={gt.avatar || "/participants/khal.webp"}
                    alt={gt.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full mb-1">
                    <Sparkles className="w-3 h-3" /> Golden Ticket
                  </div>
                  <div className="font-extrabold text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                    {gt.name}
                  </div>
                  <div className="text-[11px] text-white/50 truncate">{gt.university}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 12 Active Contenders Arena */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm uppercase font-extrabold tracking-wider text-white/70 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8cc63f]" />
            Arena 12 Peserta Sacred Handoff (Menuju 9 Peserta)
          </h3>
          <span className="text-xs text-white/40">
            Aktif: <strong className="text-[#8cc63f]">{activeContenders.length} Peserta</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {activeContenders.map((p, idx) => {
            const isGT = p.isGoldenTicket || GOLDEN_TICKET_NAMES.includes(p.name);

            return (
              <div
                key={p.id}
                className={`glass-card p-3 rounded-2xl flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 group hover:scale-[1.02] ${
                  isGT
                    ? "border-amber-500/50 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40"
                    : "border-white/10 hover:border-[#8cc63f]/40 hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-white/40 font-bold">
                    #{idx + 1}
                  </span>
                  {isGT ? (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Golden Ticket
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      Qualifier
                    </span>
                  )}
                </div>

                <div
                  className={`relative w-14 h-14 rounded-full overflow-hidden mb-2 ring-2 ${
                    isGT ? "ring-amber-400" : "ring-white/15 group-hover:ring-[#8cc63f]"
                  }`}
                >
                  <Image
                    src={p.avatar || "/participants/khal.webp"}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <h4 className="font-bold text-xs text-white line-clamp-1 w-full group-hover:text-[#8cc63f] transition-colors">
                  {p.name}
                </h4>
                <p className="text-[10px] text-white/50 line-clamp-1 w-full mt-0.5">
                  {p.university}
                </p>

                <div className="mt-2 text-xs font-mono font-black text-[#8cc63f]">
                  {p.score.toLocaleString()} PTS
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
