import type { Infer } from "convex/values";
import { ROLE } from "../schema";

export type Role = Infer<typeof ROLE>;

type Distribution = { sailors: number; pirates: number; cultLeaders: number; cultists: number };

// Rulebook p.7 distribution table. 5p has two valid configurations and we
// pick one at random per game (rulebook variant rule).
function distributionFor(playerCount: number): Distribution {
  switch (playerCount) {
    case 5:
      return Math.random() < 0.5
        ? { sailors: 3, pirates: 1, cultLeaders: 1, cultists: 0 }
        : { sailors: 2, pirates: 2, cultLeaders: 1, cultists: 0 };
    case 6: return { sailors: 3, pirates: 2, cultLeaders: 1, cultists: 0 };
    case 7: return { sailors: 4, pirates: 2, cultLeaders: 1, cultists: 0 };
    case 8: return { sailors: 4, pirates: 3, cultLeaders: 1, cultists: 0 };
    case 9: return { sailors: 5, pirates: 3, cultLeaders: 1, cultists: 0 };
    case 10: return { sailors: 5, pirates: 4, cultLeaders: 1, cultists: 0 };
    case 11: return { sailors: 5, pirates: 4, cultLeaders: 1, cultists: 1 };
    default:
      throw new Error(`Unsupported player count ${playerCount}. Feed the Kraken supports 5–11.`);
  }
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function assignRoles(playerCount: number): Role[] {
  const d = distributionFor(playerCount);
  const roles: Role[] = [
    ...Array<Role>(d.sailors).fill("sailor"),
    ...Array<Role>(d.pirates).fill("pirate"),
    ...Array<Role>(d.cultLeaders).fill("cult-leader"),
    ...Array<Role>(d.cultists).fill("cultist"),
  ];
  return shuffle(roles);
}
