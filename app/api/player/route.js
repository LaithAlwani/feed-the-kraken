import { pusherServer } from '@/lib/pusher'

export async function POST(req) {
  const  username  = await req.json()

  await pusherServer.trigger("1",'player-joined', username)
  
  return  Response.json(({ status:200, success: true }))
}