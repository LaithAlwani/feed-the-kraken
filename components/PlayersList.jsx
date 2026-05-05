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
}) {
  if (!players || players.length === 0) return null;

  const fellowPirateIds = new Set((fellowPirates ?? []).map((p) => p.userId));

  return (
    <ul className="players-list">
      {players.map((player) => {
        const isMe = player.userId === myUserId;
        const isCaptain = player.userId === captainId;
        const isLieutenant = player.userId === lieutenantId;
        const isNavigator = player.userId === navigatorId;
        const isCrewmate = myRole === "pirate" && fellowPirateIds.has(player.userId);

        return (
          <li key={player._id} className={isMe ? "me" : undefined}>
            <span className="player-marker">
              {isCrewmate && (
                <GiPirateFlag title="Pirate crewmate" />
              )}
            </span>
            {player.avatar && (
              <img src={player.avatar} alt="" className="avatar" />
            )}
            <span className="player-name">
              {player.username}
              {isMe && " (you)"}
            </span>
            <span className="player-badges">
              {player.hasBeenExamined && (
                <FaSearch
                  className="badge-examined"
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
