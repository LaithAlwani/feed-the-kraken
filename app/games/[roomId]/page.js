"use client";
import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

export default function GamePage({ params }) {
  const [input, setInput] = useState();
  const [players, setPlayers] = useState([]);
  const { isLoaded, user } = useUser();
  const { roomId } = params;

  const addPlayer = async () => {
    const res = await fetch("/api/player", {
      method: "POST",
      body: JSON.stringify({ user, roomId }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(data);
      setPlayers(data.players);
    }
  };

  useEffect(() => {
    user && addPlayer();

    pusherClient.subscribe(roomId);

    pusherClient.bind("player-joined", (player) => {
      if (player) {
        setPlayers((prev) => [...prev, player]);
        if (isLoaded) {
          if (user.id === player.id) {
            toast.success(`joined Room`);
          } else {
            toast.success(`${player.username} has joined`);
          }
        }
      }
    });

    return () => {
      pusherClient.unsubscribe(roomId);
    };
  }, [isLoaded]);

  return (
    <>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {" "}
            <img src={player.avatar} alt="" className="avatar" />
            {player.username}
          </li>
        ))}
      </ul>
    </>
  );
}
