"use client";

import Image from "next/image";
import { Participant } from "../lib/types.ts";
import { calculateLeaderboard } from "../lib/gameEngine.ts";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";

interface KahootLeaderboardProps {
  participants: Participant[];
  maxDisplay?: number;
  highlightTop?: boolean;
}

export function KahootLeaderboard({
  participants,
  maxDisplay,
  highlightTop = true,
}: KahootLeaderboardProps) {
  const ranked = calculateLeaderboard(participants);
  const displayList = maxDisplay ? ranked.slice(0, maxDisplay) : ranked;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(251,191,36,0.5)]">
          <Trophy className="w-5 h-5 fill-black" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(203,213,225,0.4)]">
          <Medal className="w-5 h-5 fill-black" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(217,119,6,0.4)]">
          <Award className="w-5 h-5 fill-black" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70 font-bold text-sm">
        #{rank}
      </div>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Leaderboard Header */}
      <div className="flex items-center justify-between px-2 pb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#8cc63f]/10 text-[#8cc63f] border border-[#8cc63f]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-extrabold text-lg text-white tracking-tight uppercase">
            Leaderboard Standings
          </h2>
        </div>
        <div className="text-xs text-white/40">
          Total Participants: <span className="text-[#8cc63f] font-semibold">{participants.length}</span>
        </div>
      </div>

      {/* Top 3 Podium Cards (Kahoot Style Highlights) */}
      {highlightTop && displayList.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Rank 2 */}
          <div className="order-2 md:order-1 glass-card p-4 rounded-2xl border-slate-400/30 bg-gradient-to-b from-white/[0.04] to-transparent flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-2 right-2 text-slate-300 font-bold text-xs px-2 py-0.5 rounded-full bg-slate-400/20 border border-slate-400/30">
              2nd Place
            </div>
            <div className="relative mb-3 mt-1">
              <div className="w-16 h-16 rounded-full ring-2 ring-slate-400/50 overflow-hidden relative shadow-lg">
                <Image
                  src={displayList[1].avatar || "/participants/khal.webp"}
                  alt={displayList[1].name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1">
                {getRankBadge(2)}
              </div>
            </div>
            <h3 className="font-bold text-sm text-white line-clamp-1">{displayList[1].name}</h3>
            <p className="text-xs text-white/50 line-clamp-1 mb-2">{displayList[1].university}</p>
            <div className="mt-auto px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 font-extrabold text-[#8cc63f] text-base">
              {displayList[1].score.toLocaleString()} <span className="text-[10px] text-white/40 uppercase">pts</span>
            </div>
          </div>

          {/* Rank 1 (Gold Champion) */}
          <div className="order-1 md:order-2 glass-card p-5 rounded-2xl border-[#8cc63f]/40 bg-gradient-to-b from-[#8cc63f]/10 via-white/[0.05] to-transparent flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_30px_rgba(140,198,63,0.15)]">
            <div className="absolute top-2 right-2 text-yellow-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 animate-pulse">
              👑 Leader
            </div>
            <div className="relative mb-3 mt-1">
              <div className="w-20 h-20 rounded-full ring-4 ring-[#8cc63f] overflow-hidden relative shadow-[0_0_20px_rgba(140,198,63,0.4)]">
                <Image
                  src={displayList[0].avatar || "/participants/khal.webp"}
                  alt={displayList[0].name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1">
                {getRankBadge(1)}
              </div>
            </div>
            <h3 className="font-extrabold text-base text-white line-clamp-1">{displayList[0].name}</h3>
            <p className="text-xs text-[#8cc63f]/80 line-clamp-1 mb-2 font-medium">{displayList[0].university}</p>
            <div className="mt-auto px-5 py-2 rounded-xl bg-[#8cc63f]/20 border border-[#8cc63f]/40 font-black text-white text-lg shadow-[0_0_15px_rgba(140,198,63,0.3)]">
              {displayList[0].score.toLocaleString()} <span className="text-xs text-[#8cc63f] uppercase">pts</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="order-3 glass-card p-4 rounded-2xl border-amber-600/30 bg-gradient-to-b from-white/[0.04] to-transparent flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-2 right-2 text-amber-400 font-bold text-xs px-2 py-0.5 rounded-full bg-amber-600/20 border border-amber-600/30">
              3rd Place
            </div>
            <div className="relative mb-3 mt-1">
              <div className="w-16 h-16 rounded-full ring-2 ring-amber-600/50 overflow-hidden relative shadow-lg">
                <Image
                  src={displayList[2].avatar || "/participants/khal.webp"}
                  alt={displayList[2].name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1">
                {getRankBadge(3)}
              </div>
            </div>
            <h3 className="font-bold text-sm text-white line-clamp-1">{displayList[2].name}</h3>
            <p className="text-xs text-white/50 line-clamp-1 mb-2">{displayList[2].university}</p>
            <div className="mt-auto px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 font-extrabold text-[#8cc63f] text-base">
              {displayList[2].score.toLocaleString()} <span className="text-[10px] text-white/40 uppercase">pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="space-y-2">
        {displayList.map((participant) => {
          const isTop3 = participant.rank <= 3;
          return (
            <div
              key={participant.id}
              className={`glass-card p-3 sm:p-4 rounded-xl flex items-center justify-between gap-3 sm:gap-4 transition-all ${
                participant.rank === 1
                  ? "border-[#8cc63f]/40 bg-[#8cc63f]/[0.06]"
                  : participant.rank === 2
                  ? "border-slate-400/30 bg-white/[0.04]"
                  : participant.rank === 3
                  ? "border-amber-600/30 bg-white/[0.03]"
                  : "border-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankBadge(participant.rank)}
                </div>

                {/* Avatar */}
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-neutral-900">
                  <Image
                    src={participant.avatar || "/participants/khal.webp"}
                    alt={participant.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <h4 className={`text-sm sm:text-base font-bold truncate ${isTop3 ? "text-white" : "text-white/90"}`}>
                    {participant.name}
                  </h4>
                  <p className="text-xs text-white/50 truncate">
                    {participant.university}
                  </p>
                </div>
              </div>

              {/* Score Badge */}
              <div className="flex-shrink-0 text-right">
                <div className="font-extrabold text-base sm:text-lg text-[#8cc63f] tracking-tight">
                  {participant.score.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">
                  Points
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
