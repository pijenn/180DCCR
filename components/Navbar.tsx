"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Volume2, VolumeX, Shield, Tv, Trophy, Copy, Check, LogOut, Radio } from "lucide-react";

interface NavbarProps {
  currentRound?: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  roomCode?: string;
}

export function Navbar({
  currentRound = 1,
  soundEnabled = true,
  onToggleSound,
  roomCode: explicitRoomCode,
}: NavbarProps) {
  const pathname = usePathname();
  const params = useParams();
  const [copiedLink, setCopiedLink] = useState(false);

  const routeRoom = params?.roomCode
    ? Array.isArray(params.roomCode)
      ? params.roomCode[0]
      : params.roomCode
    : undefined;

  const roomCode = explicitRoomCode || routeRoom;

  const roundNames = [
    "The Gauntlet",
    "Capital Conquest",
    "Rootmaster",
    "Sacred Handoff",
    "Pressure Chamber",
    "Executive Pitch",
  ];

  const stageHref = roomCode ? `/${roomCode}` : "/";
  const leaderboardHref = roomCode ? `/${roomCode}/leaderboard` : "/leaderboard";
  const adminHref = roomCode ? `/${roomCode}/admin` : "/admin";

  const handleCopyRoomLink = () => {
    if (!roomCode) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/${roomCode}` : `/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080a09]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href={stageHref} className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/15 p-1 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/LogoCR.png"
                alt="180 Degrees Consulting UB"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider text-white">180 CR</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30">
                  Companion
                </span>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">180 Degrees Consulting UB</p>
            </div>
          </Link>

          {/* Active Room Badge */}
          {roomCode && (
            <div className="flex items-center gap-1.5 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-white/10">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8cc63f]/15 border border-[#8cc63f]/30 text-[#8cc63f] text-xs font-bold">
                <Radio className="w-3 h-3 animate-pulse text-[#8cc63f]" />
                <span className="text-white/60 font-semibold hidden md:inline">Room:</span>
                <span className="font-mono uppercase tracking-wider">{roomCode}</span>
                <button
                  type="button"
                  onClick={handleCopyRoomLink}
                  title="Copy room link to share with other laptop"
                  className="ml-1 p-0.5 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <Link
                href="/"
                title="Change room code"
                className="hidden lg:flex items-center gap-1 text-[11px] text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit</span>
              </Link>
            </div>
          )}

          {/* Active Round Pill */}
          {(() => {
            const roundColors: Record<number, { border: string; text: string; bg: string }> = {
              1: { border: "border-[#23D700]/30", text: "text-[#23D700]", bg: "bg-[#23D700]/10" },
              2: { border: "border-[#0051C3]/40", text: "text-[#38bdf8]", bg: "bg-[#0051C3]/15" },
              3: { border: "border-[#E2A100]/30", text: "text-[#E2A100]", bg: "bg-[#E2A100]/10" },
              4: { border: "border-[#9E0000]/40", text: "text-[#f87171]", bg: "bg-[#9E0000]/15" },
              5: { border: "border-[#7A00B8]/40", text: "text-[#c084fc]", bg: "bg-[#7A00B8]/15" },
              6: { border: "border-[#D95B00]/40", text: "text-[#fb923c]", bg: "bg-[#D95B00]/15" },
            };
            const activeColor = roundColors[currentRound] || roundColors[1];

            return (
              <div className="hidden xl:flex items-center gap-2 ml-2 pl-4 border-l border-white/10 text-xs">
                <span className="text-white/40 uppercase tracking-wider font-mono text-[11px]">Round:</span>
                <span className={`px-2.5 py-1 rounded-sm ${activeColor.bg} ${activeColor.text} border ${activeColor.border} font-mono font-bold uppercase text-[11px]`}>
                  R0{currentRound} • {roundNames[currentRound - 1] || "Game"}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href={stageHref}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === stageHref || (roomCode && pathname === `/${roomCode}`)
                ? "bg-[#8cc63f] text-black shadow-[0_0_15px_rgba(140,198,63,0.3)]"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Participant & Stage</span>
            <span className="sm:hidden">Stage</span>
          </Link>

          <Link
            href={leaderboardHref}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === leaderboardHref
                ? "bg-[#8cc63f] text-black shadow-[0_0_15px_rgba(140,198,63,0.3)]"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </Link>

          <Link
            href={adminHref}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === adminHref
                ? "bg-[#8cc63f] text-black shadow-[0_0_15px_rgba(140,198,63,0.3)]"
                : "text-white/70 hover:text-white hover:bg-white/5 border border-white/10"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              title={soundEnabled ? "Mute Game Audio" : "Unmute Game Audio"}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#8cc63f]" />
              ) : (
                <VolumeX className="w-4 h-4 text-white/40" />
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
