"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";

export default function GamesPage() {
  const { user } = useUser();
  const router = useRouter();
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

  const joinRoom = async (roomId) => {
    const res = await fetch("/api/player/add", {
      method: "POST",
      body: JSON.stringify({ user, roomId }),
    });
    if (res.ok) {
      router.push(`/games/${roomId}`)
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
              <button onClick={()=>joinRoom(room._id)} className="btn">
                Join
              </button>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
