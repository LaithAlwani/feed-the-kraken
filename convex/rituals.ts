import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

async function getMyPlayer(ctx: any, roomId: Id<"gameRooms">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const room = await ctx.db.get(roomId);
  if (!room) throw new Error("Room not found");
  if (!room.gameStarted) throw new Error("Game has not started yet");
  const me = await ctx.db
    .query("players")
    .withIndex("by_room_and_user", (q: any) =>
      q.eq("roomId", roomId).eq("userId", identity.subject),
    )
    .unique();
  if (!me) throw new Error("You are not a player in this room");
  return { room, me } as { room: Doc<"gameRooms">; me: Doc<"players"> };
}

// Captain searches a player's "cabin" — i.e. learns their faction privately.
// Marks the target as examined so they can no longer be converted to the cult
// (rulebook p.13). The result is delivered as a one-shot pendingReveal on
// the captain's record.
export const cabinSearch = mutation({
  args: { roomId: v.id("gameRooms"), targetUserId: v.string() },
  handler: async (ctx, { roomId, targetUserId }) => {
    const { room, me } = await getMyPlayer(ctx, roomId);
    if (room.currentCaptain !== me.userId) {
      throw new Error("Only the current captain can run a Cabin Search");
    }
    if (targetUserId === me.userId) {
      throw new Error("The captain cannot search themselves");
    }

    const target = await ctx.db
      .query("players")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", roomId).eq("userId", targetUserId),
      )
      .unique();
    if (!target) throw new Error("Target is not in this room");
    if (!target.role) throw new Error("Target has no role yet");
    // originalRole is seeded at startGame for every player, so this should
    // always be present. Fall back to current role just to satisfy types
    // for legacy rows from a pre-slice-2 deployment.
    const originalRole = target.originalRole ?? target.role;

    await ctx.db.patch(target._id, { hasBeenExamined: true });
    await ctx.db.patch(me._id, {
      pendingReveal: {
        kind: "cabin-search",
        targetUsername: target.username,
        currentRole: target.role,
        originalRole,
      },
    });
  },
});

// Cult Ritual card: the Cult Leader privately learns the factions of the
// current navigation team (rulebook p.15).
export const cultCabinSearch = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const { room, me } = await getMyPlayer(ctx, roomId);
    if (me.role !== "cult-leader") {
      throw new Error("Only the Cult Leader can run a Cult Cabin Search");
    }
    if (!room.currentCaptain || !room.currentLieutenant || !room.currentNavigator) {
      throw new Error("Set the navigation team first (captain, lieutenant, navigator)");
    }

    const seats: Array<{ seat: "captain" | "lieutenant" | "navigator"; userId: string }> = [
      { seat: "captain", userId: room.currentCaptain },
      { seat: "lieutenant", userId: room.currentLieutenant },
      { seat: "navigator", userId: room.currentNavigator },
    ];

    const members: { seat: "captain" | "lieutenant" | "navigator"; username: string; role: any }[] = [];
    for (const { seat, userId } of seats) {
      const p = await ctx.db
        .query("players")
        .withIndex("by_room_and_user", (q) => q.eq("roomId", roomId).eq("userId", userId))
        .unique();
      if (!p?.role) throw new Error(`Could not look up the ${seat}`);
      members.push({ seat, username: p.username, role: p.role });
    }

    await ctx.db.patch(me._id, {
      pendingReveal: { kind: "cult-cabin-search", members },
    });
  },
});

// Cult Ritual card: the Cult Leader converts a convertible player to the cult.
// The target's role flips to "cultist", they're added to the room's cult network,
// and they receive a pendingReveal showing who's in the cult.
export const convertToCult = mutation({
  args: { roomId: v.id("gameRooms"), targetUserId: v.string() },
  handler: async (ctx, { roomId, targetUserId }) => {
    const { room, me } = await getMyPlayer(ctx, roomId);
    if (me.role !== "cult-leader") {
      throw new Error("Only the Cult Leader can convert players");
    }
    if (targetUserId === me.userId) {
      throw new Error("Cannot convert yourself");
    }

    const target = await ctx.db
      .query("players")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", roomId).eq("userId", targetUserId),
      )
      .unique();
    if (!target) throw new Error("Target is not in this room");
    if (target.hasBeenExamined) {
      throw new Error("Target has been examined and can no longer be converted");
    }
    if (target.role === "cult-leader" || target.role === "cultist") {
      throw new Error("Target is already in the cult");
    }

    const cultNetwork = room.cultNetworkUserIds ?? [];
    const newCultNetwork = [...cultNetwork, target.userId];

    // Build the network preview the new convert will see.
    const fellowCultistUsernames: string[] = [];
    for (const uid of cultNetwork) {
      if (uid === target.userId) continue;
      const p = await ctx.db
        .query("players")
        .withIndex("by_room_and_user", (q) => q.eq("roomId", roomId).eq("userId", uid))
        .unique();
      if (p && p.userId !== me.userId) fellowCultistUsernames.push(p.username);
    }

    await ctx.db.patch(target._id, {
      role: "cultist",
      pendingReveal: {
        kind: "you-are-cultist",
        cultLeaderUsername: me.username,
        fellowCultistUsernames,
      },
    });
    await ctx.db.patch(roomId, { cultNetworkUserIds: newCultNetwork });
  },
});

// Cult Ritual card: the Cult Leader distributes 3 guns from the supply to
// any combination of players (themselves included). Recipients get a private
// pendingReveal so the table can't see who got what (rulebook p.15).
export const distributeGuns = mutation({
  args: {
    roomId: v.id("gameRooms"),
    allocations: v.array(
      v.object({ userId: v.string(), count: v.number() }),
    ),
  },
  handler: async (ctx, { roomId, allocations }) => {
    const { me } = await getMyPlayer(ctx, roomId);
    if (me.role !== "cult-leader") {
      throw new Error("Only the Cult Leader can distribute the cult guns");
    }
    const total = allocations.reduce((sum, a) => sum + a.count, 0);
    if (total !== 3) throw new Error("Must distribute exactly 3 guns");
    if (allocations.some((a) => a.count <= 0)) {
      throw new Error("Each recipient must get at least 1 gun");
    }
    if (allocations.length > 3) {
      throw new Error("Up to 3 recipients allowed");
    }
    const userIds = new Set(allocations.map((a) => a.userId));
    if (userIds.size !== allocations.length) {
      throw new Error("Each recipient may only appear once");
    }

    for (const a of allocations) {
      const recipient = await ctx.db
        .query("players")
        .withIndex("by_room_and_user", (q) =>
          q.eq("roomId", roomId).eq("userId", a.userId),
        )
        .unique();
      if (!recipient) throw new Error("Recipient is not in this room");
      await ctx.db.patch(recipient._id, {
        guns: (recipient.guns ?? 0) + a.count,
        pendingReveal: { kind: "guns-received", count: a.count },
      });
    }
  },
});

// Player dismisses whatever pendingReveal is on their record.
export const acknowledgeReveal = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const { me } = await getMyPlayer(ctx, roomId);
    if (me.pendingReveal) {
      await ctx.db.patch(me._id, { pendingReveal: undefined });
    }
  },
});
