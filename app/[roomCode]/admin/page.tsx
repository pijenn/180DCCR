import { AdminPageClient } from "./AdminPageClient.tsx";

export default async function RoomAdminPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return <AdminPageClient roomCode={roomCode} />;
}
