"use client";
import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

export default function GamePage({ params }) {
  const [input, setInput] = useState();
  const [players, setPlayers] = useState([]);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const { user } = useUser();
  const { gameId } = params;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/message", {
      method: "POST",
      body: JSON.stringify(input),
    });

    setInput("");
  };

  const addPlayer = async () => {
    await fetch("/api/player", {
      method: "POST",
      body: JSON.stringify({ username: user.fullName, gameId }),
    });
  };

  useEffect(() => {
    user && addPlayer();
  }, [user]);

  useEffect(() => {
    pusherClient.subscribe(gameId);

    pusherClient.bind("incoming-message", (input) => {
      setIncomingMessages((prev) => [...prev, input]);
    });

    pusherClient.bind("player-joined", (username) => {
      setPlayers((prev) => [...prev, username]);
      toast.success(`${username} has joined`);
    });

    return () => {
      pusherClient.unsubscribe(gameId);
    };
  }, []);

  return (
    <>
      <h2>Hello {user && user.fullName}</h2>
      <ul>
        {players.map((player, i) => (
          <>
            {console.log(player)}
            <li key={i}>{player}</li>
          </>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn">send</button>
        {incomingMessages.map((message, i) => (
          <p key={i}>{message}</p>
        ))}
      </form>
    </>
  );
}
