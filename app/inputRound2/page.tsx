"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InputRound2Client } from "../[roomCode]/inputRound2/InputRound2Client.tsx";

export default function InputRound2Page() {
  const router = useRouter();
  const [room, setRoom] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("180cr_last_room");
      if (stored && stored !== "default") {
        router.replace(`/${stored}/inputRound2`);
      } else {
        router.replace("/");
      }
    } catch {
      setRoom("default");
    }
  }, [router]);

  if (!room) {
    return (
      <div className="min-h-screen bg-[#080a09] flex items-center justify-center text-white/50 text-sm">
        Memuat Portal Input Round 2...
      </div>
    );
  }

  return <InputRound2Client roomCode={room} />;
}
