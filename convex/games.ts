import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { assignRoles } from "./lib/roles";

function displayName(identity: { name?: string | null; nickname?: string | null; givenName?: string | null }) {
  return identity.nickname ?? identity.name ?? identity.givenName ?? "Player";
}

export const listRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db.query("gameRooms").order("desc").collect();
    return Promise.all(
      rooms.map(async (room) => {
        const playerCount = (
          await ctx.db
            .query("players")
            .withIndex("by_room", (q) => q.eq("roomId", room._id))
            .collect()
        ).length;
        return {
          _id: room._id,
          name: room.name,
          gameAdmin: room.gameAdmin,
          gameStarted: room.gameStarted,
          playerCount,
        };
      }),
    );
  },
});

export const createRoom = mutation({
  args: { name: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const roomId = await ctx.db.insert("gameRooms", {
      name: args.name,
      password: args.password,
      gameAdmin: identity.subject,
      gameStarted: false,
    });

    await ctx.db.insert("players", {
      roomId,
      userId: identity.subject,
      username: displayName(identity),
      avatar: identity.pictureUrl,
      hasSeenRole: false,
    });

    return roomId;
  },
});

export const deleteRoom = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");
    if (room.gameAdmin !== identity.subject) {
      throw new Error("Only the room admin can delete this room");
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    for (const p of players) await ctx.db.delete(p._id);

    await ctx.db.delete(roomId);
  },
});

export const startGame = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");
    if (room.gameAdmin !== identity.subject) {
      throw new Error("Only the room admin can start the game");
    }
    if (room.gameStarted) throw new Error("Game already started");

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    if (players.length < 5) {
      throw new Error(
        `Need at least 5 players to start (currently ${players.length}).`,
      );
    }
    if (players.length > 11) {
      throw new Error(
        `Too many players (${players.length}). Feed the Kraken supports up to 11.`,
      );
    }

    const roles = assignRoles(players.length);
    for (let i = 0; i < players.length; i++) {
      await ctx.db.patch(players[i]._id, {
        role: roles[i],
        originalRole: roles[i],
        guns: 3,
        hasBeenExamined: false,
      });
    }

    const captain = players[Math.floor(Math.random() * players.length)];
    const cultLeader = players[roles.indexOf("cult-leader")];
    await ctx.db.patch(roomId, {
      gameStarted: true,
      currentCaptain: captain.userId,
      cultNetworkUserIds: cultLeader ? [cultLeader.userId] : [],
    });
  },
});

// Admin-only: wipe all per-player game state and re-deal roles. Players
// stay seated but their roles, examined status, guns, and pending reveals
// are reset; navigation team is cleared; a fresh captain is picked.
export const restartGame = mutation({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");
    if (room.gameAdmin !== identity.subject) {
      throw new Error("Only the room admin can restart the game");
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    if (players.length < 5 || players.length > 11) {
      throw new Error(
        `Need 5–11 players to restart (currently ${players.length}).`,
      );
    }

    const roles = assignRoles(players.length);
    for (let i = 0; i < players.length; i++) {
      await ctx.db.patch(players[i]._id, {
        role: roles[i],
        originalRole: roles[i],
        guns: 3,
        hasBeenExamined: false,
        hasSeenRole: false,
        pendingReveal: undefined,
      });
    }

    const captain = players[Math.floor(Math.random() * players.length)];
    const cultLeader = players[roles.indexOf("cult-leader")];
    await ctx.db.patch(roomId, {
      gameStarted: true,
      currentCaptain: captain.userId,
      currentLieutenant: undefined,
      currentNavigator: undefined,
      cultNetworkUserIds: cultLeader ? [cultLeader.userId] : [],
    });
  },
});

export const setNavigationTeam = mutation({
  args: {
    roomId: v.id("gameRooms"),
    captain: v.string(),
    lieutenant: v.optional(v.string()),
    navigator: v.optional(v.string()),
  },
  handler: async (ctx, { roomId, captain, lieutenant, navigator }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");

    const isCaptain = room.currentCaptain === identity.subject;
    const isAdmin = room.gameAdmin === identity.subject;
    if (!isCaptain && !isAdmin) {
      throw new Error("Only the current captain or room admin can set the navigation team");
    }

    if (lieutenant && captain === lieutenant) {
      throw new Error("Captain and Lieutenant must be different players");
    }
    if (navigator && (captain === navigator || lieutenant === navigator)) {
      throw new Error("Navigator must be a different player from Captain and Lieutenant");
    }

    await ctx.db.patch(roomId, {
      currentCaptain: captain,
      currentLieutenant: lieutenant,
      currentNavigator: navigator,
    });
  },
});

// Admin-only debug view: returns every player's assigned role.
// Only available after the game has started, and only to the room admin.
export const getAllRolesDebug = query({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const room = await ctx.db.get(roomId);
    if (!room) return null;
    if (room.gameAdmin !== identity.subject) return null;
    if (!room.gameStarted) return null;

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    return players.map((p) => ({
      userId: p.userId,
      username: p.username,
      role: p.role ?? null,
    }));
  },
});

export const getMyGameView = query({
  args: { roomId: v.id("gameRooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const room = await ctx.db.get(roomId);
    if (!room) return null;

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    const me = players.find((p) => p.userId === identity.subject) ?? null;

    const publicPlayers = players.map((p) => ({
      _id: p._id,
      userId: p.userId,
      username: p.username,
      avatar: p.avatar,
      hasSeenRole: p.hasSeenRole,
      hasBeenExamined: p.hasBeenExamined ?? false,
      // Gun counts are public outside of a mutiny (rulebook p.9). Surfacing
      // them here lets the table notice when the cult leader distributed
      // guns — counts go up without a public announcement.
      guns: p.guns ?? 0,
    }));

    const mySlice = me
      ? {
          _id: me._id,
          role: me.role ?? null,
          hasSeenRole: me.hasSeenRole,
          guns: me.guns ?? 0,
          pendingReveal: me.pendingReveal ?? null,
        }
      : null;

    let fellowPirates: { userId: string; username: string; avatar?: string }[] | null = null;
    if (me?.role === "pirate") {
      fellowPirates = players
        .filter((p) => p.role === "pirate" && p.userId !== me.userId)
        .map((p) => ({ userId: p.userId, username: p.username, avatar: p.avatar }));
    }

    // Mutually-known cult members. Cult leader is seeded at game start; new
    // converts get added by convertToCult. The 11p initial cultist is NOT
    // here — rulebook says they find each other through play, not the app.
    const cultNetwork = room.cultNetworkUserIds ?? [];
    let fellowCultists: { userId: string; username: string; avatar?: string }[] | null = null;
    if (
      me &&
      (me.role === "cult-leader" || me.role === "cultist") &&
      cultNetwork.includes(me.userId)
    ) {
      fellowCultists = players
        .filter((p) => cultNetwork.includes(p.userId) && p.userId !== me.userId)
        .map((p) => ({ userId: p.userId, username: p.username, avatar: p.avatar }));
    }

    return {
      room: {
        _id: room._id,
        name: room.name,
        gameStarted: room.gameStarted,
        gameAdmin: room.gameAdmin,
        currentCaptain: room.currentCaptain ?? null,
        currentLieutenant: room.currentLieutenant ?? null,
        currentNavigator: room.currentNavigator ?? null,
      },
      players: publicPlayers,
      me: mySlice,
      fellowPirates,
      fellowCultists,
    };
  },
});
