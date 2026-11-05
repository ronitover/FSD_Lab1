import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
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
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <m.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border-l-4 bg-surface px-4 py-3 text-sm text-forest shadow-soft ${TONES[toast.tone]}`}
            >
              {/* Shrinks over the time the message stays up. */}
              <m.span
                className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-forest/20"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: DURATION_MS / 1000, ease: 'linear' }}
                aria-hidden="true"
              />
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
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}
