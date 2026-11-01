import type { ReactNode } from 'react';

/** The centred card used by sign-in, sign-up and password screens. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:py-16">
      <div className="rounded-3xl bg-surface p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-3xl tracking-tight text-forest">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-6 text-forest/65">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-6 text-center text-sm text-forest/70">{footer}</div>}
    </div>
  );
}
