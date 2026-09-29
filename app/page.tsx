"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tv, Shield, Trophy, ArrowRight, Sparkles, History, Zap } from "lucide-react";
import { normalizeRoomCode } from "../lib/supabase.ts";

const COMPETITION_ROUNDS = [
  { id: "01", name: "The Gauntlet", color: "#23d700", desc: "Rapid Fire Consulting Scenarios" },
  { id: "02", name: "Capital Conquest", color: "#0051c3", desc: "Live Valuation Integer Calculus" },
  { id: "03", name: "Rootmaster", color: "#e2a100", desc: "Hypothesis Tree Time Trial" },
  { id: "04", name: "Sacred Handoff", color: "#9e0000", desc: "Golden Ticket Contender Arrival" },
  { id: "05", name: "Pressure Chamber", color: "#7a00b8", desc: "Live Roulette Executive Interrogation" },
  { id: "06", name: "Executive Pitch", color: "#d95b00", desc: "The Final Boardroom Showdown" },
];

export default function RoomEntryPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedLast = localStorage.getItem("180cr_last_room");
      const storedRecent = localStorage.getItem("180cr_recent_rooms");
      let rooms: string[] = [];
      if (storedRecent) {
        rooms = JSON.parse(storedRecent);
      } else if (storedLast) {
        rooms = [storedLast];
      }
      setRecentRooms(rooms.filter(Boolean));
      if (storedLast && !roomCode) {
        setRoomCode(storedLast);
      }
    } catch {}
  }, []);

  const saveRoomToRecent = (code: string) => {
    try {
      const clean = normalizeRoomCode(code);
      localStorage.setItem("180cr_last_room", clean);
      const updated = Array.from(new Set([clean, ...recentRooms])).slice(0, 5);
      localStorage.setItem("180cr_recent_rooms", JSON.stringify(updated));
    } catch {}
  };

  const handleEnterStage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = normalizeRoomCode(roomCode);
    if (!clean || clean === "default") {
      setErrorMsg("Masukkan Room Code (contoh: 1345)");
      return;
    }
    saveRoomToRecent(clean);
    router.push(`/${clean}`);
  };

  const handleEnterAdmin = () => {
    const clean = normalizeRoomCode(roomCode);
    if (!clean || clean === "default") {
      setErrorMsg("Masukkan Room Code terlebih dahulu");
      return;
    }
    saveRoomToRecent(clean);
    router.push(`/${clean}/admin`);
  };

  const handleEnterLeaderboard = () => {
    const clean = normalizeRoomCode(roomCode);
    if (!clean || clean === "default") {
      setErrorMsg("Masukkan Room Code terlebih dahulu");
      return;
    }
    saveRoomToRecent(clean);
    router.push(`/${clean}/leaderboard`);
  };

  const handleGenerateRoom = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(randomCode);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#060807] text-[#f4f5f6] flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative overflow-hidden select-none bg-stage-grid">
      {/* Top Editorial Meta Bar */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#23d700] text-black font-black text-sm flex items-center justify-center font-mono tracking-tighter">
            180
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-widest text-white">180 Case Royale</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">
                Live Broadcast
              </span>
            </div>
            <p className="text-[11px] text-white/40 font-mono">180 Degrees Consulting UB</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-white/50">
          <span className="w-2 h-2 rounded-full bg-[#23d700] animate-pulse" />
          <span className="hidden sm:inline">Sync Node Active</span>
        </div>
      </header>

      {/* Main Asymmetric Hero Layout */}
      <main className="max-w-7xl mx-auto w-full my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Bold Typography & Stage Color Spectrum */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-white/60">
              <Zap className="w-3.5 h-3.5 text-[#23d700]" />
              Multi-Screen Stage Engine
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white">
              The Arena <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#23d700] via-[#e2a100] to-[#d95b00]">
                Broadcast Hub
              </span>
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-lg leading-relaxed pt-2">
              Platform pendamping interaktif untuk peserta, juri, dan laptop layar panggung. Masukkan kode room yang sama pada seluruh perangkat untuk sinkronisasi otomatis.
            </p>
          </div>

          {/* 6 Game Stages Color Identity Matrix */}
          <div className="pt-2">
            <div className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-3">
              Competition Color Matrix // 6 Stages
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COMPETITION_ROUNDS.map((round) => (
                <div
                  key={round.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/10 transition-fast hover:border-white/30 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-white/40 group-hover:text-white/70">
                      R{round.id}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: round.color, boxShadow: `0 0 10px ${round.color}80` }}
                    />
                  </div>
                  <div className="font-extrabold text-xs text-white truncate group-hover:text-white">
                    {round.name}
                  </div>
                  <div className="text-[10px] text-white/40 truncate mt-0.5">{round.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clean, Tactile Room Code Entry Portal */}
        <div className="lg:col-span-5">
          <div className="stage-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                    Enter Stage Room
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">Koneksikan layar ke room siaran</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateRoom}
                  className="text-xs font-mono text-[#23d700] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>acak kode</span>
                </button>
              </div>

              <form onSubmit={handleEnterStage} className="space-y-5">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => {
                        setRoomCode(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="Contoh: 1345"
                      autoFocus
                      className="w-full px-4 py-4 rounded-2xl bg-black/60 border-2 border-white/20 text-white placeholder-white/20 text-3xl font-mono text-center tracking-widest focus:outline-none focus:border-[#23d700] transition-fast uppercase"
                    />
                  </div>
                  {errorMsg && (
                    <p className="text-xs text-red-400 font-mono mt-2 text-center">{errorMsg}</p>
                  )}
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="submit"
                    className="w-full py-4 px-5 rounded-2xl bg-[#23d700] hover:bg-[#20c200] text-black font-black uppercase tracking-wider text-xs sm:text-sm shadow-[0_0_30px_rgba(35,215,0,0.3)] flex items-center justify-center gap-2 transition-fast cursor-pointer active:scale-[0.99]"
                  >
                    <Tv className="w-4 h-4 stroke-[2.5]" />
                    <span>Buka Layar Peserta & Stage</span>
                    <ArrowRight className="w-4 h-4 ml-auto stroke-[2.5]" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleEnterAdmin}
                      className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-fast cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#23d700]" />
                      <span>Admin Control</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleEnterLeaderboard}
                      className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-fast cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#e2a100]" />
                      <span>Leaderboard</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Recent Room History Chips */}
              {recentRooms.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-white/40">
                    <History className="w-3 h-3" />
                    <span>Recent Rooms:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentRooms.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setRoomCode(code);
                          setErrorMsg(null);
                        }}
                        className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-fast cursor-pointer ${
                          roomCode.toLowerCase() === code.toLowerCase()
                            ? "bg-[#23d700]/20 border-[#23d700] text-[#23d700]"
                            : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs font-mono text-white/30 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>180 Degrees Consulting UB</span>
        <span>Case Competition Live Broadcasting Node</span>
      </footer>
    </div>
  );
}
