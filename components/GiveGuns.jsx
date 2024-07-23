import React from "react";

export default function GiveGuns({ eventValue, currentPlayer, players,totalGuns, distributeGuns, gunTotal }) {
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
                    <span onClick={() => gunTotal(player, -1)}>-</span>
                    <span id={player.id}>{player.guns}</span>
                    <span onClick={() => gunTotal(player, 1)}>+</span>
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
