"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageClient } from "../[roomCode]/admin/AdminPageClient.tsx";

export default function AdminPage() {
  const router = useRouter();
  const [room, setRoom] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("180cr_last_room");
      if (stored && stored !== "default") {
        router.replace(`/${stored}/admin`);
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
        Memuat Admin Console...
      </div>
    );
  }

  return <AdminPageClient roomCode={room} />;
}
