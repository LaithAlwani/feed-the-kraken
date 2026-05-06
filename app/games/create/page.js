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
    if (!password.trim()) return toast.error("Password is required");
    try {
      const roomId = await createRoom({
        name: roomName.trim(),
        password,
      });
      toast.success("Room created");
      router.push(`/games/${roomId}`);
    } catch (err) {
      toast.error(err.message ?? "Could not create the room");
    }
  };

  return (
    <section className="w-full px-4 py-6 flex flex-col gap-4 items-center animate-fade-up">
      <h2 className="m-0 text-2xl tracking-[0.094rem]">Create a Game Room</h2>
      <form
        onSubmit={submit}
        className="w-full max-w-md flex flex-col gap-3 rounded-xl border border-border bg-bg-card p-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <input
          type="text"
          required
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Room Name"
          className="input-field"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="new-password"
          className="input-field"
        />
        <button className="btn btn-alt w-full">Create</button>
      </form>
    </section>
  );
}
