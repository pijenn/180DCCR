import { LeaderboardClient } from "./LeaderboardClient.tsx";

export default async function RoomLeaderboardPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return <LeaderboardClient roomCode={roomCode} />;
}
