import { Carrot, Croissant, CookingPot, Leaf, Milk, Package, type LucideIcon } from 'lucide-react';
import type { DietaryType, FoodCategory } from '@replate/shared';
import { CATEGORY_LABELS, DIETARY_LABELS } from '../../lib/labels.ts';

/**
 * Each category gets an icon and a colour, so lists are easy to scan and cards have
 * something to look at before donations have photos.
 */
const CATEGORY_VISUALS: Record<FoodCategory, { icon: LucideIcon; tile: string }> = {
  cooked_meal: {
    icon: CookingPot,
    tile: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
  },
  produce: {
    icon: Carrot,
    tile: 'bg-lime-100 text-lime-800 dark:bg-lime-400/15 dark:text-lime-300',
  },
  bakery: {
    icon: Croissant,
    tile: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  },
  packaged: {
    icon: Package,
    tile: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300',
  },
  dairy: {
    icon: Milk,
    tile: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300',
  },
};

const TILE_SIZES = {
  sm: 'size-10 rounded-xl [&_svg]:size-5',
  md: 'size-14 rounded-2xl [&_svg]:size-7',
  lg: 'size-16 rounded-2xl [&_svg]:size-8',
};

/** A tinted square with the category's icon. */
export function CategoryTile({
  category,
  size = 'md',
  className = '',
}: {
  category: FoodCategory;
  size?: keyof typeof TILE_SIZES;
  className?: string;
}) {
  const { icon: Icon, tile } = CATEGORY_VISUALS[category];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${tile} ${TILE_SIZES[size]} ${className}`}
      role="img"
      aria-label={CATEGORY_LABELS[category]}
    >
      <Icon strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}

/**
 * The food type mark Indian packaging uses: a green square with a dot for veg and a brown square
 * with a triangle for non-veg (FSSAI's current symbol). Vegan uses the green square with a leaf.
 */
export function FoodTypeMark({
  type,
  className = 'size-4',
}: {
  type: DietaryType;
  className?: string;
}) {
  const colour =
    type === 'non_veg'
      ? 'text-[#8b3a0e] dark:text-[#e0915c]'
      : 'text-[#138a36] dark:text-[#5fd17f]';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[3px] border-[1.5px] border-current bg-white/90 dark:bg-transparent ${colour} ${className}`}
      role="img"
      aria-label={DIETARY_LABELS[type]}
      title={DIETARY_LABELS[type]}
    >
      {type === 'veg' && <span className="size-[55%] rounded-full bg-current" />}
      {type === 'non_veg' && (
        <svg viewBox="0 0 10 10" className="size-[60%] fill-current" aria-hidden="true">
          <path d="M5 1 9.5 9h-9z" />
        </svg>
      )}
      {type === 'vegan' && <Leaf className="size-[75%]" strokeWidth={2.5} aria-hidden="true" />}
    </span>
  );
}

/** The food type mark with its label, e.g. on cards. */
export function FoodTypeLabel({ type }: { type: DietaryType }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest/75">
      <FoodTypeMark type={type} className="size-3.5" />
      <span aria-hidden="true">{DIETARY_LABELS[type]}</span>
    </span>
  );
}
