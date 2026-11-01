import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastApi, type ToastTone } from './toast-context.ts';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const DURATION_MS = 5000;

const TONES: Record<ToastTone, string> = {
  success: 'border-moss/40',
  info: 'border-forest/20',
  error: 'border-danger/50',
};

/** Short confirmations ("Donation saved") that disappear on their own. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show: (message, tone = 'success') => {
        const id = ++nextId.current;
        setToasts((current) => [...current.slice(-2), { id, message, tone }]);
        setTimeout(() => dismiss(id), DURATION_MS);
      },
    }),
    [dismiss],
  );

  return (
    <ToastContext value={api}>
      {children}
      {/* Always rendered so screen readers pick up new messages. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border-l-4 bg-surface px-4 py-3 text-sm text-forest shadow-soft ${TONES[toast.tone]}`}
          >
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="-m-1 rounded-full p-1 text-forest/50 hover:text-forest"
              aria-label="Dismiss"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
