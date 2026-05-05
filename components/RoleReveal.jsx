"use client";
import { useEffect, useState } from "react";
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

const PIRATE_TIMER_SECONDS = 5;

export default function RoleReveal({ roomId, role, fellowPirates }) {
  const [step, setStep] = useState("gate");
  const [secondsLeft, setSecondsLeft] = useState(PIRATE_TIMER_SECONDS);
  const markRoleSeen = useMutation(api.players.markRoleSeen);

  const info = role ? ROLE_INFO[role] : null;

  useEffect(() => {
    if (step !== "crew") return;
    if (secondsLeft <= 0) {
      setStep("ready");
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, secondsLeft]);

  const acknowledge = async () => {
    await markRoleSeen({ roomId });
  };

  if (!info) {
    return (
      <div className="role-reveal cover">
        <p>Waiting for role assignment…</p>
      </div>
    );
  }

  if (step === "gate") {
    return (
      <div className="role-reveal cover">
        <h2>Your role is ready</h2>
        <p>Make sure no one is looking at your screen.</p>
        <button className="btn btn-alt" onClick={() => setStep("role")}>
          Tap to reveal
        </button>
      </div>
    );
  }

  if (step === "role") {
    const hasCrew = role === "pirate" && fellowPirates && fellowPirates.length > 0;
    return (
      <div className="role-reveal">
        <div className={`role-card role-${role}`}>
          <span className="role-icon" aria-hidden>{info.icon}</span>
          <h3 className="role-name">{info.title}</h3>
          <p className="role-tagline">{info.tagline}</p>
        </div>
        {hasCrew ? (
          <button className="btn btn-alt" onClick={() => setStep("crew")}>
            Meet your crew
          </button>
        ) : (
          <button className="btn btn-alt" onClick={acknowledge}>
            I'm ready
          </button>
        )}
      </div>
    );
  }

  if (step === "crew") {
    return (
      <div className="role-reveal">
        <h2>Your fellow pirates</h2>
        <ul className="crew-list">
          {fellowPirates.map((p) => (
            <li key={p.userId}>
              {p.avatar && <img src={p.avatar} alt="" className="avatar" />}
              <span>{p.username}</span>
            </li>
          ))}
        </ul>
        <p className="timer">Memorize them · {secondsLeft}s</p>
      </div>
    );
  }

  return (
    <div className="role-reveal cover">
      <h2>Got it.</h2>
      <p>The journey begins.</p>
      <button className="btn btn-alt" onClick={acknowledge}>
        Continue
      </button>
    </div>
  );
}
