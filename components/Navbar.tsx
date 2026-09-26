"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX, Shield, Tv, Trophy } from "lucide-react";

interface NavbarProps {
  currentRound?: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export function Navbar({
  currentRound = 1,
  soundEnabled = true,
  onToggleSound,
}: NavbarProps) {
  const pathname = usePathname();

  const roundNames = [
    "The Gauntlet",
    "Capital Conquest",
    "Rootmaster",
    "Sacred Handoff",
    "Pressure Chamber",
    "Executive Pitch",
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080a09]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8cc63f] to-[#005a36] flex items-center justify-center font-bold text-black text-lg shadow-[0_0_20px_rgba(140,198,63,0.3)] transition-transform group-hover:scale-105">
              180
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider text-white">180 CR</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30">
                  TV Companion
                </span>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">180 Degrees Consulting UB</p>
            </div>
          </Link>

          {/* Active Round Pill */}
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-white/10 text-xs">
            <span className="text-white/40 uppercase tracking-wider font-semibold">Active Round:</span>
            <span className="px-2.5 py-1 rounded-full bg-[#8cc63f]/10 text-[#8cc63f] border border-[#8cc63f]/20 font-medium">
              R{currentRound}: {roundNames[currentRound - 1] || "Game"}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === "/"
                ? "bg-[#8cc63f] text-black shadow-[0_0_15px_rgba(140,198,63,0.3)]"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Participant & Stage</span>
            <span className="sm:hidden">Stage</span>
          </Link>

          <Link
            href="/leaderboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === "/leaderboard"
                ? "bg-[#8cc63f] text-black shadow-[0_0_15px_rgba(140,198,63,0.3)]"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === "/admin"
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
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10"
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
