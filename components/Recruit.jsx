import { useUser } from "@clerk/nextjs";

export default function Recruit({ currentPlayer, players, eventValue, choosePlayerToRecruit }) {
  const { user } = useUser();
  return (
    <>
      <h3>{eventValue} event has start</h3>
      <p>Cult Leader pick a player to join your team</p>
      <ul>
        {currentPlayer.role === "cult leader" &&
          players.length > 0 &&
          players
            .filter((player) => user.id !== player.id)
            .map(({ id, avatar, username }) => (
              <li key={id} onClick={() => choosePlayerToRecruit(id)}>
                <img src={avatar} alt="" className="avatar" />
                {username}
              </li>
            ))}
      </ul>
    </>
  );
}
