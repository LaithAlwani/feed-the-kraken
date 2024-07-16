import { NextResponse } from "next/server";
import connectToDB from "@/utils/database";
import GameRoom from "@/models/gameRoom";
import { pusherServer } from "@/lib/pusher";

export async function POST(req) {
  const { roomId } = await req.json();

  try {
    await connectToDB();

    const gameRoom = await GameRoom.findOneAndDelete({ _id: roomId });
    
    await pusherServer.trigger(roomId, "room-deleted", gameRoom);
    await pusherServer.trigger("lobby", "room-deleted", gameRoom);

    return NextResponse.json(
      { message: ` Game room deleted` },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ message: "Error in deleteing game room " + err }, { status: 500 });
  }
}
