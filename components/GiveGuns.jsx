import { MdAdd, MdHorizontalRule } from "react-icons/md";
export default function GiveGuns({
  eventValue,
  currentPlayer,
  players,
  totalGuns,
  distributeGuns,
  gunTotal,
}) {
  return (
    <>
      <h3>{eventValue} event has start</h3>
      <p>Cult Leader 3 guns to any player(s)</p>
      <p>Total Guns: {totalGuns}</p>
      {currentPlayer.role === "cult leader" && (
        <>
          <ul>
            {players.length > 0 &&
              players.map((player) => (
                <li key={player.id}>
                  <img src={player.avatar} alt="" className="avatar" />
                  <h3>{player.username}</h3>
                  <div className="gun-counter">
                    <MdHorizontalRule onClick={() => gunTotal(player, -1)} size={24} />
                    <span id={player.id}>{player.guns}</span>
                    <MdAdd size={24} onClick={() => gunTotal(player, 1)} />
                  </div>
                </li>
              ))}
          </ul>
          <button className="btn btn-event" onClick={distributeGuns}>
            Done
          </button>
        </>
      )}
    </>
  );
}
