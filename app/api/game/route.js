import connectToDB from "@/utils/database";
import GameRoom from "@/models/gameRoom";
import { NextResponse } from "next/server";
import gameRoom from "@/models/gameRoom";


export async function GET() {
  
  try {
    await connectToDB();
    const gameRooms = await gameRoom.find();
    return new NextResponse(JSON.stringify(gameRooms), { status: 200 });
  } catch (err) {
    return new NextResponse("Error in fetching boardgames " + err, { status: 500 });
  }
  
}

export async function POST(req) {
  const {roomName, user} = await req.json();
  
  try {
    await connectToDB();
    const players = []
    players.push({
      username: user.fullName,
      avatar: user.imageUrl,
      id:user.id
    })
    const gameRoom = await GameRoom.create({ name: roomName, players, gameAdmin:user.id });
    return NextResponse.json({ message: `${roomName} has been created`, gameRoom }, { status: 201 });
  } catch (err) {
    return  NextResponse.json({message:"Error in creating game room " + err}, { status: 500 });
  }
}
