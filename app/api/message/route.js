import { pusherServer } from '@/lib/pusher'

export async function POST(req) {
  const  input  = await req.json()

  await pusherServer.trigger("124",'incoming-message', input)
  
  return  Response.json(({ status:200, success: true }))
}