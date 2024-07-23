import { MdDeleteOutline } from "react-icons/md";

export default function GameRoomList({ gameRooms, joinRoom, deleteRoom, user }) {
  console.log(gameRooms);
  return (
    <ul className="game-room-list">
      {gameRooms.length > 0 ? (
        gameRooms.map(({ _id, name, players, gameAdmin, gameStarted }) => (
          <li key={_id} className="game-room-list-item">
            <h3>{name}</h3>{" "}
            <span>
              ({players.length}/11){" "}
              {user?.id === gameAdmin && (
                <MdDeleteOutline className="btn-delete" onClick={() => deleteRoom(_id)} size={28} />
              )}
              <button onClick={() => joinRoom(_id)} className="btn" disabled={gameStarted}>
                {gameStarted ? "Started" : "Join"}
              </button>
            </span>
          </li>
        ))
      ) : (
        <h3>No Active games available</h3>
      )}
    </ul>
  );
}
