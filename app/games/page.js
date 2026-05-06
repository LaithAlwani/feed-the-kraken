"use client";
import { useState } from "react";
import GameRoomList from "@/components/GameRoomList";
import ConfirmModal from "@/components/ConfirmModal";
import JoinRoomModal from "@/components/JoinRoomModal";
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

  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingJoin, setPendingJoin] = useState(null);

  const requestJoin = (roomId) => {
    const room = gameRooms?.find((r) => r._id === roomId);
    if (!room) return;
    if (room.iAmMember) {
      router.push(`/games/${roomId}`);
      return;
    }
    setPendingJoin(room);
  };

  const submitJoin = async (password) => {
    if (!pendingJoin) return;
    try {
      await joinRoomMutation({ roomId: pendingJoin._id, password });
      router.push(`/games/${pendingJoin._id}`);
      setPendingJoin(null);
    } catch (err) {
      toast.error(err.message ?? "Could not join the room");
    }
  };

  const requestDelete = (roomId) => {
    const room = gameRooms?.find((r) => r._id === roomId);
    if (room) setPendingDelete(room);
  };

  const confirmDelete = async () => {
    const room = pendingDelete;
    setPendingDelete(null);
    if (!room) return;
    try {
      await deleteRoomMutation({ roomId: room._id });
      toast.success(`Deleted "${room.name}"`);
    } catch (err) {
      toast.error(err.message ?? "Could not delete the room");
    }
  };

  return (
    <section className="w-full px-4 py-6 flex flex-col gap-4 items-stretch animate-fade-up">
      <div className="flex items-center justify-between max-w-2xl w-full mx-auto">
        <h2 className="m-0 text-2xl tracking-[0.094rem]">Active Games</h2>
        <Link
          href="/games/create"
          aria-label="Create game"
          className="btn btn-alt w-12 h-12 rounded-full p-0"
        >
          <FaPlus />
        </Link>
      </div>

      {gameRooms === undefined ? (
        <p className="text-center text-fg-dim">loading...</p>
      ) : (
        <GameRoomList
          gameRooms={gameRooms}
          joinRoom={requestJoin}
          deleteRoom={requestDelete}
          user={user}
        />
      )}

      {pendingJoin && (
        <JoinRoomModal
          roomName={pendingJoin.name}
          onCancel={() => setPendingJoin(null)}
          onConfirm={submitJoin}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete this room?"
          body={
            <p>
              <strong>“{pendingDelete.name}”</strong> will be removed for
              everyone and any players in it will be kicked.
            </p>
          }
          confirmLabel="Delete"
          cancelLabel="Keep"
          danger
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}
