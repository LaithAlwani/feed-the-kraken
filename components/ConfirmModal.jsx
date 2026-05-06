"use client";

export default function ConfirmModal({
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-bg-modal/95 backdrop-blur-sm p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm flex flex-col gap-4 rounded-xl border border-border-strong bg-bg-card p-6 shadow-modal animate-scale-in"
        style={{ boxShadow: "var(--shadow-modal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="m-0 text-base text-accent uppercase tracking-[0.094rem]">
          {title}
        </h3>
        {body && (
          <div className="text-fg-dim leading-relaxed [&_strong]:text-fg [&_p]:m-0">
            {body}
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" className="btn flex-1" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`flex-1 ${danger ? "btn btn-danger" : "btn btn-alt"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
