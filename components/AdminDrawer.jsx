"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import toast from "react-hot-toast";
import { FaTimes, FaEllipsisV } from "react-icons/fa";
import { api } from "@/convex/_generated/api";

const MENU_ITEM =
  "flex flex-col items-start gap-0.5 rounded-lg border bg-bg-card text-fg text-left cursor-pointer px-4 py-3.5 transition-[border-color,background,transform] duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] hover:bg-bg-card-hover";

export default function AdminDrawer({
  roomId,
  gameStarted,
  playerCount,
  maxPlayers,
  onRequestRestart,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Admin tools"
        title="Admin tools"
        className="bg-transparent border-0 text-fg-dim cursor-pointer p-2 text-lg rounded-md transition-colors duration-150 hover:text-accent hover:bg-accent/8 flex items-center justify-center"
      >
        <FaEllipsisV />
      </button>

      {open && (
        <AdminDrawerBody
          roomId={roomId}
          gameStarted={gameStarted}
          playerCount={playerCount}
          maxPlayers={maxPlayers}
          onRequestRestart={() => {
            setOpen(false);
            onRequestRestart();
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function AdminDrawerBody({
  roomId,
  gameStarted,
  playerCount,
  maxPlayers,
  onRequestRestart,
  onClose,
}) {
  const [showDebugRoles, setShowDebugRoles] = useState(false);
  const debugRoles = useQuery(
    api.games.getAllRolesDebug,
    showDebugRoles ? { roomId } : "skip",
  );
  const addFakePlayer = useMutation(api.players.addFakePlayer);
  const removeFakePlayers = useMutation(api.players.removeFakePlayers);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

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

  const roleStripe = {
    sailor: "border-l-role-sailor",
    pirate: "border-l-role-pirate",
    "cult-leader": "border-l-role-cult",
    cultist: "border-l-role-cultist",
    none: "border-l-fg-faint",
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header">
          <h3>Admin</h3>
          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </header>

        <div className="flex flex-col gap-2 p-4">
          {!gameStarted && (
            <>
              <button
                type="button"
                className={MENU_ITEM + " border-border hover:border-accent"}
                onClick={onAddFake}
                disabled={playerCount >= maxPlayers}
              >
                <span className="text-base">+ Fake player</span>
                <span className="text-sm italic text-fg-dim">
                  {playerCount >= maxPlayers
                    ? "Room is full"
                    : "Add a synthetic player for testing"}
                </span>
              </button>
              <button
                type="button"
                className={MENU_ITEM + " border-border hover:border-accent"}
                onClick={onClearFakes}
              >
                <span className="text-base">Clear fakes</span>
                <span className="text-sm italic text-fg-dim">
                  Remove all fake players
                </span>
              </button>
            </>
          )}

          {gameStarted && (
            <>
              <button
                type="button"
                className={MENU_ITEM + " border-border hover:border-accent"}
                onClick={() => setShowDebugRoles((v) => !v)}
              >
                <span className="text-base">
                  {showDebugRoles ? "Hide all roles" : "Show all roles"}
                </span>
                <span className="text-sm italic text-fg-dim">
                  Debug — reveals every player's role
                </span>
              </button>
              <button
                type="button"
                className={
                  MENU_ITEM +
                  " border-danger/30 hover:border-danger hover:bg-danger/6 [&_>span:first-child]:text-danger"
                }
                onClick={onRequestRestart}
              >
                <span className="text-base">Restart game</span>
                <span className="text-sm italic text-fg-dim">
                  Wipe roles & redeal — players keep seats
                </span>
              </button>
            </>
          )}
        </div>

        {showDebugRoles && debugRoles && (
          <ul className="flex-1 overflow-y-auto px-4 pb-4 m-0 flex flex-col gap-1.5">
            {debugRoles.map((p) => (
              <li
                key={p.userId}
                className={`flex items-center gap-3 rounded-lg border border-border border-l-4 bg-bg-card px-3 py-2 ${roleStripe[p.role ?? "none"]}`}
              >
                <span className="flex-1 text-fg">{p.username}</span>
                <span className="ml-auto text-xs uppercase tracking-[0.094rem] text-fg-dim">
                  {p.role ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}

        <footer className="drawer-footer">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
}
