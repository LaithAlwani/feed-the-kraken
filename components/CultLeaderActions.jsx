"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";
import { api } from "@/convex/_generated/api";

export default function CultLeaderActions({ roomId, players, myUserId, room }) {
  const [mode, setMode] = useState("idle");
  const convertToCult = useMutation(api.rituals.convertToCult);
  const cultCabinSearch = useMutation(api.rituals.cultCabinSearch);

  const navTeamReady =
    !!room.currentCaptain && !!room.currentLieutenant && !!room.currentNavigator;

  // Server is the source of truth on convertibility (it also checks role).
  // Client filters out the obviously-not-convertible to keep the picker tidy.
  const convertibles = players.filter(
    (p) => p.userId !== myUserId && !p.hasBeenExamined,
  );

  const onConvert = async (targetUserId) => {
    setMode("idle");
    try {
      await convertToCult({ roomId, targetUserId });
      toast.success("Conversion complete.");
    } catch (err) {
      toast.error(err.message ?? "Could not convert");
    }
  };

  const onCultCabin = async () => {
    try {
      await cultCabinSearch({ roomId });
    } catch (err) {
      toast.error(err.message ?? "Cult Cabin Search failed");
    }
  };

  if (mode === "convert") {
    return (
      <div className="action-panel">
        <h3>Conversion to Cult — pick a target</h3>
        <p className="hint">Examined or flogged players are not eligible.</p>
        {convertibles.length === 0 ? (
          <p>No eligible targets.</p>
        ) : (
          <ul className="player-picker">
            {convertibles.map((p) => (
              <li key={p.userId}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => onConvert(p.userId)}
                >
                  {p.username}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn-link" onClick={() => setMode("idle")}>
          Cancel
        </button>
      </div>
    );
  }

  if (mode === "guns") {
    return (
      <GunsStashPicker
        roomId={roomId}
        players={players}
        onDone={() => setMode("idle")}
      />
    );
  }

  return (
    <div className="action-panel">
      <h3>Cult Leader actions</h3>
      <button
        type="button"
        className="btn"
        onClick={() => setMode("convert")}
        disabled={convertibles.length === 0}
      >
        Conversion to Cult
      </button>
      <button
        type="button"
        className="btn"
        onClick={onCultCabin}
        disabled={!navTeamReady}
        title={navTeamReady ? "" : "Captain must set the nav team first"}
      >
        Cult Cabin Search
      </button>
      <button type="button" className="btn" onClick={() => setMode("guns")}>
        Distribute 3 guns
      </button>
    </div>
  );
}

function GunsStashPicker({ roomId, players, onDone }) {
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
    <div className="action-panel">
      <h3>Cult Guns Stash — assign 3 guns ({total}/3)</h3>
      <ul className="guns-stash">
        {players.map((p) => {
          const c = counts[p.userId] ?? 0;
          return (
            <li key={p.userId}>
              <span className="player-name">{p.username}</span>
              <button
                type="button"
                className="btn step"
                onClick={() => dec(p.userId)}
                disabled={c === 0}
                aria-label={`give one less to ${p.username}`}
              >
                −
              </button>
              <span className="count">{c}</span>
              <button
                type="button"
                className="btn step"
                onClick={() => inc(p.userId)}
                disabled={total >= 3}
                aria-label={`give one more to ${p.username}`}
              >
                +
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="btn btn-alt"
        onClick={submit}
        disabled={total !== 3}
      >
        Distribute
      </button>
      <button type="button" className="btn-link" onClick={onDone}>
        Cancel
      </button>
    </div>
  );
}
