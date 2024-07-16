"use client";
import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function GamePage({ params }) {
  const router = useRouter();
  const [gameRoom, setGameRoom] = useState({});
  const [players, setPlayers] = useState([]);
  const { isLoaded, user } = useUser();
  const { roomId } = params;

  const updateRoom = async () => {
    setPlayers([]);
    const res = await fetch(`/api/game/${roomId}`);
    if (res.ok) {
      const data = await res.json();
      setGameRoom(data[0]);
      setPlayers(data[0].players);
    }
  };

  const leaveRoom = async () => {
    const res = await fetch("/api/player/remove", {
      method: "POST",
      body: JSON.stringify({ user, roomId }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push("/games");
    }
  };

  const deleteRoom = async () => {
    const res = await fetch("/api/game/delete", {
      method: "POST",
      body: JSON.stringify({ roomId }),
    });
    
  };

  const customToast = (player, status) => {
    toast.custom(
      <div className="custom-toast">
        <img src={player.avatar} alt="" className="avatar" />
        <p>
          {player.username} has {status}
        </p>
      </div>,
      { duration: 2000, id: player.id }
    );
  };

  useEffect(() => {
    user && updateRoom();

    pusherClient.subscribe(roomId);

    pusherClient.bind("player-joined", (player) => {
      updateRoom();
      if (isLoaded) {
        if (user.id === player.id) {
          toast.success(`joined Room`, { id: player.id });
        } else {
          customToast(player, "joined");
        }
      }
    });
    pusherClient.bind("player-left", (player) => {
      updateRoom();
      if (isLoaded) {
        if (user.id === player.id) {
          toast.success(`You left the Room`, { duration: 5000, id: player.id });
        } else {
          customToast(player, "left");
        }
      }
    });

    pusherClient.bind("room-deleted", (gameRoom) => {
      toast.success("room has been delete", {id: gameRoom._id});
      router.push("/games");
    });

    return () => {
      pusherClient.unsubscribe(roomId);
    };
  }, []);

  return (
    <>
      <h2>{gameRoom.name}</h2>
      <button className="btn btn-delete" onClick={leaveRoom}>
        Leave
      </button>
      {user && user.id === gameRoom.gameAdmin && (
        <button className="btn btn-delete" onClick={deleteRoom}>
          Delete Room
        </button>
      )}
      <ul>
        {players &&
          players.length > 0 &&
          players.map((player) => (
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
