// The lightweight `m` component is enough: these only bind springs to styles, with no animate or
// gesture props, so the full `motion` component (and its much larger bundle) isn't needed.
import * as m from 'motion/react-m';
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/** The drawing's size in its own units. Pointer positions are converted into these. */
const WIDTH = 280;
const HEIGHT = 200;

// Only RePlate's own colours, with forest outlines like the app's other illustrations.
const INK = '#2b1d14';
const OUTLINE = '#173b2a';
const FOREST = '#496a4c';
const ORANGE = '#e8894f';
const SAGE = '#a7b9a0';
const SAGE_LIGHT = '#d3ddcf';
const COAT = '#fbf7ee';
const COUNTER = '#f3ead8';
const COUNTER_TOP = '#fffaf0';

const SPRING = { stiffness: 260, damping: 22, mass: 0.6 };

/**
 * RePlate's mascots: a chef handing a tiffin to an NGO volunteer, the whole idea of the app in
 * one picture. Both follow the pointer (or the last tap on a phone) with their eyes and a slight
 * head tilt, blink now and then, and shut their eyes while `eyesClosed` is set, e.g. while someone
 * types a password. With no pointer yet they look at each other. Purely decorative.
 */
export function Mascot({
  className = 'w-64',
  eyesClosed = false,
  peek = false,
  lookAt = null,
  mood = 'happy',
}: {
  className?: string;
  eyesClosed?: boolean;
  /** With eyes closed, the chef sneaks a look with one eye (e.g. when a password is shown). */
  peek?: boolean;
  /** A point on screen to look at instead of the pointer, e.g. the text cursor while typing. */
  lookAt?: { x: number; y: number } | null;
  /** "sad" frowns and shakes heads, e.g. after a wrong password. */
  mood?: 'happy' | 'sad';
}) {
  const ref = useRef<SVGSVGElement>(null);
  // Where the pointer is, in the drawing's units. Starts between the two, so they face each other.
  const pointerX = useMotionValue(WIDTH / 2);
  const pointerY = useMotionValue(90);
  // While looking at something specific, pointer movement is ignored.
  const focused = useRef(false);

  useEffect(() => {
    function aimAtScreen(clientX: number, clientY: number) {
      const box = ref.current?.getBoundingClientRect();
      if (!box || box.width === 0) return;
      pointerX.set(((clientX - box.left) / box.width) * WIDTH);
      pointerY.set(((clientY - box.top) / box.height) * HEIGHT);
    }
    focused.current = lookAt !== null;
    if (lookAt) aimAtScreen(lookAt.x, lookAt.y);

    function follow(event: PointerEvent) {
      if (!focused.current) aimAtScreen(event.clientX, event.clientY);
    }
    window.addEventListener('pointermove', follow);
    window.addEventListener('pointerdown', follow);
    return () => {
      window.removeEventListener('pointermove', follow);
      window.removeEventListener('pointerdown', follow);
    };
  }, [pointerX, pointerY, lookAt]);

  return (
    <svg ref={ref} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={className} aria-hidden="true">
      <Chef
        pointerX={pointerX}
        pointerY={pointerY}
        eyesClosed={eyesClosed}
        peek={peek}
        sad={mood === 'sad'}
      />
      <Volunteer
        pointerX={pointerX}
        pointerY={pointerY}
        eyesClosed={eyesClosed}
        peek={false}
        sad={mood === 'sad'}
      />
      {/* The tiffin sits over the arms and under the hands, so both are holding it. */}
      <Tiffin />
      <circle cx="126" cy="152" r="6.5" fill="#c68642" stroke={OUTLINE} strokeWidth="1.8" />
      <circle cx="158" cy="152" r="6.5" fill="#a46a3c" stroke={OUTLINE} strokeWidth="1.8" />
      {/* A serving counter in front, so the two stand behind something instead of floating. */}
      <path
        d="M14 199v-14a7 7 0 0 1 7-7h238a7 7 0 0 1 7 7v14z"
        fill={COUNTER}
        stroke={OUTLINE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M15 186a6 6 0 0 1 6-6h238a6 6 0 0 1 6 6z" fill={COUNTER_TOP} />
      <path d="M40 192h44M196 192h44" stroke={SAGE} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="140" cy="191" r="2.5" fill={ORANGE} />
    </svg>
  );
}

interface Follow {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  eyesClosed: boolean;
  peek: boolean;
  sad: boolean;
}

/** Direction from a head at (x, y) to the pointer, and how far to look (0 to 1). */
function aimAt(px: number, py: number, x: number, y: number) {
  const dx = px - x;
  const dy = py - y;
  const distance = Math.hypot(dx, dy) || 1;
  // Close to the face the eyes move less, so nobody goes cross-eyed.
  return { ux: dx / distance, uy: dy / distance, reach: Math.min(1, distance / 90) };
}

/** Turns the pointer into springy pupil offsets and a head tilt for a head centred at (x, y). */
function useLook(
  pointerX: MotionValue<number>,
  pointerY: MotionValue<number>,
  x: number,
  y: number,
) {
  const still = useReducedMotion() ?? false;
  const point = [pointerX, pointerY];
  const pupilX = useSpring(
    useTransform(point, ([px, py]: number[]) => {
      const { ux, reach } = aimAt(px!, py!, x, y);
      return ux * reach * 3.2;
    }),
    SPRING,
  );
  const pupilY = useSpring(
    useTransform(point, ([px, py]: number[]) => {
      const { uy, reach } = aimAt(px!, py!, x, y);
      return uy * reach * 2.6;
    }),
    SPRING,
  );
  const tilt = useSpring(
    useTransform(point, ([px, py]: number[]) => {
      const { ux, uy, reach } = aimAt(px!, py!, x, y);
      return still ? 0 : (ux * 7 + uy * ux * 2) * reach;
    }),
    SPRING,
  );
  const shiftX = useSpring(
    useTransform(point, ([px, py]: number[]) => {
      const { ux, reach } = aimAt(px!, py!, x, y);
      return still ? 0 : ux * reach * 2;
    }),
    SPRING,
  );
  return { pupilX, pupilY, tilt, shiftX };
}

/** Blinks every few seconds, each character on its own rhythm. Off for reduced motion. */
function useBlink(offset: number) {
  const reduce = useReducedMotion();
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    if (reduce) return;
    let timer: ReturnType<typeof setTimeout>;
    function schedule(first = false) {
      timer = setTimeout(
        () => {
          setBlinking(true);
          timer = setTimeout(() => {
            setBlinking(false);
            schedule();
          }, 140);
        },
        (first ? offset : 0) + 2400 + Math.random() * 3200,
      );
    }
    schedule(true);
    return () => clearTimeout(timer);
  }, [offset, reduce]);
  return blinking;
}

