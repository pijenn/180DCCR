"use client";

import Image from "next/image";
import { Participant } from "../lib/types.ts";
import { calculateLeaderboard, getParticipantPhoto, getParticipantPhotoPosition, isGoldenTicket } from "../lib/gameEngine.ts";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";

interface KahootLeaderboardProps {
  participants: Participant[];
  maxDisplay?: number;
  highlightTop?: boolean;
  currentRound?: number;
}

export function KahootLeaderboard({
  participants,
  maxDisplay,
  highlightTop = true,
  currentRound,
}: KahootLeaderboardProps) {
  // In rounds 1-3, golden ticket holders do not play and are not shown on the leaderboard
  const eligibleParticipants =
    currentRound && currentRound <= 3
      ? participants.filter((p) => !isGoldenTicket(p))
      : participants;

  const ranked = calculateLeaderboard(eligibleParticipants);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end pt-2">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 glass-card p-5 rounded-3xl border-slate-300/40 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-slate-700/20 flex flex-col items-center text-center relative overflow-hidden animate-podium-2 shadow-[0_10px_30px_rgba(203,213,225,0.15)]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-75" />
            <div className="text-slate-200 font-extrabold text-xs px-3 py-1 rounded-full bg-slate-400/20 border border-slate-400/30 mb-3 shadow-inner flex items-center gap-1">
              🥈 2nd Place
            </div>
            <div className="relative mb-3 mt-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-4 ring-slate-300/60 overflow-hidden relative shadow-[0_0_20px_rgba(203,213,225,0.3)]">
                <Image
                  src={displayList[1].avatar || getParticipantPhoto(displayList[1].name)}
                  alt={displayList[1].name}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  style={{ objectPosition: getParticipantPhotoPosition(displayList[1].name) }}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1">
                {getRankBadge(2)}
              </div>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-white line-clamp-1">{displayList[1].name}</h3>
            <p className="text-xs text-white/50 line-clamp-1 mb-3">{displayList[1].university}</p>
            <div className="mt-auto px-4 py-2 rounded-xl bg-white/10 border border-white/15 font-black text-slate-200 text-base shadow-sm">
              {displayList[1].score.toLocaleString()} <span className="text-[10px] text-white/40 uppercase">pts</span>
            </div>
          </div>

          {/* Rank 1 (Gold Champion) */}
          <div className="order-1 md:order-2 glass-card p-6 sm:p-7 rounded-3xl border-2 border-[#8cc63f] bg-gradient-to-t from-[#005a36]/90 via-[#8cc63f]/20 to-amber-500/20 flex flex-col items-center text-center relative overflow-hidden animate-podium-1 shadow-[0_0_50px_rgba(140,198,63,0.35)] z-10 scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-crown select-none pointer-events-none">
              👑
            </div>
            <div className="text-black font-black text-xs px-4 py-1 rounded-full bg-[#8cc63f] shadow-[0_0_15px_rgba(140,198,63,0.6)] mb-3 tracking-wider font-mono animate-pulse">
              🏆 LEADER #1
            </div>
            <div className="relative mb-3 mt-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-[#8cc63f] overflow-hidden relative shadow-[0_0_35px_rgba(140,198,63,0.6)]">
                <Image
                  src={displayList[0].avatar || getParticipantPhoto(displayList[0].name)}
                  alt={displayList[0].name}
                  fill
                  sizes="(max-width: 640px) 80px, 96px"
                  style={{ objectPosition: getParticipantPhotoPosition(displayList[0].name) }}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1">
                {getRankBadge(1)}
              </div>
            </div>
            <h3 className="font-black text-base sm:text-lg text-white line-clamp-1">{displayList[0].name}</h3>
            <p className="text-xs text-[#8cc63f]/90 line-clamp-1 mb-3 font-semibold">{displayList[0].university}</p>
            <div className="mt-auto px-5 py-2.5 rounded-2xl bg-[#8cc63f] text-black font-black text-lg sm:text-xl shadow-[0_0_20px_rgba(140,198,63,0.5)]">
              {displayList[0].score.toLocaleString()} <span className="text-xs text-black/70 uppercase">pts</span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 glass-card p-5 rounded-3xl border-amber-600/40 bg-gradient-to-t from-amber-950/90 via-amber-900/40 to-amber-800/20 flex flex-col items-center text-center relative overflow-hidden animate-podium-3 shadow-[0_10px_30px_rgba(217,119,6,0.15)]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-75" />
            <div className="text-amber-300 font-extrabold text-xs px-3 py-1 rounded-full bg-amber-600/20 border border-amber-500/30 mb-3 shadow-inner flex items-center gap-1">
              🥉 3rd Place
            </div>
            <div className="relative mb-3 mt-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-4 ring-amber-600/60 overflow-hidden relative shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                <Image
                  src={displayList[2].avatar || getParticipantPhoto(displayList[2].name)}
                  alt={displayList[2].name}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  style={{ objectPosition: getParticipantPhotoPosition(displayList[2].name) }}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1">
                {getRankBadge(3)}
              </div>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-white line-clamp-1">{displayList[2].name}</h3>
            <p className="text-xs text-white/50 line-clamp-1 mb-3">{displayList[2].university}</p>
            <div className="mt-auto px-4 py-2 rounded-xl bg-white/10 border border-white/15 font-black text-amber-300 text-base shadow-sm">
              {displayList[2].score.toLocaleString()} <span className="text-[10px] text-white/40 uppercase">pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard List with Staggered Cascading Animation */}
      <div className="space-y-2">
        {displayList.map((participant, idx) => {
          const isTop3 = participant.rank <= 3;
          return (
            <div
              key={participant.id}
              style={{ animationDelay: `${Math.min(2.2, 1.2 + idx * 0.04)}s` }}
              className={`glass-card p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 sm:gap-4 transition-all animate-cascade-row group ${
                participant.rank === 1
                  ? "border-[#8cc63f]/40 bg-[#8cc63f]/[0.08]"
                  : participant.rank === 2
                  ? "border-slate-400/30 bg-white/[0.04]"
                  : participant.rank === 3
                  ? "border-amber-600/30 bg-white/[0.03]"
                  : "border-white/5 hover:border-white/20 hover:bg-white/[0.03]"
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
                    src={participant.avatar || getParticipantPhoto(participant.name)}
                    alt={participant.name}
                    fill
                    sizes="44px"
                    style={{ objectPosition: getParticipantPhotoPosition(participant.name) }}
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
