import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

const loadFeatures = () => import('./features.ts').then((module) => module.default);

/**
 * Sets up animation for the whole app. Components use the small `m` elements, and the engine
 * behind them downloads after the page has drawn. `reducedMotion="user"` turns movement off
 * everywhere when the device asks for less motion; fades still happen.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
