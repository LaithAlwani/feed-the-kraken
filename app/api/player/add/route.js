import { pusherServer } from "@/lib/pusher";
import connectToDB from "@/utils/database";
import { NextResponse } from "next/server";
import GameRoom from "@/models/gameRoom";

export async function POST(req) {
  const { user, roomId } = await req.json();
  try {
    await connectToDB();

    const gameRoom = await GameRoom.findOne({ roomId });
    const player = gameRoom.players.find((player) => player.id === user.id) || {};
    console.log('working 1')
    if (Object.keys(player).length === 0) {
      player.username = user.fullName;
      player.avatar = user.imageUrl;
      player.id = user.id;
      gameRoom.players.push(player);
      await gameRoom.save();
      await pusherServer.trigger(roomId, "player-joined", player);
      return new NextResponse(JSON.stringify(player), { status: 201 });

    } else {
      return new NextResponse(JSON.stringify(gameRoom), { status: 201 });
    }
  } catch (err) {
    return NextResponse.json({ message: "Error in creating game room " + err }, { status: 500 });
  }
}
