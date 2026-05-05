import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const ROLE = v.union(
  v.literal("sailor"),
  v.literal("pirate"),
  v.literal("cult-leader"),
  v.literal("cultist"),
);

// One-shot private notification delivered to a single player's phone.
// The player dismisses it, which clears the field via acknowledgeReveal.
export const PENDING_REVEAL = v.union(
  v.object({
    kind: v.literal("cabin-search"),
    targetUsername: v.string(),
    currentRole: ROLE,
    // The faction chip in the seabag — unchanged by Conversion to Cult.
    // For converted players this differs from currentRole, which the modal
    // surfaces as "(converted)".
    originalRole: ROLE,
  }),
  v.object({
    kind: v.literal("cult-cabin-search"),
    members: v.array(
      v.object({
        seat: v.union(
          v.literal("captain"),
          v.literal("lieutenant"),
          v.literal("navigator"),
        ),
        username: v.string(),
        role: ROLE,
      }),
    ),
  }),
  v.object({
    kind: v.literal("you-are-cultist"),
    cultLeaderUsername: v.string(),
    fellowCultistUsernames: v.array(v.string()),
  }),
  v.object({
    kind: v.literal("guns-received"),
    count: v.number(),
  }),
);

export default defineSchema({
  gameRooms: defineTable({
    name: v.string(),
    password: v.string(),
    gameAdmin: v.string(),
    gameStarted: v.boolean(),
    currentCaptain: v.optional(v.string()),
    currentLieutenant: v.optional(v.string()),
    currentNavigator: v.optional(v.string()),
    // Mutually-known cult members (cult leader + anyone they convert).
    // The 11p initial cultist is NOT in this set — they find each other in person.
    cultNetworkUserIds: v.optional(v.array(v.string())),
  }),

  players: defineTable({
    roomId: v.id("gameRooms"),
    userId: v.string(),
    username: v.string(),
    avatar: v.optional(v.string()),
    role: v.optional(ROLE),
    // Faction chip in the seabag at game start. Never changes after startGame.
    // Cabin Search inspects the bag, so it returns originalRole alongside role.
    originalRole: v.optional(ROLE),
    hasSeenRole: v.boolean(),
    // True after a Cabin Search or Flogging has examined this player.
    // Such players are no longer convertible to the cult (rulebook p.13/15).
    hasBeenExamined: v.optional(v.boolean()),
    guns: v.optional(v.number()),
    pendingReveal: v.optional(PENDING_REVEAL),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_user", ["roomId", "userId"]),
});
