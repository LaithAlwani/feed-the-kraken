"use client";
import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MdOutlineExitToApp, MdDeleteOutline } from "react-icons/md";

export default function GamePage({ params }) {
  const router = useRouter();
  const [toggleEventMenu, setToggleEventMenu] = useState(false);
  const [toggleEventModle, setToggleEventModle] = useState(false);
  const [eventValue, setEvent] = useState("");
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

  const startEvent = () => {
    setToggleEventMenu(!toggleEventMenu);
  };

  const chooseEvent = async () => {
    const res = await fetch("/api/game/event", {
      method: "POST",
      body: JSON.stringify({ roomId, eventValue }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(data);
    }
  };

  const openEventModle = (eventValue) => {
    setEvent(eventValue);
    setToggleEventModle(true);
  };

  const choosePlayerToRecruit = async (playerId) => {
    const res = await fetch("/api/game/event/recruit", {
      method: "POST",
      body: JSON.stringify({ roomId, playerId }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(data);
    }
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
      toast.success("room has been delete", { id: gameRoom._id });
      router.push("/games");
    });

    pusherClient.bind("incoming-event", (value) => {
      openEventModle(value);
    });

    pusherClient.bind("recruit", (playerId) => {
      if (user.id === playerId) {
        toast.success("you have been recruited", { id: playerId });
        navigator.vibrate(500, 200, 500);
      }
      setToggleEventModle(false);
      setToggleEventMenu(false);
      navigator.vibrate(1000);
    });

    return () => {
      pusherClient.unsubscribe(roomId);
    };
  }, []);

  return (
    <section>
      <h2>{gameRoom.name}</h2>
      <MdOutlineExitToApp size={28} className="btn-leave" onClick={leaveRoom} />
      {user && user.id === gameRoom.gameAdmin && (
        <>
          <MdDeleteOutline className="btn-delete" onClick={deleteRoom} size={28} />
          <button onClick={startEvent} className="btn btn-event">
            Start Event
          </button>
          {toggleEventMenu && (
            <>
              <select onChange={(e) => setEvent(e.target.value)}>
                <option value="">Choose Event</option>
                <option value="recruit">Recruit</option>
                <option value="give 3 guns">Give 3 guns</option>
                <option value="check navigation team">Check Navigation Team</option>
              </select>
              <button className="btn btn-event" onClick={chooseEvent}>
                Choose Event
              </button>
            </>
          )}
        </>
      )}
      {toggleEventModle && (
        <div className="modle">
          <h3>{eventValue} has start</h3>
          <ul>
            {players &&
              players.length > 0 &&
              players.map((player) => (
                <li key={player.id} onClick={() => choosePlayerToRecruit(player.id)}>
                  <img src={player.avatar} alt="" className="avatar" />
                  {player.username}
                </li>
              ))}
          </ul>
        </div>
      )}
      <ul>
        {players &&
          players.length > 0 &&
          players.map((player) => (
            <li key={player.id}>
              <img src={player.avatar} alt="" className="avatar" />
              {player.username}
            </li>
          ))}
      </ul>
    </section>
  );
}
