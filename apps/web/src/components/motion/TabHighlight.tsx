import * as m from 'motion/react-m';
import { pillSpring } from './variants.ts';

/**
 * The dark pill behind the selected tab. Tabs that share a `group` share one pill, which slides
 * from the old tab to the new one. Put it first inside a `relative` button, before the label.
 */
export function TabHighlight({ group }: { group: string }) {
  return (
    <m.span
      layoutId={group}
      className="absolute inset-0 rounded-full bg-forest"
      transition={pillSpring}
      aria-hidden="true"
    />
  );
}
