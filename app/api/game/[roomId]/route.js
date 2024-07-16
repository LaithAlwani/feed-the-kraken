import { NextResponse } from "next/server";
import connectToDB from "@/utils/database";
import GameRoom from "@/models/gameRoom";

export async function GET(req, context) {
  const {params} = context
  const roomId = params.roomId;
  try {
    await connectToDB();
    const gameRoom = await GameRoom.find({_id:roomId});
    return new NextResponse(JSON.stringify(gameRoom), { status: 200 });
  } catch (err) {
    return new NextResponse("Error in fetching game room " + err, { status: 500 });
  }
  
}