"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {useUser} from "@clerk/nextjs"
import toast from "react-hot-toast";

export default function CreateGamePage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  

  const createGameRoom = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/game", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({roomName, password, user}),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success(data.message);
      router.push(`/games/${data.gameRoom._id}`);
    }
  };

  return (
    <>
      <form onSubmit={createGameRoom}>
        <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room Name"/>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
        <button className="btn">Create</button>
      </form>
    </>
  );
}
