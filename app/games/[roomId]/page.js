"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import toast from "react-hot-toast";
import { MdOutlineExitToApp } from "react-icons/md";
import PlayersList from "@/components/PlayersList";
import RoleReveal from "@/components/RoleReveal";
import NavigationTeamPanel from "@/components/NavigationTeamPanel";
import PendingRevealModal from "@/components/PendingRevealModal";
import CaptainActions from "@/components/CaptainActions";
import CultLeaderActions from "@/components/CultLeaderActions";
import ConfirmModal from "@/components/ConfirmModal";
import { api } from "@/convex/_generated/api";

export default function GamePage({ params }) {
  const { roomId } = use(params);
  const router = useRouter();
  const view = useQuery(api.games.getMyGameView, { roomId });
  const startGame = useMutation(api.games.startGame);
  const restartGame = useMutation(api.games.restartGame);
  const leaveRoom = useMutation(api.players.leaveRoom);
  const addFakePlayer = useMutation(api.players.addFakePlayer);
  const removeFakePlayers = useMutation(api.players.removeFakePlayers);

  const [showDebugRoles, setShowDebugRoles] = useState(false);
  const debugRoles = useQuery(
    api.games.getAllRolesDebug,
    showDebugRoles ? { roomId } : "skip",
  );

  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [confirmingRestart, setConfirmingRestart] = useState(false);

  // Intercept the browser/device back button. We push a sentinel history entry
  // on mount; when the user hits back, popstate fires, we re-push the sentinel
  // (so they stay on the page) and surface the confirm modal.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.pushState(null, "");
    const onPop = () => {
      window.history.pushState(null, "");
      setConfirmingLeave(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Native browser warning on tab close / refresh once the game is in flight.
  // (Can't customize the message in modern browsers — they show their own.)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!view?.room?.gameStarted) return;
    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [view?.room?.gameStarted]);

  if (view === undefined) return <p>loading...</p>;
  if (view === null) return <p>This room no longer exists.</p>;

  const { room, players, me, fellowPirates } = view;
  const myUserId = players.find((p) => p._id === me?._id)?.userId ?? null;
  const amAdmin = myUserId === room.gameAdmin;
  const amCaptain = !!myUserId && myUserId === room.currentCaptain;
  const amCultLeader = me?.role === "cult-leader";

  const MIN_PLAYERS = 5;
  const MAX_PLAYERS = 11;
  const playerCount = players.length;
  const canStart = playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS;
  const startLabel =
    playerCount < MIN_PLAYERS
      ? `Need ${MIN_PLAYERS - playerCount} more player${MIN_PLAYERS - playerCount === 1 ? "" : "s"} (${playerCount}/${MIN_PLAYERS})`
      : playerCount > MAX_PLAYERS
        ? `Too many players (${playerCount}/${MAX_PLAYERS})`
        : `Start Game (${playerCount} players)`;

  const onLeaveClick = () => setConfirmingLeave(true);

  const confirmLeave = async () => {
    setConfirmingLeave(false);
    try {
      await leaveRoom({ roomId });
    } catch (err) {
      toast.error(err.message ?? "Could not leave the room");
    }
    router.push("/games");
  };

  const onStart = async () => {
    try {
      await startGame({ roomId });
    } catch (err) {
      toast.error(err.message ?? "Could not start the game");
    }
  };

  const onRestartClick = () => setConfirmingRestart(true);

  const confirmRestart = async () => {
    setConfirmingRestart(false);
    try {
      await restartGame({ roomId });
      toast.success("Game restarted — new roles dealt.");
    } catch (err) {
      toast.error(err.message ?? "Could not restart the game");
    }
  };

  const onAddFake = async () => {
    try {
      await addFakePlayer({ roomId });
    } catch (err) {
      toast.error(err.message ?? "Could not add a fake player");
    }
  };

  const onClearFakes = async () => {
    try {
      await removeFakePlayers({ roomId });
    } catch (err) {
      toast.error(err.message ?? "Could not clear fake players");
    }
  };

  const showRoleReveal = room.gameStarted && me && !me.hasSeenRole;
  const showNavPanel =
    room.gameStarted && me?.hasSeenRole && (amCaptain || amAdmin);

  return (
    <section>
      <h2>{room.name}</h2>
      <MdOutlineExitToApp
        size={28}
        className="btn-leave"
        onClick={onLeaveClick}
      />

      {showRoleReveal && (
        <RoleReveal roomId={roomId} role={me.role} fellowPirates={fellowPirates} />
      )}

      {!showRoleReveal && me?.pendingReveal && (
        <PendingRevealModal roomId={roomId} reveal={me.pendingReveal} />
      )}

      {amAdmin && (
        <div className="test-panel">
          <span className="test-panel-label">Test helpers</span>
          {!room.gameStarted ? (
            <>
              <button
                type="button"
                className="btn"
                onClick={onAddFake}
                disabled={playerCount >= MAX_PLAYERS}
              >
                + Fake player
              </button>
              <button type="button" className="btn" onClick={onClearFakes}>
                Clear fakes
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn"
                onClick={() => setShowDebugRoles((v) => !v)}
              >
                {showDebugRoles ? "Hide all roles" : "Show all roles (debug)"}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onRestartClick}
              >
                Restart Game
              </button>
            </>
          )}
        </div>
      )}

      {showDebugRoles && debugRoles !== undefined && debugRoles !== null && (
        <ul className="debug-roles">
          {debugRoles.map((p) => (
            <li key={p.userId} className={`role-${p.role ?? "none"}`}>
              <span className="player-name">{p.username}</span>
              <span className="player-badges">{p.role ?? "—"}</span>
            </li>
          ))}
        </ul>
      )}

      {!room.gameStarted && amAdmin && (
        <button
          className="btn btn-event"
          onClick={onStart}
          disabled={!canStart}
        >
          {startLabel}
        </button>
      )}

      <PlayersList
        players={players}
        myUserId={myUserId}
        myRole={me?.role ?? null}
        fellowPirates={fellowPirates}
        captainId={room.currentCaptain}
        lieutenantId={room.currentLieutenant}
        navigatorId={room.currentNavigator}
      />

      {showNavPanel && (
        <NavigationTeamPanel
          roomId={roomId}
          players={players}
          captainId={room.currentCaptain}
          lieutenantId={room.currentLieutenant}
          navigatorId={room.currentNavigator}
        />
      )}

      {room.gameStarted && me?.hasSeenRole && amCaptain && (
        <CaptainActions roomId={roomId} players={players} myUserId={myUserId} />
      )}

      {room.gameStarted && me?.hasSeenRole && amCultLeader && (
        <CultLeaderActions
          roomId={roomId}
          players={players}
          myUserId={myUserId}
          room={room}
        />
      )}

      {confirmingLeave && (
        <ConfirmModal
          title="Leave the room?"
          body={
            room.gameStarted ? (
              <p>
                <strong>You can't rejoin</strong> once the game has started.
                Your seat is gone for the rest of this voyage.
              </p>
            ) : (
              <p>The game hasn't started — you can rejoin from the lobby.</p>
            )
          }
          confirmLabel="Leave anyway"
          cancelLabel="Stay"
          danger
          onCancel={() => setConfirmingLeave(false)}
          onConfirm={confirmLeave}
        />
      )}

      {confirmingRestart && (
        <ConfirmModal
          title="Restart the game?"
          body={
            <p>
              Roles, navigation team, gun counts, and search marks will all be
              wiped. Players keep their seats and new roles are dealt
              immediately.
            </p>
          }
          confirmLabel="Restart and redeal"
          cancelLabel="Keep playing"
          danger
          onCancel={() => setConfirmingRestart(false)}
          onConfirm={confirmRestart}
        />
      )}
    </section>
  );
}
