import { pusherServer } from "@/lib/pusher";

export async function POST(req) {
  const { user, roomId } = await req.json();

  const player = {
    username: user.fullName,
    avatar: user.imageUrl,
    id: user.id,
  };

  await pusherServer.trigger(roomId, "player-joined", player);

  return Response.json({ status: 200, success: true });
}
