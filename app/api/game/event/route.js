import { pusherServer } from '@/lib/pusher'

export async function POST(req) {
  const  {roomId, eventValue}  = await req.json()

  await pusherServer.trigger(roomId,'incoming-event', eventValue)
  
  return  Response.json(({ status:200, success: true }))
}