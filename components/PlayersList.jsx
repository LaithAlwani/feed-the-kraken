import React from 'react'

export default function PlayersList({players}) {
  return (
    <ul>
        {players &&
          players.length > 0 &&
          players.map((player) => (
            <li key={player.id}>
              <img src={player.avatar} alt="" className="avatar" />
              {player.username}
            </li>
          ))}
      </ul>
  )
}
