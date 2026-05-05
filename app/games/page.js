"use client";
import GameRoomList from "@/components/GameRoomList";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { api } from "@/convex/_generated/api";

export default function GamesPage() {
  const { user } = useUser();
  const router = useRouter();
  const gameRooms = useQuery(api.games.listRooms);
  const joinRoomMutation = useMutation(api.players.joinRoom);
  const deleteRoomMutation = useMutation(api.games.deleteRoom);

  const joinRoom = async (roomId) => {
    try {
      await joinRoomMutation({ roomId });
      router.push(`/games/${roomId}`);
    } catch (err) {
      toast.error(err.message ?? "Could not join the room");
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await deleteRoomMutation({ roomId });
    } catch (err) {
      toast.error(err.message ?? "Could not delete the room");
    }
  };

  return (
    <section>
      <Link href="/games/create" className="btn icon">
        <FaPlus />
      </Link>
      <h2>Active Games</h2>
      {gameRooms === undefined ? (
        <p>loading...</p>
      ) : (
        <GameRoomList
          gameRooms={gameRooms}
          joinRoom={joinRoom}
          deleteRoom={deleteRoom}
          user={user}
        />
      )}
    </section>
  );
}
