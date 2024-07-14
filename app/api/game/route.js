import connectToDB from "@/utils/database";
import GameRoom from "@/models/gameRoom";
import { NextResponse } from "next/server";

export async function POST(req) {
  const  roomName  = await req.json();
  console.log(roomName)
  try {
    await connectToDB();
    const gameRoom = await GameRoom.create({ name: roomName, players: [] });
    console.log(gameRoom._id)
    return NextResponse.json({ message: `${roomName} created`, gameRoom }, { status: 201 });
  } catch (err) {
    console.log(err);
    return  NextResponse.json({message:"Error in creating game room " + err}, { status: 500 });
  }
}
