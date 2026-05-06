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
import CaptainActionsDrawer from "@/components/CaptainActions";
import CultLeaderActions from "@/components/CultLeaderActions";
import AdminDrawer from "@/components/AdminDrawer";
import ConfirmModal from "@/components/ConfirmModal";
import { api } from "@/convex/_generated/api";

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 11;

export default function GamePage({ params }) {
  const { roomId } = use(params);
  const router = useRouter();
  const view = useQuery(api.games.getMyGameView, { roomId });
  const startGame = useMutation(api.games.startGame);
  const restartGame = useMutation(api.games.restartGame);
  const leaveRoom = useMutation(api.players.leaveRoom);

  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const [captainDrawerOpen, setCaptainDrawerOpen] = useState(false);

  // Browser/device back button → confirm modal instead of leaving silently.
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

  // Tab close / refresh once the game is live → native browser warning.
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

  if (view === undefined)
    return <p className="p-8 text-center text-fg-dim">loading...</p>;
  if (view === null)
    return (
      <p className="p-8 text-center text-fg-dim">
        This room no longer exists.
      </p>
    );

  const { room, players, me, fellowPirates } = view;
  const myUserId = players.find((p) => p._id === me?._id)?.userId ?? null;
  const amAdmin = myUserId === room.gameAdmin;
  const amCaptain = !!myUserId && myUserId === room.currentCaptain;
  const amCultLeader = me?.role === "cult-leader";
  const playerCount = players.length;
  const canStart = playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS;

  const startLabel =
    playerCount < MIN_PLAYERS
      ? `Need ${MIN_PLAYERS - playerCount} more player${MIN_PLAYERS - playerCount === 1 ? "" : "s"} (${playerCount}/${MIN_PLAYERS})`
      : playerCount > MAX_PLAYERS
        ? `Too many players (${playerCount}/${MAX_PLAYERS})`
        : `Start Game`;

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

  const confirmRestart = async () => {
    setConfirmingRestart(false);
    try {
      await restartGame({ roomId });
      toast.success("Returned to lobby.");
    } catch (err) {
      toast.error(err.message ?? "Could not restart the game");
    }
  };

  const showRoleReveal = room.gameStarted && me && !me.hasSeenRole;
  const showNavTab = room.gameStarted && me?.hasSeenRole;
  const showCultTab = room.gameStarted && me?.hasSeenRole && amCultLeader;
  const hasAnyTab = showNavTab || showCultTab;
  const meCanSearch = room.gameStarted && me?.hasSeenRole && amCaptain;

  return (
    <section
      className="w-full px-4 py-6 flex flex-col gap-4 items-stretch animate-fade-up"
      style={{
        minHeight: "calc(100svh - 5rem - env(safe-area-inset-top, 0px))",
      }}
    >
      {/* Top bar */}
      <header
        className="flex items-center gap-2 w-full max-w-md mx-auto rounded-lg border border-border bg-bg-card px-3 py-2.5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <button
          type="button"
          onClick={onLeaveClick}
          aria-label="Leave room"
          className="bg-transparent border-0 text-danger cursor-pointer p-2 rounded-md transition-colors duration-150 hover:text-danger-strong hover:bg-danger/8 flex items-center justify-center"
        >
          <MdOutlineExitToApp size={22} style={{ transform: "scaleX(-1)" }} />
        </button>
        <h2 className="flex-1 m-0 text-center text-lg tracking-[0.094rem] truncate">
          {room.name}
        </h2>
        {amAdmin ? (
          <AdminDrawer
            roomId={roomId}
            gameStarted={room.gameStarted}
            playerCount={playerCount}
            maxPlayers={MAX_PLAYERS}
            onRequestRestart={() => setConfirmingRestart(true)}
          />
        ) : (
          <span className="w-9" aria-hidden />
        )}
      </header>

      {/* Status pill */}
      <div className="flex justify-center">
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.094rem]",
            room.gameStarted
              ? "live-dot text-success border-success/40"
              : "text-fg-dim border-border bg-bg-card",
          ].join(" ")}
        >
          {room.gameStarted
            ? "In progress"
            : `Lobby · ${playerCount}/${MAX_PLAYERS}`}
        </span>
      </div>

      {/* Players list */}
      <PlayersList
        players={players}
        myUserId={myUserId}
        myRole={me?.role ?? null}
        fellowPirates={fellowPirates}
        captainId={room.currentCaptain}
        lieutenantId={room.currentLieutenant}
        navigatorId={room.currentNavigator}
        onMeClick={meCanSearch ? () => setCaptainDrawerOpen(true) : undefined}
        meActionHint={meCanSearch ? "tap to search" : undefined}
      />

      {/* Inline action triggers (post-role-reveal; only roles that apply to me) */}
      {hasAnyTab && (
        <div
          className="fixed bottom-8 right-8 flex gap-3"
          aria-label="Game actions"
        >
          {showNavTab && (
            <NavigationTeamPanel
              roomId={roomId}
              players={players}
              captainId={room.currentCaptain}
              lieutenantId={room.currentLieutenant}
              navigatorId={room.currentNavigator}
            />
          )}
          {showCultTab && (
            <CultLeaderActions
              roomId={roomId}
              players={players}
              myUserId={myUserId}
              room={room}
            />
          )}
        </div>
      )}

      {/* Pre-game CTA */}
      {!room.gameStarted && amAdmin && (
        <button
          className="btn btn-alt fixed left-4 right-4 z-20 min-h-13 animate-slide-in-bottom"
          style={{
            bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
          }}
          onClick={onStart}
          disabled={!canStart}
        >
          {startLabel}
        </button>
      )}

      {/* Modals */}
      {showRoleReveal && (
        <RoleReveal
          roomId={roomId}
          role={me.role}
          fellowPirates={fellowPirates}
        />
      )}

      {!showRoleReveal && me?.pendingReveal && (
        <PendingRevealModal roomId={roomId} reveal={me.pendingReveal} />
      )}

      {captainDrawerOpen && (
        <CaptainActionsDrawer
          roomId={roomId}
          players={players}
          myUserId={myUserId}
          onClose={() => setCaptainDrawerOpen(false)}
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
              The room returns to the lobby. Roles, navigation team, gun
              counts, and search marks are wiped. Players keep their seats —
              you can add or remove players before pressing{" "}
              <strong>Start Game</strong> again.
            </p>
          }
          confirmLabel="Return to lobby"
          cancelLabel="Keep playing"
          danger
          onCancel={() => setConfirmingRestart(false)}
          onConfirm={confirmRestart}
        />
      )}
    </section>
  );
}
