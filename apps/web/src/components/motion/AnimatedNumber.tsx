import * as m from 'motion/react-m';
import { useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

/** A number that counts up to its value, and glides when the value changes. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const shown = useTransform(spring, (current) => Math.round(current).toLocaleString('en-IN'));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <m.span className={className} aria-label={String(value)}>
      {shown}
    </m.span>
  );
}
