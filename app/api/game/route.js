import connectToDB from "@/utils/database";
import GameRoom from "@/models/gameRoom";
import { NextResponse } from "next/server";


export async function POST(req) {
  const {roomName, userId} = await req.json();
  
  try {
    await connectToDB();
    const gameRoom = await GameRoom.create({ name: roomName, players: [], gameAdmin:userId });
    return NextResponse.json({ message: `${roomName} has been created`, gameRoom }, { status: 201 });
  } catch (err) {
    return  NextResponse.json({message:"Error in creating game room " + err}, { status: 500 });
  }
}