/** Two eyes with pupils that follow, or closed arcs. */
function Eyes({
  left,
  right,
  y,
  look,
  closed,
  blinking,
  peek = false,
}: {
  left: number;
  right: number;
  y: number;
  look: ReturnType<typeof useLook>;
  closed: boolean;
  blinking: boolean;
  /** Keep the left eye open while the right stays shut: a sneaky peek. */
  peek?: boolean;
}) {
  if ((closed && !peek) || blinking) {
    return (
      <g stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none">
        {[left, right].map((cx) =>
          closed ? (
            <path key={cx} d={`M${cx - 5.5} ${y + 1}q5.5-5 11 0`} />
          ) : (
            <path key={cx} d={`M${cx - 5.5} ${y}h11`} />
          ),
        )}
      </g>
    );
  }
  const open = peek ? [left] : [left, right];
  return (
    <g>
      {peek && (
        <path
          d={`M${right - 5.5} ${y + 1}q5.5-5 11 0`}
          stroke={INK}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {open.map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={y} rx="6" ry="6.6" fill="#fff" />
          <m.g style={{ x: look.pupilX, y: look.pupilY }}>
            <circle cx={cx} cy={y + 0.5} r="3.3" fill={INK} />
            <circle cx={cx + 1.2} cy={y - 0.8} r="1.1" fill="#fff" />
          </m.g>
        </g>
      ))}
    </g>
  );
}

