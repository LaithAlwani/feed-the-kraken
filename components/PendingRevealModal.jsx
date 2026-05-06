"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const ROLE_LABELS = {
  sailor: "Sailor",
  pirate: "Pirate",
  "cult-leader": "Cult Leader",
  cultist: "Cultist",
};

const COVER =
  "fixed inset-0 z-30 flex flex-col items-center justify-center gap-5 p-6 text-fg text-center overflow-y-auto animate-fade-in bg-bg [background:radial-gradient(ellipse_at_50%_50%,rgba(0,0,0,0.4),transparent_60%),var(--color-bg)]";

export default function PendingRevealModal({ roomId, reveal }) {
  const ack = useMutation(api.rituals.acknowledgeReveal);
  const onClose = () => ack({ roomId });

  return (
    <div className={COVER}>
      {reveal.kind === "cabin-search" && (
        <>
          <h2 className="m-0 text-2xl">Cabin Search</h2>
          <p className="m-0 text-fg-dim">
            You searched <strong className="text-fg">{reveal.targetUsername}</strong>'s bag.
          </p>

          {reveal.currentRole === reveal.originalRole ? (
            <>
              <p className="m-0 text-fg-dim">The chip in their bag is:</p>
              <span className={`role-pill role-${reveal.originalRole} animate-fade-up`}>
                {ROLE_LABELS[reveal.originalRole]}
              </span>
            </>
          ) : (
            <>
              <p className="m-0 text-fg-dim">The chip in their bag is:</p>
              <span className={`role-pill role-${reveal.originalRole} animate-fade-up`}>
                {ROLE_LABELS[reveal.originalRole]}
              </span>
              <p className="m-0 text-fg-faint italic text-sm">
                …but they made the tentacle gesture. They are now a:
              </p>
              <span className={`role-pill role-${reveal.currentRole} animate-fade-up`}>
                {ROLE_LABELS[reveal.currentRole]}
              </span>
            </>
          )}

          <p className="m-0 text-fg-faint italic text-sm">
            Don't tell anyone. Or do — and lie.
          </p>
        </>
      )}

      {reveal.kind === "cult-cabin-search" && (
        <>
          <h2 className="m-0 text-2xl">Cult Cabin Search</h2>
          <p className="m-0 text-fg-dim">The current navigation team:</p>
          <ul className="w-full max-w-sm flex flex-col gap-1.5 m-0 p-0">
            {reveal.members.map((m, i) => (
              <li
                key={m.seat}
                className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="w-20 text-xs uppercase tracking-[0.094rem] text-fg-dim">
                  {m.seat}
                </span>
                <span className="flex-1 text-fg text-left">{m.username}</span>
                <span
                  className={`role-pill role-${m.role} text-xs px-2.5 py-1 tracking-[0.062rem]`}
                >
                  {ROLE_LABELS[m.role]}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {reveal.kind === "you-are-cultist" && (
        <>
          <h2 className="m-0 text-2xl">You are now a Cultist.</h2>
          <p className="m-0 text-fg-dim">
            Your master:{" "}
            <strong className="text-fg">{reveal.cultLeaderUsername}</strong>
          </p>
          {reveal.fellowCultistUsernames.length > 0 && (
            <>
              <p className="m-0 text-fg-dim">Other cultists:</p>
              <ul className="flex flex-col gap-1.5 m-0 p-0 max-w-sm w-full">
                {reveal.fellowCultistUsernames.map((n) => (
                  <li
                    key={n}
                    className="flex items-center justify-center rounded-lg border border-border bg-bg-card px-3 py-2"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="m-0 text-fg-faint italic text-sm">
            You now win with the cult.
          </p>
        </>
      )}

      {reveal.kind === "guns-received" && (
        <>
          <h2 className="m-0 text-2xl">
            The cult slipped you {reveal.count} gun
            {reveal.count === 1 ? "" : "s"}.
          </h2>
          <p className="m-0 text-fg-faint italic text-sm">Take them quietly.</p>
        </>
      )}

      <button className="btn btn-alt" onClick={onClose}>
        OK
      </button>
    </div>
  );
}
