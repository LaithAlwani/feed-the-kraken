"use client";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";
import { api } from "@/convex/_generated/api";

export default function NavigationTeamPanel({
  roomId,
  players,
  captainId,
  lieutenantId,
  navigatorId,
}) {
  const [captain, setCaptain] = useState(captainId ?? "");
  const [lieutenant, setLieutenant] = useState(lieutenantId ?? "");
  const [navigator, setNavigator] = useState(navigatorId ?? "");

  useEffect(() => setCaptain(captainId ?? ""), [captainId]);
  useEffect(() => setLieutenant(lieutenantId ?? ""), [lieutenantId]);
  useEffect(() => setNavigator(navigatorId ?? ""), [navigatorId]);

  const setNav = useMutation(api.games.setNavigationTeam);

  const submit = async (e) => {
    e.preventDefault();
    if (!captain) return toast.error("Pick a Captain");
    try {
      await setNav({
        roomId,
        captain,
        lieutenant: lieutenant || undefined,
        navigator: navigator || undefined,
      });
      toast.success("Navigation team updated");
    } catch (err) {
      toast.error(err.message ?? "Could not update team");
    }
  };

  return (
    <form className="nav-team-panel" onSubmit={submit}>
      <h3>Navigation team</h3>

      <label>
        Captain
        <select value={captain} onChange={(e) => setCaptain(e.target.value)}>
          <option value="">— pick a player —</option>
          {players.map((p) => (
            <option key={p.userId} value={p.userId}>{p.username}</option>
          ))}
        </select>
      </label>

      <label>
        Lieutenant
        <select value={lieutenant} onChange={(e) => setLieutenant(e.target.value)}>
          <option value="">— pick a player —</option>
          {players
            .filter((p) => p.userId !== captain)
            .map((p) => (
              <option key={p.userId} value={p.userId}>{p.username}</option>
            ))}
        </select>
      </label>

      <label>
        Navigator
        <select value={navigator} onChange={(e) => setNavigator(e.target.value)}>
          <option value="">— pick a player —</option>
          {players
            .filter((p) => p.userId !== captain && p.userId !== lieutenant)
            .map((p) => (
              <option key={p.userId} value={p.userId}>{p.username}</option>
            ))}
        </select>
      </label>

      <button type="submit" className="btn">Update team</button>
    </form>
  );
}
