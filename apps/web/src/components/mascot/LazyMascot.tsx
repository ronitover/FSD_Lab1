import { lazy, Suspense, type ComponentProps } from 'react';
import type { Mascot as MascotType } from './Mascot.tsx';

// The mascot and its animation library load after the page has drawn, so they never slow the
// first screen down on a slow mobile connection.
const Mascot = lazy(async () => ({ default: (await import('./Mascot.tsx')).Mascot }));

/** The mascot, loaded on demand. Holds its space while loading, so the layout doesn't jump. */
export function LazyMascot(props: ComponentProps<typeof MascotType>) {
  return (
    <Suspense
      fallback={
        <div className={props.className} style={{ aspectRatio: '280 / 200' }} aria-hidden="true" />
      }
    >
      <Mascot {...props} />
    </Suspense>
  );
}
