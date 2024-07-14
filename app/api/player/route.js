import { pusherServer } from '@/lib/pusher'

export async function POST(req) {
  const { username, gameId } = await req.json()
  

  await pusherServer.trigger(gameId,'player-joined', username)
  
  return  Response.json(({ status:200, success: true }))
}