import { InputRound2Client } from "./InputRound2Client.tsx";

export default async function RoomInputRound2Page({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return <InputRound2Client roomCode={roomCode} />;
}
