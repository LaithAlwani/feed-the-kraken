"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";

export default function Home() {
  const [input, setIput] = useState();
  const [incomingMessages, setIncomingMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/message", { 
      method: "POST",
      body: JSON.stringify(input)
    });
    // const text = res.json();
    // console.log(text);
    setIput("");
  };

  useEffect(() => {
    pusherClient.subscribe("124");

    pusherClient.bind("incoming-message", (input) => {
      setIncomingMessages((prev) => [...prev, input]);
    });

    return () => {
      pusherClient.unsubscribe("124");
    };
  }, []);

  return (
    <main className={styles.main}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="message"
          value={input}
          onChange={(e) => setIput(e.target.value)}
        />
        <button>send</button>
        {incomingMessages.map((message,i) => (
          <p key={i}>{message}</p>
        ))}
      </form>
    </main>
  );
}
