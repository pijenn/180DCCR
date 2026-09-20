"use client";

import { useState } from "react";
import Image from "next/image";
import { GameState } from "../lib/types.ts";
import {
  ROUND_1_SUBROUNDS,
  searchParticipants,
  applyScoreChange,
  updateRound2Status,
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
} from "lucide-react";

interface AdminConsoleProps {
  state: GameState;
  onUpdateState: (patch: Partial<GameState>) => void;
}

export function AdminConsole({ state, onUpdateState }: AdminConsoleProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter participants in real-time without pressing Enter
  const filteredParticipants = searchParticipants(state.participants, searchQuery);

  const currentSubRound = ROUND_1_SUBROUNDS[state.subRoundIndex] || ROUND_1_SUBROUNDS[0];

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
      round1Phase: "idle",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: false,
    });
  };

  // Start Phase 1 (30s preview)
  const handleStartRound1Preview = () => {
    onUpdateState({
      round1Phase: "preview",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: true,
    });
  };

  // Start Phase 2 (30s answering)
  const handleStartRound1Answering = () => {
    onUpdateState({
      round1Phase: "answering",
      round1TimeRemainingMs: 30000,
      round1TimerRunning: true,
    });
  };

  // Pause Round 1 Timer
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
      round1Phase: "idle",
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { num: 1, title: "The Gauntlet", desc: "8 Sub-rounds Q&A" },
              { num: 2, title: "Capital Conquest", desc: "Valuation Integer" },
              { num: 3, title: "Rootmaster", desc: "Precision Timer" },
              { num: 4, title: "Pressure Chamber", desc: "9 Names Spin" },
              { num: 5, title: "Executive Pitch", desc: "5 Finalists Podium" },
            ].map((r) => (
              <button
                key={r.num}
                type="button"
                onClick={() => handleSelectRound(r.num)}
                className={`p-3 sm:p-4 rounded-2xl text-left border transition-all ${
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
                <div className="font-extrabold text-sm sm:text-base mt-1 line-clamp-1">{r.title}</div>
                <div
                  className={`text-[11px] mt-0.5 line-clamp-1 ${
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
        <div className="glass-panel p-6 rounded-3xl border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#8cc63f]" />
                Round 1: The Gauntlet Controllers
              </h2>
              <p className="text-xs text-white/50">
                Switch sub-rounds and trigger the 30s preview and 30s answering timers.
              </p>
            </div>

            {/* Timers Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleStartRound1Preview}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase flex items-center gap-1.5 shadow-md"
              >
                <Clock className="w-3.5 h-3.5" /> Start 30s Preview
              </button>
              <button
                onClick={handleStartRound1Answering}
                className="px-4 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(140,198,63,0.3)]"
              >
                <Play className="w-3.5 h-3.5 fill-black" /> Start 30s Answer
              </button>
              <button
                onClick={handleToggleRound1Timer}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1"
              >
                {state.round1TimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {state.round1TimerRunning ? "Pause" : "Resume"}
              </button>
              <button
                onClick={handleResetRound1Timer}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Sub-round buttons */}
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-white/50 block mb-2">
              Sub-Round Switcher (7 Normal + 1 Crisis):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {ROUND_1_SUBROUNDS.map((sr, idx) => {
                const isSelected = state.subRoundIndex === idx;
                const isCrisis = sr.name.includes("CRISIS");

                return (
                  <button
                    key={sr.id}
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

      {/* Round 4 Admin Controls */}
      {state.currentRound === 4 && (
        <div className="glass-panel p-6 rounded-3xl border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-red-400" />
                Round 4: Pressure Chamber (9 Names Spin Wheel)
              </h2>
              <p className="text-xs text-white/50">
                Control the 9 roulette candidates and timer countdown.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateState({ round4TimerRunning: !state.round4TimerRunning })}
                className="px-4 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase flex items-center gap-1"
              >
                {state.round4TimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                {state.round4TimerRunning ? "Pause Timer" : "Start Timer"}
              </button>
              <button
                onClick={() =>
                  onUpdateState({ round4TimeRemainingMs: 60000, round4TimerRunning: false })
                }
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset (60s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round 5 Admin Controls */}
      {state.currentRound === 5 && (
        <div className="glass-panel p-6 rounded-3xl border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 gold-gradient">
                <Award className="w-5 h-5 text-amber-400" />
                Round 5: Executive Pitch Final Controls
              </h2>
              <p className="text-xs text-white/50">
                Input the score, reset timer and end the game to reveal the champion.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onUpdateState({ round5TimerRunning: !state.round5TimerRunning })}
                className="px-4 py-2 rounded-xl bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs uppercase flex items-center gap-1"
              >
                {state.round5TimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                {state.round5TimerRunning ? "Pause Timer" : "Start Timer"}
              </button>
              <button
                onClick={() =>
                  onUpdateState({ round5TimeRemainingMs: 180000, round5TimerRunning: false })
                }
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Timer
              </button>
              <button
                onClick={() => onUpdateState({ round5GameEnded: true })}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
              >
                <PartyPopper className="w-4 h-4" /> End Game & Reveal Winner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Score Table with BIG Prominent Instant Search Bar */}
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

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-white/50 px-1">
          <span>
            Showing <strong className="text-white">{filteredParticipants.length}</strong> of{" "}
            {state.participants.length} participants
          </span>
          <span>Click + or - to update score instantly</span>
        </div>

        {/* The Scoring Table (Template: Round Name | Name | Total Score) */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white/60">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Round Name</th>
                <th className="py-3 px-4">Participant Name & University</th>
                <th className="py-3 px-4 text-center">Round 2 Status</th>
                <th className="py-3 px-4 text-right">Total Score</th>
                <th className="py-3 px-4 text-center">Manage Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredParticipants.map((p, idx) => (
                <tr
                  key={p.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Index */}
                  <td className="py-3 px-4 text-xs font-mono text-white/40">{idx + 1}</td>

                  {/* Round Name Column (Explicit Requirement: Round Name | Name | Total Score) */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-white/80 border border-white/10">
                      R{state.currentRound}: {currentSubRound.name}
                    </span>
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
                        <div className="font-bold text-white text-sm group-hover:text-[#8cc63f] transition-colors">
                          {p.name}
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
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
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
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
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
                          className="px-1 text-white/30 hover:text-white/70 text-xs"
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
                        className="px-2.5 py-1 rounded-lg bg-[#8cc63f] hover:bg-[#9de047] text-black font-extrabold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                      >
                        <Plus className="w-3 h-3" />+{currentSubRound.points}
                      </button>

                      {/* Add +10 */}
                      <button
                        onClick={() => handleScoreChange(p.id, 10)}
                        title="Add +10 pts"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                      >
                        +10
                      </button>

                      {/* Deduct -10 */}
                      <button
                        onClick={() => handleScoreChange(p.id, -10)}
                        title="Deduct -10 pts"
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold"
                      >
                        -10
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
