"use client";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const ROLE_INFO = {
  sailor: {
    title: "Sailor",
    tagline: "Sail the ship east to Bluewater Bay.",
    icon: "⚓",
  },
  pirate: {
    title: "Pirate",
    tagline: "Plunder. Sail the ship west to Crimson Cove.",
    icon: "🏴‍☠️",
  },
  "cult-leader": {
    title: "Cult Leader",
    tagline: "Reach the Kraken in the north — or be sacrificed to it.",
    icon: "🐙",
  },
  cultist: {
    title: "Cultist",
    tagline: "Find your Cult Leader. Win together.",
    icon: "👁️",
  },
};

const TIMER_SECONDS = 5;

const COVER =
  "fixed inset-0 z-30 flex flex-col items-center justify-center gap-5 p-6 text-fg text-center overflow-y-auto animate-fade-in bg-bg-modal [background:radial-gradient(ellipse_at_50%_30%,rgba(195,165,95,0.06),transparent_60%),var(--color-bg-modal)]";

export default function RoleReveal({ roomId, role, fellowPirates }) {
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const markRoleSeen = useMutation(api.players.markRoleSeen);
  const ackedRef = useRef(false);

  const info = role ? ROLE_INFO[role] : null;
  const hasCrew =
    role === "pirate" && fellowPirates && fellowPirates.length > 0;

  // Tick the countdown once we have a role to show.
  useEffect(() => {
    if (!info) return;
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [info, secondsLeft]);

  // When the countdown finishes, auto-dismiss back to the game screen.
  // `ackedRef` guards against StrictMode firing the effect twice.
  useEffect(() => {
    if (!info) return;
    if (secondsLeft > 0) return;
    if (ackedRef.current) return;
    ackedRef.current = true;
    markRoleSeen({ roomId });
  }, [info, secondsLeft, markRoleSeen, roomId]);

  if (!info) {
    return (
      <div className={COVER}>
        <p className="m-0 text-fg-dim">Waiting for role assignment…</p>
      </div>
    );
  }

  return (
    <div className={COVER}>
      <div
        className={`role-card-stripe role-${role} relative overflow-hidden flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border border-border bg-bg-card p-7 animate-scale-in`}
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        <span
          className="text-7xl leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          aria-hidden
        >
          {info.icon}
        </span>
        <h3 className="m-0 text-2xl uppercase tracking-[0.187rem] text-fg">
          {info.title}
        </h3>
        <p className="m-0 text-fg-dim text-base">{info.tagline}</p>
      </div>

      {hasCrew && (
        <div className="w-full max-w-sm flex flex-col gap-2">
          <p className="m-0 text-xs uppercase tracking-[0.125rem] text-fg-dim">
            Your crew
          </p>
          <ul className="flex flex-col gap-2 m-0 p-0">
            {fellowPirates.map((p, i) => (
              <li
                key={p.userId}
                className="flex items-center gap-3 rounded-lg border border-border border-l-[3px] border-l-role-pirate bg-bg-card px-4 py-2 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {p.avatar && (
                  <img
                    src={p.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full border border-border"
                  />
                )}
                <span>{p.username}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="m-0 text-fg-dim tabular-nums tracking-[0.125rem]">
        Memorize · {Math.max(secondsLeft, 0)}s
      </p>
    </div>
  );
}
