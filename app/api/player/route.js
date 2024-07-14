import { pusherServer } from "@/lib/pusher";
import connectToDB from "@/utils/database";
import { NextResponse } from "next/server";
import GameRoom from "@/models/gameRoom";


export async function POST(req) {
  const { user, roomId } = await req.json();

  try {
    await connectToDB();
    const player = {
      username: user.fullName,
      avatar: user.imageUrl,
      id: user.id,
    };
    //if player exsits in the player room don't add them to the database
    const gameRoom = await GameRoom.findOneAndUpdate(
      { _id: roomId },
      { $push: { players: player } }
    );
    await pusherServer.trigger(roomId, "player-joined", player);

    return new NextResponse(JSON.stringify(gameRoom), { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Error in creating game room " + err }, { status: 500 });
  }

}
