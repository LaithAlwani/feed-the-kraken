"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";

export default function GamesPage() {
  const [gameRooms, setGameRooms] = useState([]);

  const getGameRooms = async () => {
    const res = await fetch("/api/game");
    if (res.ok) {
      const data = await res.json();
      setGameRooms([]);
      data.forEach((gameRoom) => {
        setGameRooms((prev) => [...prev, gameRoom]);
      });
    }
  };


  useEffect(() => {
    getGameRooms();
  }, []);
  return (
    <>
      <Link href="/games/create" className="btn icon">
        <FaPlus />
      </Link>
      <h2>Active Games</h2>
      <ul className="game-room-list">
        {gameRooms.map((room) => (
          <li key={room._id} className="game-room-list-item">
            <h3>{room.name}</h3>{" "}
            <p>
              ({room.players.length}/11){" "}
              <Link href={`/games/${room._id}`} className="btn">
                Join
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
