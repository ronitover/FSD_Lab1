type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-forest text-cream hover:bg-forest/90 hover:shadow-lg hover:shadow-forest/20',
  accent: 'bg-orange text-white hover:bg-orange/90 hover:shadow-lg hover:shadow-orange/30',
  secondary: 'border border-forest/25 text-forest hover:border-forest hover:bg-surface',
  ghost: 'text-forest hover:bg-forest/5',
  danger: 'bg-danger text-white hover:bg-danger/90 dark:text-cream',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm',
};

/** Button styling, shared by <Button> and links that look like buttons. */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]}`;
}

export type { ButtonSize, ButtonVariant };

export const inputClasses =
  'block w-full rounded-xl border border-forest/20 bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-forest/40 transition focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/30 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/30 disabled:opacity-60';
