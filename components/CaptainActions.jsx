"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";
import { api } from "@/convex/_generated/api";

export default function CaptainActions({ roomId, players, myUserId }) {
  const [picking, setPicking] = useState(false);
  const cabinSearch = useMutation(api.rituals.cabinSearch);

  const onSearch = async (targetUserId) => {
    setPicking(false);
    try {
      await cabinSearch({ roomId, targetUserId });
    } catch (err) {
      toast.error(err.message ?? "Cabin Search failed");
    }
  };

  if (picking) {
    return (
      <div className="action-panel">
        <h3>Cabin Search — pick a target</h3>
        <ul className="player-picker">
          {players
            .filter((p) => p.userId !== myUserId)
            .map((p) => (
              <li key={p.userId}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => onSearch(p.userId)}
                >
                  {p.username}
                  {p.hasBeenExamined && <span className="muted"> (already examined)</span>}
                </button>
              </li>
            ))}
        </ul>
        <button type="button" className="btn-link" onClick={() => setPicking(false)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="action-panel">
      <h3>Captain actions</h3>
      <button type="button" className="btn" onClick={() => setPicking(true)}>
        Cabin Search
      </button>
    </div>
  );
}
