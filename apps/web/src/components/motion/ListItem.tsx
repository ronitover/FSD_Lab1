import * as m from 'motion/react-m';
import type { ReactNode } from 'react';
import { softSpring } from './variants.ts';

/**
 * One item in an animated list: it rises in (a little later the further down it is), slides to
 * its new place when the list reorders, and shrinks away when it leaves. Use inside
 * <AnimatePresence mode="popLayout">.
 */
export function ListItem({
  index,
  children,
  className = 'grid',
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ ...softSpring, delay: Math.min(index, 8) * 0.04, layout: softSpring }}
      className={className}
    >
      {children}
    </m.div>
  );
}
