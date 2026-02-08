interface RoleToastProps {
  message: string | null;
  onDismiss?: () => void;
  offset?: number;
}

export function RoleToast({ message, onDismiss, offset = 16 }: RoleToastProps) {
  return (
    <div
      className={`pointer-events-none fixed right-4 z-50 transition-all duration-300 ${
        message ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
      style={{ top: offset }}
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-gray-900/90 px-5 py-3 text-sm font-medium text-white shadow-xl">
        <span>{message ?? ""}</span>
        {message && (
          <button
            type="button"
            className="text-xs uppercase tracking-wide text-white/70 hover:text-white"
            onClick={onDismiss}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
