import { MdDeleteOutline } from "react-icons/md";

export default function GameRoomList({ gameRooms, joinRoom, deleteRoom, user }) {
  return (
    <ul className="game-room-list">
      {gameRooms.length > 0 ? (
        gameRooms.map(({ _id, name, players, gameAdmin, gameStarted }) => (
          <li key={_id} className="game-room-list-item">
            <h3>{name}</h3>{" "}
            <span>
              
              {user?.id === gameAdmin && (
                <MdDeleteOutline className="btn-delete" onClick={() => deleteRoom(_id)} size={32} />
              )}
              <button onClick={() => joinRoom(_id)} className="btn join-btn">
              Join <span>({players.length}/11)</span>
              </button>
              {/* <button onClick={() => joinRoom(_id)} className="btn" disabled={gameStarted}>
                {gameStarted ? "Started" : "Join"}
              </button> */}
            </span>
          </li>
        ))
      ) : (
        <h3>No Active games available</h3>
      )}
    </ul>
  );
}
