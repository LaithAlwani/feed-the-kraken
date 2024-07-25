"use client";
import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MdOutlineExitToApp } from "react-icons/md";
import PlayersList from "@/components/PlayersList";
import ChooseEvent from "@/components/ChooseEvent";
import ChooseRole from "@/components/ChooseRole";
import Recruit from "@/components/Recruit";
import GiveGuns from "@/components/GiveGuns";

export default function GamePage({ params }) {
  const router = useRouter();
  const [toggleEventMenu, setToggleEventMenu] = useState(false);
  const [toggleEventModle, setToggleEventModle] = useState(false);
  const [currentEvent, setCurrentEvent] = useState("");
  const [gameRoom, setGameRoom] = useState({});
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const { isLoaded, user } = useUser();
  const { roomId } = params;

  const updateRoom = async () => {
    const res = await fetch(`/api/game/${roomId}`);
    if (res.ok) {
      const data = await res.json();
      setGameRoom(data[0]);
      setCurrentPlayer(data[0]?.players.find((player) => player.id === user?.id));
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

  const startEvent = () => {
    setToggleEventMenu(!toggleEventMenu);
  };

  const chooseEvent = async (eventValue) => {
    setCurrentEvent(eventValue);
    const res = await fetch("/api/game/event", {
      method: "POST",
      body: JSON.stringify({ roomId, eventValue }),
    });
    if (res.ok) {
      const data = await res.json();
    }
  };

  const openEventModle = (eventValue) => {
    setCurrentEvent(eventValue);
    setToggleEventModle(true);
  };

  const choosePlayerToRecruit = async (playerId) => {
    const cultLeader = gameRoom.players.filter((player) => player.id === user.id)[0];
    await fetch("/api/game/event/recruit", {
      method: "POST",
      body: JSON.stringify({ roomId, playerId, cultLeader }),
    });
  };

  const [totalGuns, setTotalGuns] = useState(0);
  const gunTotal = (player, value) => {
    if (totalGuns + value > 3) {
      return toast.error("Only 3 guns can be distributed");
    }

    if (player.guns + value < 0) {
      return toast.error("no negative values");
    }
    setTotalGuns((prev) => prev + value);
    player.guns += value;
    document.getElementById(player.id).innerHTML = player.guns;
  };

  const distributeGuns = async () => {
    if (totalGuns != 3) return toast.error("you must give out 3 guns!");
    const res = await fetch("/api/game/event/guns", {
      method: "POST",
      body: JSON.stringify({ roomId, players: gameRoom.players }),
    });
    if (res.ok) {
      gameRoom.players.forEach((player) => (player.guns = 0));
      setTotalGuns(0);
    }
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

  const chooseRole = async (value) => {
    setCurrentPlayer({ ...currentPlayer, role: value });
    await fetch("/api/player/update", {
      method: "POST",
      body: JSON.stringify({ roomId, currentPlayer, role: value }),
    });
  };

  const startGame = async () => {
    setGameRoom({ ...gameRoom, gameStarted: true });
    await fetch("/api/game/start", {
      method: "POST",
      body: JSON.stringify({ roomId }),
    });
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
      const canVibrate = window.navigator.vibrate;
      if (user?.id === playerId) {
        customToast(cultLeader, "has recriuted you!", 7000);
        if (canVibrate) navigator.vibrate([150, 25, 150, 25, 150]);
      } else {
        if (canVibrate) navigator.vibrate(500);
      }
      setToggleEventModle(false);
      setToggleEventMenu(false);
    });
    pusherClient.bind("guns", (players) => {
      players.forEach((player) => {
        if (user?.id === player.id) {
          customToast(player, `you have been awarded ${player.guns} gun(s)`, 7000);
        } else {
          customToast(player, `has been awarded ${player.guns} gun(s)`, 7000);
        }
      });
      const canVibrate = window.navigator.vibrate;
      if (canVibrate) navigator.vibrate(500);
      setToggleEventModle(false);
      setToggleEventMenu(false);
    });
    pusherClient.bind("game-started", (gameRoom) => {
      updateRoom();
      toast.success(`${gameRoom.name} has started!`, { id: gameRoom._id });
    });

    return () => {
      pusherClient.unsubscribe(roomId);
    };
  }, [user]);

  return (
    <section>
      <h2>{gameRoom.name}</h2>
      {currentPlayer && !currentPlayer?.role && (
        <div className="modle">
          <ChooseRole chooseRole={chooseRole} />
        </div>
      )}

      <MdOutlineExitToApp size={28} className="btn-leave" onClick={leaveRoom} />
      {toggleEventMenu && (
        <div className="modle row">
          <ChooseEvent chooseEvent={chooseEvent} />
        </div>
      )}
      {toggleEventModle && (
        <div className="modle">
          {currentEvent === "recruit" ? (
            <Recruit
              currentPlayer={currentPlayer}
              players={gameRoom.players}
              eventValue={currentEvent}
              choosePlayerToRecruit={choosePlayerToRecruit}
            />
          ) : (
            <GiveGuns
              eventValue={currentEvent}
              currentPlayer={currentPlayer}
              players={gameRoom.players}
              distributeGuns={distributeGuns}
              gunTotal={gunTotal}
              totalGuns={totalGuns}
            />
          )}
        </div>
      )}
      {currentPlayer && user?.id === gameRoom.gameAdmin && !toggleEventModle &&
        (gameRoom.gameStarted ? (
          <button onClick={startEvent} className="btn btn-event">
            Start Event
          </button>
        ) : (
          <button className="btn btn-event" onClick={startGame}>
            Start Game
          </button>
        ))}
      <PlayersList players={gameRoom.players} currentPlayer={currentPlayer} />
    </section>
  );
}
