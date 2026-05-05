import { MdDeleteOutline } from "react-icons/md";

export default function GameRoomList({ gameRooms, joinRoom, deleteRoom, user }) {
  if (!gameRooms || gameRooms.length === 0) {
    return <h3>No Active games available</h3>;
  }

  return (
    <ul className="game-room-list">
      {gameRooms.map(({ _id, name, playerCount, gameAdmin, gameStarted }) => (
        <li key={_id} className="game-room-list-item">
          <h3>{name}</h3>
          <span>
            {user?.id === gameAdmin && (
              <MdDeleteOutline className="btn-delete" onClick={() => deleteRoom(_id)} size={32} />
            )}
            <button
              onClick={() => joinRoom(_id)}
              className="btn join-btn"
              disabled={gameStarted}
            >
              {gameStarted ? "Started" : "Join"} <span>({playerCount}/11)</span>
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
