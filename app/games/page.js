import Link from 'next/link'
import React from 'react'

export default function GamesPage() {
  return (
    <div>
      <Link href="/games/create" className='btn'>Create</Link>
      <h2>Active Games</h2>
      <ul>
        <li></li>
      </ul>
    </div>
  )
}
