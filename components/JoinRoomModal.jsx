"use client";
import { useEffect, useRef, useState } from "react";

export default function JoinRoomModal({ roomName, onCancel, onConfirm }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!password || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-bg-modal/95 backdrop-blur-sm p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <form
        className="w-full max-w-sm flex flex-col gap-4 rounded-xl border border-border-strong bg-bg-card p-6 animate-scale-in"
        style={{ boxShadow: "var(--shadow-modal)" }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h3 className="m-0 text-base text-accent uppercase tracking-[0.094rem]">
          Join “{roomName}”
        </h3>
        <p className="m-0 text-fg-dim leading-relaxed">
          This room is locked — enter the password to come aboard.
        </p>
        <input
          ref={inputRef}
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="input-field"
        />
        <div className="flex gap-3">
          <button type="button" className="btn flex-1" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-alt flex-1"
            disabled={!password || submitting}
          >
            {submitting ? "Joining…" : "Join"}
          </button>
        </div>
      </form>
    </div>
  );
}
