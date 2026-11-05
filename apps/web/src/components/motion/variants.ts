import type { Transition, Variants } from 'motion/react';

/** A soft spring used for most entrances. */
export const softSpring: Transition = { type: 'spring', stiffness: 220, damping: 26, mass: 0.8 };

/** For a parent whose children should arrive one after another. */
export const staggerParent = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Children of `staggerParent`: rise and fade in. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: softSpring },
};

/** Children of `staggerParent`: pop in from slightly smaller. */
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  shown: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 18 } },
};

/** Props for sections that animate in once, when scrolled into view. */
export const inView = {
  initial: 'hidden',
  whileInView: 'shown',
  viewport: { once: true, amount: 0.2 },
} as const;

/** The spring the sliding highlights (nav, tabs) move with. */
export const pillSpring: Transition = { type: 'spring', bounce: 0.2, duration: 0.45 };
