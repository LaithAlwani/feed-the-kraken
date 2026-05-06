import { FaCrown, FaCompass, FaUserTie, FaSearch } from "react-icons/fa";
import { GiPirateFlag } from "react-icons/gi";

export default function PlayersList({
  players,
  myUserId,
  myRole,
  fellowPirates,
  captainId,
  lieutenantId,
  navigatorId,
  onMeClick,
  meActionHint,
}) {
  if (!players || players.length === 0) return null;

  const fellowPirateIds = new Set((fellowPirates ?? []).map((p) => p.userId));

  return (
    <ul className="w-full max-w-md mx-auto flex flex-col gap-2 my-4">
      {players.map((player) => {
        const isMe = player.userId === myUserId;
        const isCaptain = player.userId === captainId;
        const isLieutenant = player.userId === lieutenantId;
        const isNavigator = player.userId === navigatorId;
        const isCrewmate = myRole === "pirate" && fellowPirateIds.has(player.userId);
        const meIsTappable = isMe && typeof onMeClick === "function";

        const baseClasses =
          "flex items-center gap-3 rounded-lg border bg-bg-card px-3 py-2.5 animate-fade-up transition-colors duration-150";
        const meClasses = isMe
          ? "border-accent shadow-[inset_0_0_0_1px_var(--color-accent-dim)]"
          : "border-border hover:border-border-strong hover:bg-bg-card-hover";
        const tappableClasses = meIsTappable
          ? "cursor-pointer hover:border-accent-strong hover:bg-bg-card-hover active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          : "";

        return (
          <li
            key={player._id}
            className={`${baseClasses} ${meClasses} ${tappableClasses}`}
            onClick={meIsTappable ? onMeClick : undefined}
            role={meIsTappable ? "button" : undefined}
            tabIndex={meIsTappable ? 0 : undefined}
            onKeyDown={
              meIsTappable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onMeClick();
                    }
                  }
                : undefined
            }
          >
            <span className="flex w-6 items-center justify-center text-lg text-role-pirate shrink-0">
              {isCrewmate && <GiPirateFlag title="Pirate crewmate" />}
            </span>

            {player.avatar && (
              <img
                src={player.avatar}
                alt=""
                className="w-8 h-8 rounded-full border border-border"
              />
            )}

            <span className="flex-1 text-fg truncate">
              {player.username}
              {isMe && " (you)"}
              {meIsTappable && meActionHint && (
                <span className="ml-1.5 text-accent text-xs uppercase tracking-[0.094rem]">
                  · {meActionHint}
                </span>
              )}
            </span>

            <span className="flex items-center gap-2 text-base text-accent">
              {player.hasBeenExamined && (
                <FaSearch
                  className="text-fg-dim text-sm"
                  title="Examined — cannot be converted"
                />
              )}
              {isCaptain && <FaCrown title="Captain" />}
              {isLieutenant && <FaUserTie title="Lieutenant" />}
              {isNavigator && <FaCompass title="Navigator" />}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
