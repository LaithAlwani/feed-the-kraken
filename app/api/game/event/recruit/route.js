import { pusherServer } from '@/lib/pusher'

export async function POST(req) {
  const { playerId, roomId, cultLeader } = await req.json()
  const data = {cultLeader,playerId}
  await pusherServer.trigger(roomId,'recruit', data)
  
  return  Response.json(({ status:200, success: true }))
}