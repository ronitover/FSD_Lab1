import { LockKeyhole, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';
import * as m from 'motion/react-m';
import { AnimatePresence, useMotionTemplate, useMotionValue } from 'motion/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import heroImage from '../../assets/hero.png';
import { LazyMascot } from '../mascot/LazyMascot.tsx';
import { AuthMascotContext, type AuthMascotApi, type ScreenPoint } from './authMascot.ts';
import { LogoMark } from './Logo.tsx';

const POINTS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Sparkles,
    title: 'Free for everyone',
    text: 'Listing and claiming food costs nothing, for donors and for NGOs.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified NGOs only',
    text: 'An admin checks every organisation before it can see or claim food.',
  },
  {
    icon: LockKeyhole,
    title: 'Your number stays private',
    text: 'Phone numbers are shared only between a donor and the NGO that claimed.',
  },
];

interface MascotState {
  lookAt: ScreenPoint | null;
  typingPassword: boolean;
  revealed: boolean;
}

/**
 * The layout for sign-in, sign-up and password screens: the form beside a brand panel. The
 * mascot watches the text cursor as people type, shuts its eyes for passwords (the chef peeks
 * if the password is shown), and frowns at errors. On phones the panel shrinks to a banner.
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  error,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** The form's current error, if any. The mascot reacts to it. */
  error?: string | null;
}) {
  const [mascot, setMascot] = useState<MascotState>({
    lookAt: null,
    typingPassword: false,
    revealed: false,
  });

  const api = useMemo<AuthMascotApi>(
    () => ({
      lookAt: (point) => setMascot((current) => ({ ...current, lookAt: point })),
      secret: (typing, revealed = false) =>
        setMascot((current) => ({ ...current, typingPassword: typing, revealed })),
    }),
    [],
  );

  const mascotProps = {
    eyesClosed: mascot.typingPassword,
    peek: mascot.typingPassword && mascot.revealed,
    lookAt: mascot.lookAt,
    mood: error ? ('sad' as const) : ('happy' as const),
  };

  return (
    <AuthMascotContext value={api}>
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:py-12">
        <BrandPanel mascot={mascotProps} />

        <div className="flex flex-col justify-center lg:py-6">
          {/* A slowly shifting gradient border around the form */}
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="mx-auto w-full max-w-lg rounded-[1.6rem] bg-[linear-gradient(120deg,#e8894f,#a7b9a0,#496a4c,#e8894f)] bg-[length:300%_300%] p-[1.5px] shadow-lift motion-safe:animate-gradient-pan"
          >
            <div className="rounded-[1.5rem] bg-surface p-6 sm:p-8">
              <AnimatePresence mode="wait" initial={false}>
                <m.h1
                  key={title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-display text-3xl tracking-tight text-forest sm:text-4xl"
                >
                  {title}
                </m.h1>
              </AnimatePresence>
              {subtitle && <p className="mt-2 text-sm leading-6 text-forest/65">{subtitle}</p>}
              <div className="mt-6">{children}</div>
            </div>
          </m.div>
          {footer && <div className="mt-6 text-center text-sm text-forest/70">{footer}</div>}
        </div>
      </div>
    </AuthMascotContext>
  );
}

type MascotProps = {
  eyesClosed: boolean;
  peek: boolean;
  lookAt: ScreenPoint | null;
  mood: 'happy' | 'sad';
};

function BrandPanel({ mascot }: { mascot: MascotProps }) {
  // A soft glow that follows the pointer across the panel.
  const glowX = useMotionValue(-400);
  const glowY = useMotionValue(-400);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${glowX}px ${glowY}px, rgba(232, 137, 79, 0.28), transparent 70%)`;

  return (
    <aside
      aria-hidden="true"
      className="relative isolate overflow-hidden rounded-[2rem] bg-[#173b2a] text-[#f7f5ef] lg:sticky lg:top-24 lg:self-start"
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        glowX.set(event.clientX - box.left);
        glowY.set(event.clientY - box.top);
      }}
      onPointerLeave={() => {
        glowX.set(-400);
        glowY.set(-400);
      }}
    >
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover opacity-25 mix-blend-luminosity"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#173b2a] via-[#173b2a]/85 to-[#173b2a]/50" />
      <m.div className="pointer-events-none absolute inset-0 -z-10" style={{ background: glow }} />
      <div className="absolute -top-16 -right-16 -z-10 size-64 rounded-full bg-[#e8894f]/25 blur-3xl motion-safe:animate-blob" />

      {/* Phones: a short banner. */}
      <div className="flex items-center gap-4 p-4 lg:hidden">
        <LazyMascot className="w-28 shrink-0" {...mascot} />
        <p className="font-display text-xl leading-snug">
          Good food deserves <em className="text-[#e8894f]">another plate.</em>
        </p>
      </div>

      {/* Larger screens: the full panel. */}
      {/* Sticky and sized to the screen, so it stays whole beside a long form. */}
      <div className="hidden h-[min(44rem,calc(100dvh-8rem))] min-h-[34rem] flex-col justify-between gap-6 p-10 lg:flex">
        <LogoMark tone="light" className="size-12" />

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-x-6 top-4 bottom-0 rounded-full bg-[#a7b9a0]/15 blur-2xl" />
          <LazyMascot className="relative w-full drop-shadow-2xl" {...mascot} />
        </div>

        <div>
          <p className="font-display text-4xl leading-tight tracking-tight xl:text-[2.6rem]">
            Good food deserves <em className="text-[#e8894f]">another plate.</em>
          </p>
          <PointsCarousel />
        </div>
      </div>
    </aside>
  );
}

/** The reasons to trust RePlate, one at a time, with dots showing which is up. */
function PointsCarousel() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % POINTS.length), 4000);
    return () => clearInterval(timer);
  }, []);
  const point = POINTS[index]!;

  return (
    <div className="mt-6">
      <div className="relative h-[5.5rem] overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={index}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center gap-4 px-5"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e8894f] text-white">
              <point.icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold">{point.title}</p>
              <p className="text-sm text-[#f7f5ef]/70">{point.text}</p>
            </div>
          </m.div>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex gap-1.5">
        {POINTS.map((item, dot) => (
          <button
            key={item.title}
            type="button"
            tabIndex={-1}
            onClick={() => setIndex(dot)}
            className="relative h-1.5 w-6 overflow-hidden rounded-full bg-white/15"
          >
            {dot === index && (
              <m.span
                layoutId="auth-points-dot"
                className="absolute inset-0 rounded-full bg-[#e8894f]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
