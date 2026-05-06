"use client";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import { GiOctopus } from "react-icons/gi";
import { api } from "@/convex/_generated/api";

const MENU_ITEM_BASE =
  "flex flex-col items-start gap-0.5 rounded-lg border bg-bg-card text-fg text-left cursor-pointer px-4 py-3.5 transition-[border-color,background,transform] duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] hover:border-accent hover:bg-bg-card-hover";

export default function CultLeaderActions({ roomId, players, myUserId, room }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <GiOctopus
        size={32}
        className="text-2xl text-accent"
        onClick={() => setOpen(true)}
      />

      {open && (
        <CultLeaderDrawer
          roomId={roomId}
          players={players}
          myUserId={myUserId}
          room={room}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function CultLeaderDrawer({ roomId, players, myUserId, room, onClose }) {
  const [view, setView] = useState("menu");
  const convertToCult = useMutation(api.rituals.convertToCult);
  const cultCabinSearch = useMutation(api.rituals.cultCabinSearch);

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

  const navTeamReady =
    !!room.currentCaptain &&
    !!room.currentLieutenant &&
    !!room.currentNavigator;

  const convertibles = players.filter(
    (p) => p.userId !== myUserId && !p.hasBeenExamined,
  );

  const onConvert = async (targetUserId) => {
    try {
      await convertToCult({ roomId, targetUserId });
      toast.success("Conversion complete.");
      onClose();
    } catch (err) {
      toast.error(err.message ?? "Could not convert");
    }
  };

  const onCultCabin = async () => {
    try {
      await cultCabinSearch({ roomId });
      onClose();
    } catch (err) {
      toast.error(err.message ?? "Cult Cabin Search failed");
    }
  };

  const titles = {
    menu: "Cult Leader rituals",
    convert: "Conversion to Cult",
    guns: "Cult Guns Stash",
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
          <h3>{titles[view]}</h3>
          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </header>

        {view === "menu" && (
          <div className="flex flex-col gap-2 p-4">
            <button
              type="button"
              className={MENU_ITEM_BASE + " border-border"}
              onClick={() => setView("convert")}
              disabled={convertibles.length === 0}
            >
              <span className="text-base text-fg">Conversion to Cult</span>
              <span className="text-sm italic text-fg-dim">
                {convertibles.length === 0
                  ? "No eligible targets"
                  : "Privately turn a player into a Cultist"}
              </span>
            </button>
            <button
              type="button"
              className={MENU_ITEM_BASE + " border-border"}
              onClick={onCultCabin}
              disabled={!navTeamReady}
            >
              <span className="text-base text-fg">Cult Cabin Search</span>
              <span className="text-sm italic text-fg-dim">
                {navTeamReady
                  ? "See the navigation team's roles"
                  : "Set the navigation team first"}
              </span>
            </button>
            <button
              type="button"
              className={MENU_ITEM_BASE + " border-border"}
              onClick={() => setView("guns")}
            >
              <span className="text-base text-fg">Distribute 3 guns</span>
              <span className="text-sm italic text-fg-dim">
                Privately hand guns to up to 3 players
              </span>
            </button>
          </div>
        )}

        {view === "convert" && (
          <>
            <p className="drawer-hint">
              Examined or flogged players are not eligible.
            </p>
            <ul className="flex-1 overflow-y-auto px-4 pb-4 m-0 flex flex-col gap-1.5">
              {convertibles.map((p) => (
                <li key={p.userId} className="m-0">
                  <button
                    type="button"
                    onClick={() => onConvert(p.userId)}
                    className="w-full flex items-center rounded-lg border border-border bg-bg-card px-4 py-3 min-h-12 text-fg text-left cursor-pointer transition-[border-color,background,transform] duration-150 hover:border-accent active:scale-[0.99]"
                  >
                    <span className="flex-1">{p.username}</span>
                  </button>
                </li>
              ))}
            </ul>
            <footer className="drawer-footer">
              <button
                type="button"
                className="btn"
                onClick={() => setView("menu")}
              >
                Back
              </button>
            </footer>
          </>
        )}

        {view === "guns" && (
          <GunsStashView
            roomId={roomId}
            players={players}
            onCancel={() => setView("menu")}
            onDone={onClose}
          />
        )}
      </aside>
    </div>
  );
}

function GunsStashView({ roomId, players, onCancel, onDone }) {
  const [counts, setCounts] = useState({});
  const distributeGuns = useMutation(api.rituals.distributeGuns);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const inc = (userId) => {
    if (total >= 3) return;
    setCounts((c) => ({ ...c, [userId]: (c[userId] ?? 0) + 1 }));
  };
  const dec = (userId) => {
    setCounts((c) => {
      const v = (c[userId] ?? 0) - 1;
      if (v <= 0) {
        const { [userId]: _omit, ...rest } = c;
        return rest;
      }
      return { ...c, [userId]: v };
    });
  };

  const submit = async () => {
    const allocations = Object.entries(counts)
      .filter(([, n]) => n > 0)
      .map(([userId, count]) => ({ userId, count }));
    try {
      await distributeGuns({ roomId, allocations });
      toast.success("Guns distributed.");
      onDone();
    } catch (err) {
      toast.error(err.message ?? "Could not distribute guns");
    }
  };

  return (
    <>
      <p className="drawer-hint">
        Assign 3 guns total ({total}/3). Each recipient gets a private
        notification — others won't know who got what.
      </p>
      <ul className="flex-1 overflow-y-auto px-4 pb-4 m-0 flex flex-col gap-1.5">
        {players.map((p) => {
          const c = counts[p.userId] ?? 0;
          return (
            <li
              key={p.userId}
              className="flex items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-2"
            >
              <span className="flex-1">{p.username}</span>
              <button
                type="button"
                onClick={() => dec(p.userId)}
                disabled={c === 0}
                aria-label={`give one less to ${p.username}`}
                className="btn min-h-9 w-9 px-0 py-0 text-xl"
              >
                −
              </button>
              <span className="w-6 text-center tabular-nums text-accent font-bold">
                {c}
              </span>
              <button
                type="button"
                onClick={() => inc(p.userId)}
                disabled={total >= 3}
                aria-label={`give one more to ${p.username}`}
                className="btn min-h-9 w-9 px-0 py-0 text-xl"
              >
                +
              </button>
            </li>
          );
        })}
      </ul>
      <footer className="drawer-footer">
        <button type="button" className="btn" onClick={onCancel}>
          Back
        </button>
        <button
          type="button"
          className="btn btn-alt"
          onClick={submit}
          disabled={total !== 3}
        >
          Distribute
        </button>
      </footer>
    </>
  );
}
