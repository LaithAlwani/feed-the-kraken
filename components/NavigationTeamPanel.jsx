"use client";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";
import { FaCrown, FaUserTie, FaCompass, FaTimes } from "react-icons/fa";
import { TbShip } from "react-icons/tb";
import { api } from "@/convex/_generated/api";

export default function NavigationTeamPanel({
  roomId,
  players,
  captainId,
  lieutenantId,
  navigatorId,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TbShip
        size={32}
        className="text-2xl text-accent cursor-pointer"
        onClick={() => setOpen(true)}
      />

      {open && (
        <NavigationTeamDrawer
          roomId={roomId}
          players={players}
          captainId={captainId}
          lieutenantId={lieutenantId}
          navigatorId={navigatorId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function NavigationTeamDrawer({
  roomId,
  players,
  captainId,
  lieutenantId,
  navigatorId,
  onClose,
}) {
  const [selectedSlot, setSelectedSlot] = useState(
    !captainId ? "captain" : !lieutenantId ? "lieutenant" : "navigator",
  );
  const setNav = useMutation(api.games.setNavigationTeam);

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

  const nameOf = (uid) => players.find((p) => p.userId === uid)?.username;

  const assign = async (userId) => {
    let nextCap = captainId;
    let nextLt = lieutenantId;
    let nextNav = navigatorId;

    if (nextCap === userId) nextCap = undefined;
    if (nextLt === userId) nextLt = undefined;
    if (nextNav === userId) nextNav = undefined;

    if (selectedSlot === "captain") nextCap = userId;
    if (selectedSlot === "lieutenant") nextLt = userId;
    if (selectedSlot === "navigator") nextNav = userId;

    const order = ["captain", "lieutenant", "navigator"];
    const valByKey = {
      captain: nextCap,
      lieutenant: nextLt,
      navigator: nextNav,
    };
    const nextEmpty = order.find((k) => !valByKey[k]);
    if (nextEmpty) setSelectedSlot(nextEmpty);

    try {
      await setNav({
        roomId,
        captain: nextCap || undefined,
        lieutenant: nextLt || undefined,
        navigator: nextNav || undefined,
      });
    } catch (err) {
      toast.error(err.message ?? "Could not update");
    }
  };

  const seats = [
    { key: "captain", label: "Captain", value: captainId, Icon: FaCrown },
    {
      key: "lieutenant",
      label: "Lieutenant",
      value: lieutenantId,
      Icon: FaUserTie,
    },
    {
      key: "navigator",
      label: "Navigator",
      value: navigatorId,
      Icon: FaCompass,
    },
  ];

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header">
          <h3>Navigation team</h3>
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
          {seats.map(({ key, label, value, Icon }) => {
            const active = selectedSlot === key;
            const filled = !!value;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedSlot(key)}
                className={[
                  "grid grid-cols-[2rem_1fr] grid-rows-[auto_auto] items-center gap-x-3",
                  "px-4 py-3 rounded-lg border bg-bg-card text-fg cursor-pointer text-left",
                  "transition-[border-color,background,box-shadow] duration-150",
                  filled && !active ? "bg-bg-card-hover" : "",
                  active
                    ? "border-accent shadow-[0_0_0_1px_var(--color-accent),var(--shadow-glow)]"
                    : "border-border hover:border-border-strong",
                ].join(" ")}
              >
                <Icon className="row-span-2 text-lg text-accent" />
                <span className="text-[0.72rem] uppercase tracking-[0.094rem] text-fg-dim">
                  {label}
                </span>
                <span className="text-[0.95rem] text-fg">
                  {nameOf(value) ?? "Tap a player"}
                </span>
              </button>
            );
          })}
        </div>

        <p className="drawer-hint">
          Tap a player to assign them to the highlighted seat.
        </p>

        <ul className="flex-1 overflow-y-auto px-4 pb-4 m-0 flex flex-col gap-1.5">
          {players.map((p) => {
            const isCap = p.userId === captainId;
            const isLt = p.userId === lieutenantId;
            const isNav = p.userId === navigatorId;
            const taken = isCap || isLt || isNav;
            return (
              <li key={p.userId} className="m-0">
                <button
                  type="button"
                  onClick={() => assign(p.userId)}
                  className={[
                    "w-full flex items-center justify-between gap-2 rounded-lg border px-4 py-3 min-h-12",
                    "text-fg text-left cursor-pointer",
                    "transition-[border-color,background,transform] duration-150",
                    "hover:border-accent active:scale-[0.99]",
                    taken
                      ? "bg-accent/6 border-accent-dim"
                      : "bg-bg-card border-border",
                  ].join(" ")}
                >
                  <span className="flex-1">{p.username}</span>
                  <span className="flex items-center gap-1.5 text-accent">
                    {isCap && <FaCrown />}
                    {isLt && <FaUserTie />}
                    {isNav && <FaCompass />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
