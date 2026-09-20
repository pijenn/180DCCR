"use client";

import { Navbar } from "../../components/Navbar.tsx";
import { KahootLeaderboard } from "../../components/KahootLeaderboard.tsx";
import { useGameState } from "../../lib/useGameState.ts";
import { Trophy } from "lucide-react";

export default function DedicatedLeaderboardPage() {
  const [gameState, updateState] = useGameState();

  return (
    <div className="min-h-screen bg-[#080a09] bg-grid-pattern text-foreground flex flex-col">
      <Navbar
        currentRound={gameState.currentRound}
        soundEnabled={gameState.soundEnabled}
        onToggleSound={() => updateState({ soundEnabled: !gameState.soundEnabled })}
      />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#8cc63f]/20 text-[#8cc63f] border border-[#8cc63f]/30 mb-2">
            <Trophy className="w-3.5 h-3.5" /> Stage Leaderboard Arena
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Official Standings
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Real-time score aggregate across all 5 competition rounds.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 shadow-2xl">
          <KahootLeaderboard participants={gameState.participants} highlightTop={true} />
        </div>
      </main>

      <footer className="mt-auto border-t border-white/10 bg-[#060807] py-6 px-4 text-center text-xs text-white/40">
        <div>180 Degrees Consulting UB TV Companion • Live Stage Screen</div>
      </footer>
    </div>
  );
}
