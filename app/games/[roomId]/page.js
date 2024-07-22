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
    }
  };

  const openEventModle = (eventValue) => {
    setEvent(eventValue);
    setToggleEventModle(true);
  };

  const choosePlayerToRecruit = async (playerId) => {
    const cultLeader = players.filter(player => player.id === user.id)[0];
    const res = await fetch("/api/game/event/recruit", {
      method: "POST",
      body: JSON.stringify({ roomId, playerId, cultLeader }),
    });
    if (res.ok) {
      const data = await res.json();
    }
  };

  const handleGunDistribution = (e, player) => {
    player.guns = e.target.value;
    console.log(player);
  };

  const distributeGuns = async () => {
    const res = await fetch("/api/game/event/guns", {
      method: "POST",
      body: JSON.stringify({ roomId, players }),
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

  const customRecruitToast = (player) => {
    toast.custom(
      <div className="custom-toast">
        <img src={player.avatar} alt="" className="avatar" />
        <p>
          {player.username} has recruited you!
        </p>
      </div>,
      { duration: 5000, id: player.id }
    );
  }
  const customGunsToast = (player) => {
    toast.custom(
      <div className="custom-toast">
        <img src={player.avatar} alt="" className="avatar" />
        <p>
          {player.username} awarded {player.guns} gun(s)
        </p>
      </div>,
      { duration: 5000, id: player.id }
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

    pusherClient.bind("recruit", (data) => {
      const { cultLeader, playerId } = data;
      if (user.id === playerId) {
        customRecruitToast(cultLeader)
        navigator.vibrate([225, 50, 225]);
      } else {
        navigator.vibrate(500);
      }
      setToggleEventModle(false);
      setToggleEventMenu(false);
    });
    pusherClient.bind("guns", (players) => {
      console.log(players);
      players.forEach((player) => {
        if (user.id === player.id) {
          toast.success(`you have been awarded ${player.guns} gun(s)`, {
            duration: 5000,
            id: player.id,
          });
        } else {
          customGunsToast(player)
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
            <div>
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
          <p>Your device will vibrate twice if you are choosen</p>
        </div>
      )}
      {toggleEventModle && eventValue === "give 3 guns" && (
        <div className="modle">
          <section>
            <h3>{eventValue} event has start</h3>
            <p>Cult Leader 3 guns to any player(s)</p>
            <ul>
              {players &&
                players.length > 0 &&
                players.map((player) => (
                  <li key={player.id}>
                    <img src={player.avatar} alt="" className="avatar" />
                    {player.username}
                    <input
                      type="number"
                      defaultValue={0}
                      min={0}
                      max={3}
                      onChange={(e) => handleGunDistribution(e, player)}
                    />
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
