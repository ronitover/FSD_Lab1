const TINTS = [
  'bg-orange/15 text-orange',
  'bg-moss/15 text-moss',
  'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300',
];

/** Up to two initials, e.g. "Annapurna Community Food Trust" gives "AC". */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}

const SIZES = {
  md: 'size-12 rounded-2xl text-base',
  lg: 'size-16 rounded-3xl text-xl',
};

/** Initials on a colour picked from the name, so the same person always gets the same colour. */
export function Avatar({ name, size = 'md' }: { name: string; size?: keyof typeof SIZES }) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    <span
      className={`flex shrink-0 items-center justify-center font-display font-semibold ${SIZES[size]} ${TINTS[hash % TINTS.length]}`}
      aria-hidden="true"
    >
      {initials(name) || '?'}
    </span>
  );
}
