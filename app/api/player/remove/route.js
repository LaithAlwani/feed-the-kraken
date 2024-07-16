import { pusherServer } from "@/lib/pusher";
import connectToDB from "@/utils/database";
import { NextResponse } from "next/server";
import GameRoom from "@/models/gameRoom";

export async function POST(req) {
  const { user, roomId } = await req.json();

  try {
    await connectToDB();

    const gameRoom = await GameRoom.findOne({ _id: roomId });
    const player = gameRoom.players.find((player) => player.id === user.id) || {};

    if (Object.keys(player).length != 0) {
      const index = gameRoom.players.indexOf(player);

      await gameRoom.players.splice(index, 1);
      await gameRoom.save();
      await pusherServer.trigger(roomId, "player-left", player);
      return new NextResponse(JSON.stringify(gameRoom), { status: 201 });
    } else {
      return NextResponse.json({ message: "no player found" }, { status: 201 });
    }
  } catch (err) {
    return NextResponse.json({ message: "Error while leaving room " + err }, { status: 500 });
  }
}
