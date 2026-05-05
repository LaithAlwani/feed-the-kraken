"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const ROLE_LABELS = {
  sailor: "Sailor",
  pirate: "Pirate",
  "cult-leader": "Cult Leader",
  cultist: "Cultist",
};

export default function PendingRevealModal({ roomId, reveal }) {
  const ack = useMutation(api.rituals.acknowledgeReveal);
  const onClose = () => ack({ roomId });

  return (
    <div className="role-reveal cover">
      {reveal.kind === "cabin-search" && (
        <>
          <h2>Cabin Search</h2>
          <p>You searched <strong>{reveal.targetUsername}</strong>'s bag.</p>
          {reveal.currentRole === reveal.originalRole ? (
            <>
              <p>The chip in their bag is:</p>
              <h3 className={`role-pill role-${reveal.originalRole}`}>
                {ROLE_LABELS[reveal.originalRole]}
              </h3>
            </>
          ) : (
            <>
              <p>The chip in their bag is:</p>
              <h3 className={`role-pill role-${reveal.originalRole}`}>
                {ROLE_LABELS[reveal.originalRole]}
              </h3>
              <p className="hint">…but they made the tentacle gesture. They are now a:</p>
              <h3 className={`role-pill role-${reveal.currentRole}`}>
                {ROLE_LABELS[reveal.currentRole]}
              </h3>
            </>
          )}
          <p className="hint">Don't tell anyone. Or do — and lie.</p>
        </>
      )}

      {reveal.kind === "cult-cabin-search" && (
        <>
          <h2>Cult Cabin Search</h2>
          <p>The current navigation team:</p>
          <ul className="reveal-list">
            {reveal.members.map((m) => (
              <li key={m.seat}>
                <span className="seat">{m.seat}</span>
                <span className="who">{m.username}</span>
                <span className={`role-pill role-${m.role}`}>{ROLE_LABELS[m.role]}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {reveal.kind === "you-are-cultist" && (
        <>
          <h2>You are now a Cultist.</h2>
          <p>
            Your master: <strong>{reveal.cultLeaderUsername}</strong>
          </p>
          {reveal.fellowCultistUsernames.length > 0 && (
            <>
              <p>Other cultists:</p>
              <ul className="reveal-list simple">
                {reveal.fellowCultistUsernames.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </>
          )}
          <p className="hint">You now win with the cult.</p>
        </>
      )}

      {reveal.kind === "guns-received" && (
        <>
          <h2>The cult slipped you {reveal.count} gun{reveal.count === 1 ? "" : "s"}.</h2>
          <p className="hint">Take them quietly.</p>
        </>
      )}

      <button className="btn btn-alt" onClick={onClose}>
        OK
      </button>
    </div>
  );
}
