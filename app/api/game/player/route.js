import GameRoom from "@/models/gameRoom";
import connectToDB from "@/utils/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { user, roomId } = await req.json();
  
  try {
    await connectToDB();
    const player = {
      name: user.fullName,
      avatar: user.imageUrl,
      id: user.id,
    };

    const gameRoom = await GameRoom.findOneAndUpdate(
      { _id: roomId },
      { $push: { players: player } }
    );
    return NextResponse.json(
      { message: `you joined ${gameRoom.name}` },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ message: "Error in creating game room " + err }, { status: 500 });
  }
  
}
