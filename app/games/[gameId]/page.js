"use client";
import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";

export default function GamePage({ searchParams }) {
  const [input, setInput] = useState();
  const [players, setPlayers] = useState([]);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const { username } = searchParams;
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/message", {
      method: "POST",
      body: JSON.stringify(input),
    });
        
    setInput("");
  };

  const addPlayer = async() => {
    await fetch("/api/player", {
      method: "POST",
      body: JSON.stringify(username),
    });
    
  }

  useEffect(() => {
    addPlayer();
  },[])

  useEffect(() => {
    pusherClient.subscribe("1");

    pusherClient.bind("incoming-message", (input) => {
      setIncomingMessages((prev) => [...prev, input]);
    });

    pusherClient.bind("player-joined", (username) => {
      setPlayers((prev) => [...prev, username]);
      toast.success(`${username} has joined`)
    });

    return () => {
      pusherClient.unsubscribe("1");
      setPlayers(players.splice(username));
    };
  }, []);

  return (
    <>
      <h2>Hello {username}</h2>
      <ul>
        {players.map((player, i) => (
          <li key={i}>{player}</li>
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
