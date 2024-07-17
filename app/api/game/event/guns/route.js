import { pusherServer } from '@/lib/pusher'

export async function POST(req) {
  const { players, roomId } = await req.json()

  console.log(players)
  
  const awardedPlayers = players.filter(player=> player.guns > 0)

  await pusherServer.trigger(roomId,'guns', awardedPlayers)
  
  return  Response.json(({ status:200, success: true }))
}