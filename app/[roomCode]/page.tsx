import { StageArena } from "../../components/StageArena.tsx";

export default async function RoomStagePage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return <StageArena roomCode={roomCode} />;
}
