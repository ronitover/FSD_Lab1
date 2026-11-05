import { useEffect, useRef, useState } from 'react';

/** How far the pupils can move from the middle of each eye, in drawing units. */
const MAX_LOOK = 4.5;

const FOREST = '#173b2a';
const ORANGE = '#e8894f';

/**
 * RePlate's mascot: a plate wearing the logo's serving dome as a cap. Its eyes follow the pointer
 * (or the last tap on a phone), it blinks now and then, and it shuts its eyes while `eyesClosed`
 * is set, e.g. while someone types a password. Purely decorative.
 */
export function Mascot({
  className = 'size-32',
  eyesClosed = false,
}: {
  className?: string;
  eyesClosed?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);

  // Follow the pointer anywhere on the page. One update per frame is plenty.
  useEffect(() => {
    let frame = 0;
    function follow(event: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        // The eyes sit a little above the middle of the drawing.
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height * 0.46);
        const distance = Math.hypot(dx, dy) || 1;
        // Close to the mascot the eyes move less, so it doesn't look cross-eyed.
        const reach = Math.min(1, distance / 120) * MAX_LOOK;
        setLook({ x: (dx / distance) * reach, y: (dy / distance) * reach });
      });
    }
    window.addEventListener('pointermove', follow);
    window.addEventListener('pointerdown', follow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', follow);
      window.removeEventListener('pointerdown', follow);
    };
  }, []);

  // Blink every few seconds, unless the device asks for less motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      timer = setTimeout(
        () => {
          setBlinking(true);
          timer = setTimeout(() => {
            setBlinking(false);
            schedule();
          }, 140);
        },
        2500 + Math.random() * 3000,
      );
    }
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const shut = eyesClosed || blinking;

  return (
    <svg ref={ref} viewBox="0 0 120 124" className={className} aria-hidden="true">
      {/* Shadow */}
      <ellipse cx="60" cy="118" rx="34" ry="4.5" fill="#000" opacity="0.12" />

      {/* Cap: the serving dome from the logo */}
      <path d="M44 24a16 16 0 0 1 32 0z" fill={ORANGE} />
      <rect x="40" y="22" width="40" height="5" rx="2.5" fill={ORANGE} />
      <circle cx="60" cy="7" r="3.5" fill={ORANGE} />
      <path
        d="M51 16a10 10 0 0 1 6-5"
        stroke="#fff"
        strokeOpacity="0.6"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Plate */}
      <circle cx="60" cy="68" r="44" fill="#f7f5ef" stroke={FOREST} strokeWidth="5" />
      <circle cx="60" cy="68" r="33" fill="#fffdf8" stroke="#e7e1d4" strokeWidth="2" />

      {/* Cheeks: brighter while the eyes are shut, as if a little shy */}
      <g fill={ORANGE} opacity={eyesClosed ? 0.6 : 0.35} style={{ transition: 'opacity 200ms' }}>
        <ellipse cx="36" cy="80" rx="6" ry="4" />
        <ellipse cx="84" cy="80" rx="6" ry="4" />
      </g>

      {/* Eyes */}
      {shut ? (
        <g stroke={FOREST} strokeWidth="3" strokeLinecap="round" fill="none">
          {eyesClosed ? (
            // Happy closed eyes
            <>
              <path d="M38 64q7-7 14 0" />
              <path d="M68 64q7-7 14 0" />
            </>
          ) : (
            // A quick blink
            <>
              <path d="M37 63h16" />
              <path d="M67 63h16" />
            </>
          )}
        </g>
      ) : (
        <g>
          {[45, 75].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="62" r="10.5" fill="#fff" stroke={FOREST} strokeWidth="2.5" />
              <g
                style={{
                  transform: `translate(${look.x}px, ${look.y}px)`,
                  transition: 'transform 90ms ease-out',
                }}
              >
                <circle cx={cx} cy="62" r="5.2" fill={FOREST} />
                <circle cx={cx + 1.8} cy="60" r="1.6" fill="#fff" />
              </g>
            </g>
          ))}
        </g>
      )}

      {/* Smile: a little "o" while the eyes are shut */}
      {eyesClosed ? (
        <ellipse cx="60" cy="84" rx="3.5" ry="3" fill={FOREST} />
      ) : (
        <path
          d="M51 81q9 8 18 0"
          stroke={FOREST}
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}
