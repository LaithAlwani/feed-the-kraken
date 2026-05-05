"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";
import { api } from "@/convex/_generated/api";

export default function CreateGamePage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const createRoom = useMutation(api.games.createRoom);

  const submit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return toast.error("Room name is required");
    try {
      const roomId = await createRoom({ name: roomName.trim(), password });
      toast.success("Room created");
      router.push(`/games/${roomId}`);
    } catch (err) {
      toast.error(err.message ?? "Could not create the room");
    }
  };

  return (
    <section>
      <h2>Create A Game Room!</h2>
      <form onSubmit={submit}>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Room Name"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (optional)"
        />
        <button className="btn">Create</button>
      </form>
    </section>
  );
}
