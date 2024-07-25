export default function PlayersList({ players, currentPlayer }) {
  return (
    <ul>
      {players &&
        players.length > 0 &&
        players.map((player) => (
          <li key={player.id}>
            <img src={player.avatar} alt="" className="avatar" />
            <span>
              {player.username}
              {currentPlayer?.id === player.id && player.role != "pirate"
                ? ` (${currentPlayer.role})`
                : ""}
              {currentPlayer?.role === "pirate" && player.role === "pirate"
                ? ` (${player.role})`
                : ""}
            </span>
          </li>
        ))}
    </ul>
  );
}
