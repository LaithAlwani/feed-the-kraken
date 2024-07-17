import { pusherServer } from '@/lib/pusher'

export async function POST(req) {
  const { playerId, roomId } = await req.json()

  await pusherServer.trigger(roomId,'recruit', playerId)
  
  return  Response.json(({ status:200, success: true }))
}