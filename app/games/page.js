"use client";
import GameRoomList from "@/components/GameRoomList";
import { pusherClient } from "@/lib/pusher";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";

export default function GamesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [gameRooms, setGameRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGameRooms = async () => {
    const res = await fetch("/api/game");
    try {
      if (res.ok) {
        const data = await res.json();
        setGameRooms([]);
        data.forEach((gameRoom) => {
          setGameRooms((prev) => [...prev, gameRoom]);
        });
      }
    } catch (err) {
      toast.err(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId) => {
    const res = await fetch("/api/player/add", {
      method: "POST",
      body: JSON.stringify({ user, roomId }),
    });
    if (res.ok) {
      router.push(`/games/${roomId}`);
    }
  };

  const deleteRoom = async (roomId) => {
    const res = await fetch("/api/game/delete", {
      method: "POST",
      body: JSON.stringify({ roomId }),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success(data.message);
    }
  };

  useEffect(() => {
    getGameRooms();

    pusherClient.subscribe("lobby");

    pusherClient.bind("room-created", (gameRoom) => {
      setGameRooms((prev) => [...prev, gameRoom]);
    });
    pusherClient.bind("room-deleted", (gameRoom) => {
      getGameRooms();
    });

    return () => {
      pusherClient.unsubscribe("lobby");
    };
  }, []);
  return (
    <>
      <Link href="/games/create" className="btn icon">
        <FaPlus />
      </Link>
      <h2>Active Games</h2>
      {loading ? (
        <p>loading...</p>
      ) : (
        <>
          {console.log(gameRooms)}
          <GameRoomList
            gameRooms={gameRooms}
            joinRoom={joinRoom}
            deleteRoom={deleteRoom}
            user={user}
          />
        </>
      )}
    </>
  );
}
