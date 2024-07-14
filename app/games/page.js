"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";

export default function GamesPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
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

  const joinGameRoom = async (roomId) => {
    const res = await fetch("/api/game/player", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({user, roomId }),
    })
    if (res.ok) {
      const data = await res.json();
      toast.success(data.message);
      router.push(`/games/${roomId}`);
    }
    //recored player as one of the players in the data room
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
          <li>
            <h3>{room.name}</h3>{" "}
            <p>
              ({room.players.length}/11){" "}
              <button onClick={()=>joinGameRoom(room._id)} className="btn">
                Join
              </button>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
