import type { ReactNode } from 'react';
import { Button } from './Button.tsx';

export function Spinner({ className = 'size-6', label }: { className?: string; label?: string }) {
  return (
    <svg
      className={`animate-spin motion-reduce:animate-none ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function FullPageSpinner() {
  return (
    <div className="grid min-h-[60dvh] place-items-center text-moss">
      <Spinner className="size-8" label="Loading" />
    </div>
  );
}

export function FullPageError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto grid min-h-[60dvh] max-w-md place-content-center gap-4 px-4 text-center">
      <h1 className="font-display text-2xl text-forest">Something went wrong</h1>
      <p className="text-sm text-forest/70">{message}</p>
      {onRetry && (
        <Button className="justify-self-center" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

type AlertTone = 'error' | 'info' | 'success';

const TONES: Record<AlertTone, string> = {
  error: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-moss/30 bg-moss/10 text-forest',
  success: 'border-moss/40 bg-moss/15 text-forest',
};

/** An inline message, e.g. a form-level error. Errors are announced to screen readers. */
export function Alert({ tone = 'error', children }: { tone?: AlertTone; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border px-4 py-3 text-sm ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-forest/20 px-6 py-12 text-center">
      <h2 className="font-display text-xl text-forest">{title}</h2>
      {children && <p className="mx-auto mt-2 max-w-sm text-sm text-forest/65">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
