"use client";
import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MdOutlineExitToApp, MdDeleteOutline } from "react-icons/md";
import PlayersList from "@/components/PlayersList";

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
      router.push("/games");
    }
  };

  const deleteRoom = async () => {
    await fetch("/api/game/delete", {
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
    }
  };

  const openEventModle = (eventValue) => {
    setEvent(eventValue);
    setToggleEventModle(true);
  };

  const choosePlayerToRecruit = async (playerId) => {
    const cultLeader = gameRoom.players.filter((player) => player.id === user.id)[0];
    await fetch("/api/game/event/recruit", {
      method: "POST",
      body: JSON.stringify({ roomId, playerId, cultLeader }),
    });
  };
  
  let toatalGuns = 0;
  const gunTotal = (player, value) => {
    
    if (toatalGuns + value > 3) {
      return toast.error("Only 3 guns can be distributed")
    }
    if (player.guns + value > 3) {
      return toast.error("Cannot give more than 3")
    }
    if (player.guns + value < 0) {
      return toast.error("no negative values")
    }
    toatalGuns += value;
    player.guns += value;
    document.getElementById(player.id).innerHTML = player.guns;
  };

  const handleGunDistribution = (e, player) => {
    player.guns = e.target.value;
  };

  const distributeGuns = async () => {
    await fetch("/api/game/event/guns", {
      method: "POST",
      body: JSON.stringify({ roomId, players }),
    });
  };

  const customToast = (player, message, duration) => {
    toast.custom(
      <div className="custom-toast">
        <img src={player.avatar} alt="" className="avatar" />
        <p>
          {player.username} {message}
        </p>
      </div>,
      { duration: duration || 2000, id: player.id }
    );
  };

  useEffect(() => {
    updateRoom();

    pusherClient.subscribe(roomId);

    pusherClient.bind("player-joined", (player) => {
      updateRoom();
      if (isLoaded) {
        if (user.id === player.id) {
          toast.success(`joined Room`, { id: player.id });
        } else {
          customToast(player, "has joined");
        }
      }
    });
    pusherClient.bind("player-left", (player) => {
      updateRoom();
      if (isLoaded) {
        if (user?.id === player.id) {
          customToast(player, "you left the Room");
        } else {
          customToast(player, "has left");
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

    pusherClient.bind("recruit", (data) => {
      const { cultLeader, playerId } = data;
      if (user?.id === playerId) {
        customToast(cultLeader, "has recriuted you!", 1000);
        navigator.vibrate([225, 50, 225]);
      } else {
        navigator.vibrate(500);
      }
      setToggleEventModle(false);
      setToggleEventMenu(false);
    });
    pusherClient.bind("guns", (players) => {
      players.forEach((player) => {
        if (user.id === player.id) {
          customToast(player, `you have been awarded ${player.guns} gun(s)`, 10000);
        } else {
          customToast(player, `has been awarded ${player.guns} gun(s)`, 10000);
        }
      });
      navigator.vibrate(500);
      setToggleEventModle(false);
      setToggleEventMenu(false);
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
            <div className="modle">
              <select onChange={(e) => setEvent(e.target.value)}>
                <option value="">Choose Event</option>
                <option value="recruit">Recruit</option>
                <option value="give 3 guns">Give 3 guns</option>
                <option value="check navigation team">Check Navigation Team</option>
              </select>
              <button className="btn btn-event" onClick={chooseEvent}>
                Choose Event
              </button>
            </div>
          )}
        </>
      )}
      {toggleEventModle && eventValue === "recruit" && (
        <div className="modle">
          <h3>{eventValue} event has start</h3>
          <p>Cult Leader pick a player to join your team</p>
          <ul>
            {players &&
              players.length > 0 &&
              players
                .filter((player) => user.id !== player.id)
                .map((player) => (
                  <li key={player.id} onClick={() => choosePlayerToRecruit(player.id)}>
                    <img src={player.avatar} alt="" className="avatar" />
                    {player.username}
                  </li>
                ))}
          </ul>
        </div>
      )}
      {toggleEventModle && eventValue === "give 3 guns" && (
        <div className="modle">
          <section>
            <h3>{eventValue} event has start</h3>
            <p>Cult Leader 3 guns to any player(s)</p>
            <ul>
              {gameRoom.players.length > 0 &&
                gameRoom.players.map((player) => (
                  <li key={player.id}>
                    <img src={player.avatar} alt="" className="avatar" />
                    {player.username}
                    <span onClick={() => gunTotal(player, -1)}>-</span>
                    <span id={player.id}>{player.guns}</span>
                    <span onClick={() => gunTotal(player, 1)}>+</span>
                  </li>
                ))}
            </ul>
            <button className="btn btn-event" onClick={distributeGuns}>
              Done
            </button>
          </section>
        </div>
      )}
      <PlayersList players={gameRoom.players} />
    </section>
  );
}
