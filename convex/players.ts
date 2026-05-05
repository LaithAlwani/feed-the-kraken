import { v } from "convex/values";
import { mutation } from "./_generated/server";

function displayName(identity: { name?: string | null; nickname?: string | null; givenName?: string | null }) {
  return identity.nickname ?? identity.name ?? identity.givenName ?? "Player";
}

export const joinRoom = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");
    if (room.gameStarted) throw new Error("This game has already started");

    const existing = await ctx.db
      .query("players")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", roomId).eq("userId", identity.subject),
      )
      .unique();
    if (existing) return existing._id;

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    if (players.length >= 11) throw new Error("Room is full (max 11 players)");

    return await ctx.db.insert("players", {
      roomId,
      userId: identity.subject,
      username: displayName(identity),
      avatar: identity.pictureUrl,
      hasSeenRole: false,
    });
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", roomId).eq("userId", identity.subject),
      )
      .unique();
    if (player) await ctx.db.delete(player._id);
  },
});

export const markRoleSeen = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", roomId).eq("userId", identity.subject),
      )
      .unique();
    if (player && !player.hasSeenRole) {
      await ctx.db.patch(player._id, { hasSeenRole: true });
    }
  },
});

// --- Test helpers (admin-only, pre-game) ----------------------------------
// These are intended for local testing without spinning up multiple Clerk users.
// Fake players have a synthetic userId prefixed with "fake:" so they can be
// distinguished from real Clerk subjects.

const FAKE_NAMES = [
  "Bonnie", "Calico", "Rackham", "Drake", "Morgan",
  "Teach", "Read", "Kidd", "Vane", "Hornigold",
  "Avery", "Bellamy", "Roberts", "Lowther", "Tew",
];

export const addFakePlayer = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");
    if (room.gameAdmin !== identity.subject) {
      throw new Error("Only the room admin can add fake players");
    }
    if (room.gameStarted) throw new Error("Cannot add players after the game has started");

    const existing = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    if (existing.length >= 11) throw new Error("Room is full (max 11 players)");

    const usedNames = new Set(existing.map((p) => p.username));
    const available = FAKE_NAMES.filter((n) => !usedNames.has(n));
    const baseName =
      available[Math.floor(Math.random() * available.length)] ??
      `Pirate ${existing.length + 1}`;

    return await ctx.db.insert("players", {
      roomId,
      userId: `fake:${baseName}:${Date.now()}`,
      username: baseName,
      hasSeenRole: false,
    });
  },
});

export const removeFakePlayers = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");
    if (room.gameAdmin !== identity.subject) {
      throw new Error("Only the room admin can remove fake players");
    }

    const fakes = (
      await ctx.db
        .query("players")
        .withIndex("by_room", (q) => q.eq("roomId", roomId))
        .collect()
    ).filter((p) => p.userId.startsWith("fake:"));

    for (const f of fakes) await ctx.db.delete(f._id);
  },
});
