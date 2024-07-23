import { pusherServer } from "@/lib/pusher";
import connectToDB from "@/utils/database";
import { NextResponse } from "next/server";
import GameRoom from "@/models/gameRoom";

export async function POST(req) {
  const { roomId } = await req.json();

  try {
    await connectToDB();
    const gameRoom = await GameRoom.findOne({ _id: roomId });
    gameRoom.gameStarted = "true";
    console.log(gameRoom)
    await gameRoom.save();

    await pusherServer.trigger(roomId, "game-started", gameRoom);

    return NextResponse.json({ message: "Role update!" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Error in creating game room " + err }, { status: 500 });
  }
}
