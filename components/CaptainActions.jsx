"use client";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import { api } from "@/convex/_generated/api";

export default function CaptainActionsDrawer({
  roomId,
  players,
  myUserId,
  onClose,
}) {
  const cabinSearch = useMutation(api.rituals.cabinSearch);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onSearch = async (targetUserId) => {
    try {
      await cabinSearch({ roomId, targetUserId });
      onClose();
    } catch (err) {
      toast.error(err.message ?? "Cabin Search failed");
    }
  };

  const targets = players.filter((p) => p.userId !== myUserId);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header">
          <h3>Cabin Search</h3>
          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </header>

        <p className="drawer-hint">
          Tap a player to search their bag. Their faction will be shown only to
          you. They can no longer be converted to the cult.
        </p>

        <ul className="flex-1 overflow-y-auto px-4 pb-4 m-0 flex flex-col gap-1.5">
          {targets.map((p) => (
            <li key={p.userId} className="m-0">
              <button
                type="button"
                onClick={() => onSearch(p.userId)}
                className={[
                  "w-full flex items-center gap-2 rounded-lg border px-4 py-3 min-h-12",
                  "text-fg text-left cursor-pointer",
                  "transition-[border-color,background,transform] duration-150",
                  "hover:border-accent active:scale-[0.99]",
                  p.hasBeenExamined
                    ? "bg-accent/6 border-accent-dim"
                    : "bg-bg-card border-border",
                ].join(" ")}
              >
                <span className="flex-1">
                  {p.username}
                  {p.hasBeenExamined && (
                    <span className="text-fg-faint text-sm">
                      {" "}· already searched
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <footer className="drawer-footer">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
}