/** A head that tilts towards the pointer, pivoting at the chin. */
function Head({
  look,
  sad = false,
  children,
}: {
  look: ReturnType<typeof useLook>;
  /** Shakes the head once, like saying "no", whenever this turns on. */
  sad?: boolean;
  children: ReactNode;
}) {
  return (
    <m.g
      animate={sad ? { rotate: [0, -9, 9, -6, 6, 0] } : { rotate: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{ originX: 0.5, originY: 0.92 }}
    >
      <m.g style={{ rotate: look.tilt, x: look.shiftX, originX: 0.5, originY: 0.92 }}>
        {children}
      </m.g>
    </m.g>
  );
}

function Chef({ pointerX, pointerY, eyesClosed, peek, sad }: Follow) {
  const look = useLook(pointerX, pointerY, 80, 80);
  const blinking = useBlink(0);
  const skin = '#c68642';

  return (
    <g>
      {/* Coat */}
      <path d="M42 200v-56a38 32 0 0 1 76 0v56z" fill={COAT} stroke={OUTLINE} strokeWidth="2" />
      <path d="M80 112v88" stroke={OUTLINE} strokeWidth="2" />
      <g fill={OUTLINE}>
        <circle cx="70" cy="140" r="2.4" />
        <circle cx="70" cy="158" r="2.4" />
        <circle cx="70" cy="176" r="2.4" />
        <circle cx="90" cy="140" r="2.4" />
        <circle cx="90" cy="158" r="2.4" />
        <circle cx="90" cy="176" r="2.4" />
      </g>
      {/* Arm reaching to the tiffin */}
      <path
        d="M108 124q14 10 18 28"
        stroke={OUTLINE}
        strokeWidth="17"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M108 124q14 10 18 28"
        stroke={COAT}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      {/* Neck and neckerchief */}
      <rect x="72" y="98" width="16" height="14" rx="4" fill={skin} />
      <path d="M66 110l14 16 14-16z" fill={ORANGE} />

      <Head look={look} sad={sad}>
        <circle cx="56" cy="82" r="5" fill={skin} stroke={OUTLINE} strokeWidth="2" />
        <circle cx="104" cy="82" r="5" fill={skin} stroke={OUTLINE} strokeWidth="2" />
        <circle cx="80" cy="80" r="24" fill={skin} stroke={OUTLINE} strokeWidth="2" />
        {/* Hair below the cap */}
        <path d="M57 74q1-14 10-18h26q9 4 10 18q-6-9-23-9t-23 9z" fill={INK} />
        {/* Chef's cap */}
        <g fill={COAT} stroke={OUTLINE} strokeWidth="2">
          <circle cx="65" cy="40" r="12" />
          <circle cx="95" cy="40" r="12" />
          <circle cx="80" cy="33" r="14" />
          <rect x="60" y="44" width="40" height="15" rx="4" />
        </g>
        <path d="M63 52h34" stroke={OUTLINE} strokeWidth="1.5" />
        <path
          d="M66 69q6-3.5 12 0M82 69q6-3.5 12 0"
          stroke={INK}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <Eyes
          left={72}
          right={88}
          y={79}
          look={look}
          closed={eyesClosed}
          blinking={blinking}
          peek={peek}
        />
        <g fill={ORANGE} opacity={eyesClosed ? 0.55 : 0.3}>
          <ellipse cx="63" cy="90" rx="5" ry="3.2" />
          <ellipse cx="97" cy="90" rx="5" ry="3.2" />
        </g>
        {/* Moustache and smile */}
        <path d="M69 92q5.5-5.5 11-1q5.5-4.5 11 1q-5.5 3.5-11 1q-5.5 2.5-11-1z" fill={INK} />
        {eyesClosed ? (
          <ellipse cx="80" cy="98" rx="2.6" ry="2.2" fill={INK} />
        ) : (
          <path
            d={sad ? 'M74 100q6-5 12 0' : 'M74 97q6 5 12 0'}
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Head>
    </g>
  );
}

function Volunteer({ pointerX, pointerY, eyesClosed, sad }: Follow) {
  const look = useLook(pointerX, pointerY, 200, 84);
  const blinking = useBlink(1300);
  const skin = '#a46a3c';

  return (
    <g>
      {/* Braid over her shoulder, behind the arm */}
      <g fill={INK}>
        {[108, 119, 130, 141].map((y, index) => (
          <ellipse key={y} cx={223 + index * 0.8} cy={y} rx="6" ry="6.5" />
        ))}
      </g>
      <circle cx="226" cy="150" r="3" fill={ORANGE} />
      {/* Kurta and apron */}
      <path d="M162 200v-56a38 32 0 0 1 76 0v56z" fill={ORANGE} stroke={OUTLINE} strokeWidth="2" />
      <path d="M180 200v-48h40v48z" fill={FOREST} />
      <path d="M181 153l7-40M219 153l-7-40" stroke={FOREST} strokeWidth="4" strokeLinecap="round" />
      {/* The RePlate mark on the apron */}
      <path
        d="M205 168.5a7 7 0 1 1-10 0"
        stroke="#f7f5ef"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="200" cy="174" r="2.6" fill={ORANGE} />
      {/* Arm reaching to the tiffin */}
      <path
        d="M172 126q-12 10-14 26"
        stroke={OUTLINE}
        strokeWidth="17"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M172 126q-12 10-14 26"
        stroke={ORANGE}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="192" y="102" width="16" height="14" rx="4" fill={skin} />

      <Head look={look} sad={sad}>
        {/* Hair behind the face */}
        <circle cx="200" cy="80" r="27" fill={INK} />
        <circle cx="178" cy="88" r="4" fill={skin} stroke={OUTLINE} strokeWidth="2" />
        <circle cx="222" cy="88" r="4" fill={skin} stroke={OUTLINE} strokeWidth="2" />
        <circle cx="178" cy="95" r="1.9" fill="#e0b04a" />
        <circle cx="222" cy="95" r="1.9" fill="#e0b04a" />
        <circle cx="200" cy="85" r="22.5" fill={skin} stroke={OUTLINE} strokeWidth="2" />
        {/* Fringe, parted in the middle */}
        <path d="M177 82a23 23 0 0 1 46 0q-8-14-23-13q-15-1-23 13z" fill={INK} />
        <path
          d="M187 75q6-3.5 11 0M202 75q6-3.5 11 0"
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <Eyes left={192} right={208} y={85} look={look} closed={eyesClosed} blinking={blinking} />
        <g fill={ORANGE} opacity={eyesClosed ? 0.55 : 0.3}>
          <ellipse cx="184" cy="95" rx="4.6" ry="3" />
          <ellipse cx="216" cy="95" rx="4.6" ry="3" />
        </g>
        {eyesClosed ? (
          <ellipse cx="200" cy="99" rx="2.4" ry="2" fill={INK} />
        ) : (
          <path
            d={sad ? 'M193 101q7-5 14 0' : 'M193 97q7 6 14 0'}
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Head>
    </g>
  );
}

/** The steel tiffin being handed over. */
function Tiffin() {
  return (
    <g>
      <path
        d="M134 134v-7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v7"
        stroke={FOREST}
        strokeWidth="3"
        fill="none"
      />
      {[134, 146, 158].map((y) => (
        <g key={y}>
          <rect
            x="126"
            y={y}
            width="32"
            height="11"
            rx="3"
            fill={SAGE}
            stroke={OUTLINE}
            strokeWidth="1.5"
          />
          <rect x="126" y={y} width="32" height="2.5" rx="1.25" fill={SAGE_LIGHT} />
        </g>
      ))}
      <rect x="124" y="132" width="3" height="38" rx="1.5" fill={FOREST} />
      <rect x="157" y="132" width="3" height="38" rx="1.5" fill={FOREST} />
    </g>
  );
}
