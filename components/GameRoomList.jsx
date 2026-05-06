import { MdDeleteOutline } from "react-icons/md";

export default function GameRoomList({ gameRooms, joinRoom, deleteRoom, user }) {
  if (!gameRooms || gameRooms.length === 0) {
    return <h3 className="text-fg-dim text-center">No active games</h3>;
  }

  return (
    <ul className="w-full max-w-2xl mx-auto flex flex-col gap-2 py-2">
      {gameRooms.map(({ _id, name, playerCount, gameAdmin, gameStarted }) => (
        <li
          key={_id}
          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors duration-150 hover:border-border-strong hover:bg-bg-card-hover animate-fade-up"
        >
          <h3 className="m-0 text-fg flex-1 truncate">{name}</h3>
          <div className="flex items-center gap-2">
            {user?.id === gameAdmin && (
              <button
                type="button"
                aria-label={`Delete ${name}`}
                onClick={() => deleteRoom(_id)}
                className="text-danger transition-transform duration-150 hover:scale-110 cursor-pointer p-1 bg-transparent border-0"
              >
                <MdDeleteOutline size={28} />
              </button>
            )}
            <button
              onClick={() => joinRoom(_id)}
              className="btn flex-col px-3 py-2 min-h-0 leading-tight"
              disabled={gameStarted}
            >
              <span>{gameStarted ? "Started" : "Join"}</span>
              <span className="text-[0.7rem] opacity-80">
                ({playerCount}/11)
              </span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
