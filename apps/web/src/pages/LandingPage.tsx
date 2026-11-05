import {
  Apple,
  ArrowRight,
  Carrot,
  Cherry,
  Leaf,
  Salad,
  Soup,
  Wheat,
  Bike,
  Building2,
  CakeSlice,
  Check,
  ChefHat,
  Clock,
  HandHeart,
  Hotel,
  Landmark,
  ListChecks,
  LockKeyhole,
  MapPinned,
  PartyPopper,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Snowflake,
  Store,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import * as m from 'motion/react-m';
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import { HOME_BY_ROLE, useAuth } from '../auth/context.ts';
import { LazyMascot } from '../components/mascot/LazyMascot.tsx';
import { inView, pop, rise, softSpring, staggerParent } from '../components/motion/variants.ts';
import { FoodTypeMark } from '../components/ui/FoodVisuals.tsx';
import { ThaliIllustration } from '../components/illustrations/Thali.tsx';
import { buttonClasses } from '../components/ui/styles.ts';

/** Where surplus food comes from in Indian cities. Shown as a scrolling strip. */
const SOURCES: { label: string; icon: LucideIcon }[] = [
  { label: 'Wedding halls', icon: PartyPopper },
  { label: 'Hostel messes', icon: Building2 },
  { label: 'Temple & gurdwara kitchens', icon: Landmark },
  { label: 'Restaurants', icon: Utensils },
  { label: 'Caterers', icon: ChefHat },
  { label: 'Hotels', icon: Hotel },
  { label: 'Bakeries & sweet shops', icon: CakeSlice },
  { label: 'Kirana stores', icon: ShoppingBasket },
  { label: 'Office cafeterias', icon: Store },
  { label: 'Households', icon: HandHeart },
];

const STEPS: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: 'Donors share',
    text: 'List surplus food in a minute: what it is, veg or non-veg, how much, and when it must be collected by.',
    icon: Utensils,
  },
  {
    title: 'NGOs claim',
    text: 'Verified NGOs see donations near them on a list or map, nearest first. Only one NGO can claim each.',
    icon: MapPinned,
  },
  {
    title: 'Communities eat',
    text: 'The NGO picks it up and marks it collected. The food reaches people who need it, not the bin.',
    icon: HandHeart,
  },
];

const FOOD_MARKS = {
  veg: { title: 'Veg', text: 'Green square with a dot' },
  non_veg: { title: 'Non-veg', text: 'Brown square with a triangle' },
  vegan: { title: 'Vegan', text: 'Green square with a leaf' },
};

const TRUST: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'Verified NGOs only',
    text: 'An admin checks every organisation, including its NGO Darpan ID, before it can see or claim food.',
    icon: <ShieldCheck className="size-6" />,
  },
  {
    title: 'Allergens listed',
    text: 'Donors tick common allergens like nuts, gluten, dairy and egg, or add their own.',
    icon: <ListChecks className="size-6" />,
  },
  {
    title: 'Collect-by times',
    text: 'Donors set a time after which food is no longer safe. Listings past it disappear on their own.',
    icon: <Clock className="size-6" />,
  },
  {
    title: 'Cold food flagged',
    text: 'Dairy and anything that needs a fridge is marked, so the NGO brings a cool box or comes quickly.',
    icon: <Snowflake className="size-6" />,
  },
  {
    title: 'Numbers stay private',
    text: 'Phone numbers are shared only between a donor and the NGO that claimed their food, and nobody else.',
    icon: <LockKeyhole className="size-6" />,
  },
  {
    title: 'Works on any phone',
    text: 'No app to install. RePlate runs in the browser and is built for small screens first.',
    icon: <Smartphone className="size-6" />,
  },
];

export function LandingPage() {
  const auth = useAuth();
  const home = auth.status === 'signed-in' ? HOME_BY_ROLE[auth.me.role] : null;

  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-10 lg:pt-16 lg:pb-24">
        <div
          className="pointer-events-none absolute -top-24 -left-32 -z-10 size-[28rem] rounded-full bg-orange/15 blur-3xl motion-safe:animate-blob"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-40 right-0 -z-10 size-[24rem] rounded-full bg-sage/30 blur-3xl motion-safe:animate-blob [animation-delay:-6s]"
          aria-hidden="true"
        />

        <m.div
          className="max-w-xl"
          initial="hidden"
          animate="shown"
          variants={staggerParent(0.1, 0.05)}
        >
          <m.p
            variants={rise}
            className="inline-flex items-center gap-2 rounded-full border border-forest/10 bg-surface/70 px-3.5 py-1.5 text-xs font-semibold text-forest/80 shadow-sm backdrop-blur"
          >
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-moss motion-safe:animate-ping-soft" />
              <span className="relative size-2 rounded-full bg-moss" />
            </span>
            Rescuing surplus food across India
          </m.p>
          {/* Each word rises into place; the underline under "shared" draws itself after. */}
          <m.h1
            variants={staggerParent(0.07)}
            className="mt-6 font-display text-5xl leading-[1.02] font-medium tracking-[-0.03em] text-forest sm:text-6xl lg:text-7xl"
          >
            <Word>Good</Word> <Word>food,</Word>{' '}
            <m.em variants={word} className="relative inline-block font-normal text-moss">
              shared
              <svg
                viewBox="0 0 200 12"
                className="absolute -bottom-1 left-0 h-3 w-full text-orange"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <m.path
                  d="M2 9C50 3 150 1 198 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  variants={underline}
                />
              </svg>
            </m.em>{' '}
            <Word>with</Word> <Word>purpose.</Word>
          </m.h1>
          <m.p variants={rise} className="mt-7 max-w-lg text-lg leading-8 text-forest/70">
            Leftover biryani from a wedding, extra rotis from a hostel mess, unsold bread from a
            bakery. RePlate gets it to a verified NGO nearby while it's still good to eat.
          </m.p>
          <m.div variants={rise} className="mt-8 flex flex-wrap gap-3">
            {home ? (
              <Link to={home} className={buttonClasses('primary', 'lg')}>
                Go to your dashboard <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link to="/signup?role=donor" className={buttonClasses('accent', 'lg')}>
                  Donate food <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link to="/signup?role=ngo" className={buttonClasses('secondary', 'lg')}>
                  I represent an NGO
                </Link>
              </>
            )}
          </m.div>
          <m.ul
            variants={staggerParent(0.08)}
            className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-forest/70"
          >
            {['Free for everyone', 'Verified NGOs only', 'No app to install'].map((item) => (
              <m.li key={item} variants={pop} className="flex items-center gap-1.5">
                <Check className="size-4 text-moss" strokeWidth={2.5} aria-hidden="true" />
                {item}
              </m.li>
            ))}
          </m.ul>
        </m.div>

        <HeroVisual />
      </section>

      {/* Sources strip */}
      <section
        aria-label="Where surplus food comes from"
        className="border-y border-forest/10 bg-surface/60 py-5"
      >
        <p className="sr-only">
          RePlate works with {SOURCES.map((source) => source.label.toLowerCase()).join(', ')}.
        </p>
        <div
          className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          aria-hidden="true"
        >
          <ul className="flex shrink-0 gap-10 pr-10 motion-safe:animate-marquee">
            {[...SOURCES, ...SOURCES].map((source, index) => (
              <li
                key={`${source.label}-${index}`}
                className="flex shrink-0 items-center gap-2.5 text-sm font-semibold whitespace-nowrap text-forest/70"
              >
                <source.icon className="size-5 text-orange" strokeWidth={1.75} />
                {source.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section
        aria-labelledby="how-title"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20"
      >
        <m.div {...inView} variants={rise} className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2
              id="how-title"
              className="mt-4 font-display text-4xl leading-tight tracking-tight text-forest sm:text-5xl"
            >
              A simple route from surplus to <em className="font-normal text-moss">shared.</em>
            </h2>
          </div>
          <p className="max-w-md text-lg leading-8 text-forest/70 lg:justify-self-end">
            No paperwork and no app to install. Most donations go from listed to collected within a
            few hours, while the food is still fresh.
          </p>
        </m.div>
        <div className="relative mt-14">
          {/* The dashed route between the steps draws across as they arrive. */}
          <m.div
            className="absolute top-14 right-[16%] left-[16%] hidden origin-left border-t-2 border-dashed border-orange/30 md:block"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeInOut' }}
          />
          <m.ol
            {...inView}
            variants={staggerParent(0.15)}
            className="relative grid gap-6 md:grid-cols-3"
          >
            {STEPS.map((step, index) => (
              <m.li
                variants={rise}
                key={step.title}
                className="group relative rounded-3xl bg-surface p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-orange/15 text-orange transition duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
                    <step.icon className="size-7" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="font-display text-5xl text-forest/10" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl text-forest">{step.title}</h3>
                <p className="mt-3 leading-7 text-forest/70">{step.text}</p>
              </m.li>
            ))}
          </m.ol>
        </div>
      </section>

      {/* For donors / for NGOs */}
      <section aria-labelledby="who-title" className="bg-[#173b2a] text-[#f7f5ef]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
          <h2 id="who-title" className="sr-only">
            Who RePlate is for
          </h2>
          <m.div {...inView} variants={staggerParent(0.15)} className="grid gap-6 lg:grid-cols-2">
            <AudienceCard
              eyebrow="For donors"
              title="Have extra food? List it before it's wasted."
              points={[
                'Pick the pickup spot on a map and set a collect-by time',
                'See which NGO claimed it, with their phone number',
                'Track every donation from listed to collected',
              ]}
              cta={home ? undefined : { to: '/signup?role=donor', label: 'Start donating' }}
              icon={Utensils}
            />
            <AudienceCard
              eyebrow="For NGOs"
              title="Find food near your kitchen or shelter."
              points={[
                'Browse donations within your area on a list or map',
                'Filter by veg, non-veg or vegan, and by category',
                'Claim in one tap, then call the donor to arrange pickup',
              ]}
              cta={home ? undefined : { to: '/signup?role=ngo', label: 'Register your NGO' }}
              icon={Bike}
            />
          </m.div>
        </div>
      </section>

      {/* Trust and safety */}
      <section
        aria-labelledby="trust-title"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20"
      >
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <m.div {...inView} variants={rise} className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Safe and trusted</Eyebrow>
            <h2
              id="trust-title"
              className="mt-4 font-display text-4xl leading-tight tracking-tight text-forest sm:text-5xl"
            >
              Built so food <em className="font-normal text-moss">and people</em> are looked after.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-forest/70">
              Donated food has to be safe, and the people sharing it have to trust each other. Every
              listing says exactly what the food is, and only checked organisations can claim it.
            </p>
            <dl className="mt-8 max-w-sm divide-y divide-forest/10 rounded-3xl bg-surface p-2 shadow-soft">
              {(['veg', 'non_veg', 'vegan'] as const).map((type) => (
                <div key={type} className="flex items-center gap-4 px-4 py-3">
                  <dt>
                    <FoodTypeMark type={type} className="size-6" />
                  </dt>
                  <dd className="text-sm text-forest/75">
                    <strong className="block text-forest">{FOOD_MARKS[type].title}</strong>
                    {FOOD_MARKS[type].text}
                  </dd>
                </div>
              ))}
            </dl>
          </m.div>
          <m.ul {...inView} variants={staggerParent(0.08)} className="grid gap-5 sm:grid-cols-2">
            {TRUST.map((item) => (
              <m.li
                variants={rise}
                key={item.title}
                className="group flex gap-4 rounded-3xl bg-surface p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:block sm:p-6"
              >
                {/* On phones the icon sits beside the text, so six cards don't fill two screens. */}
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-moss/15 text-moss transition duration-300 group-hover:scale-110 sm:size-12"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold text-forest sm:mt-5 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-forest/70 sm:mt-2">{item.text}</p>
                </div>
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      {/* Closing call to action */}
      {!home && (
        <section className="px-4 pb-20 sm:px-6 lg:px-10">
          <m.div
            {...inView}
            variants={ctaReveal}
            className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2.5rem] bg-orange px-6 py-12 text-white sm:px-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-14"
          >
            <CtaDoodles />
            <div className="relative order-2 text-center lg:order-1 lg:text-left">
              <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
                Tonight's extra food could be someone's dinner.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-white/85 lg:mx-0">
                It takes a minute to sign up and a minute to list. NGOs nearby see it straight away.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link
                  to="/signup?role=donor"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#173b2a] transition duration-200 hover:shadow-xl active:scale-[0.97]"
                >
                  Donate food <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/signup?role=ngo"
                  className="inline-flex items-center rounded-full border border-white/60 px-7 py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-white/10 active:scale-[0.97]"
                >
                  Register your NGO
                </Link>
              </div>
            </div>
            <m.div
              variants={{
                hidden: { opacity: 0, rotate: -40, scale: 0.6 },
                shown: {
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                  transition: { ...softSpring, delay: 0.25 },
                },
              }}
              className="relative order-1 mx-auto lg:order-2"
            >
              <ThaliIllustration className="w-52 drop-shadow-xl motion-safe:animate-float-slow sm:w-64 lg:w-80" />
            </m.div>
          </m.div>
        </section>
      )}
    </div>
  );
}

/** One headline word, rising into place. */
const word: Variants = {
  hidden: { opacity: 0, y: '0.5em', rotate: 3 },
  shown: { opacity: 1, y: 0, rotate: 0, transition: softSpring },
};

const underline: Variants = {
  hidden: { pathLength: 0 },
  shown: { pathLength: 1, transition: { duration: 0.8, delay: 0.5, ease: 'easeInOut' } },
};

const ctaReveal: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  shown: { opacity: 1, y: 0, scale: 1, transition: softSpring },
};

function Word({ children }: { children: ReactNode }) {
  return (
    <m.span variants={word} className="inline-block">
      {children}
    </m.span>
  );
}

/** A layer of the hero scene that drifts against the pointer; deeper layers move further. */
function Layer({
  depth,
  pointer,
  className,
  children,
}: {
  depth: number;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  className?: string;
  children: ReactNode;
}) {
  const x = useTransform(pointer.x, (value) => value * depth);
  const y = useTransform(pointer.y, (value) => value * depth);
  return (
    <m.div className={className} style={{ x, y }}>
      {children}
    </m.div>
  );
}

const sceneIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  shown: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

/**
 * The hero illustration: the chef handing a tiffin to an NGO volunteer, on soft circles in the
 * brand colours, with the thali and food doodles around them. The pieces arrive one after another,
 * and each layer drifts against the pointer at its own depth, so the scene feels deep.
 */
function HeroVisual() {
  const still = useReducedMotion();
  // Pointer position across the window, from -1 to 1, smoothed with a spring.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointer = {
    x: useSpring(rawX, { stiffness: 50, damping: 18 }),
    y: useSpring(rawY, { stiffness: 50, damping: 18 }),
  };

  useEffect(() => {
    if (still) return;
    function move(event: PointerEvent) {
      rawX.set((event.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((event.clientY / window.innerHeight - 0.5) * 2);
    }
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [still, rawX, rawY]);

  return (
    <m.div
      className="relative mx-auto aspect-square w-full max-w-xl lg:justify-self-end"
      aria-hidden="true"
      initial="hidden"
      animate="shown"
      variants={staggerParent(0.12, 0.25)}
    >
      {/* Backdrop circles, furthest back, so they move the opposite way */}
      <Layer depth={-10} pointer={pointer} className="absolute inset-[4%]">
        <m.div variants={sceneIn} className="size-full rounded-full bg-orange/15" />
      </Layer>
      <Layer depth={-5} pointer={pointer} className="absolute inset-[16%]">
        <m.div variants={sceneIn} className="size-full rounded-full bg-sage/25" />
      </Layer>
      <m.div
        variants={sceneIn}
        className="absolute inset-[4%] rounded-full border-2 border-dashed border-orange/25 motion-safe:animate-[spin_60s_linear_infinite]"
      />

      {/* Food doodles drifting around the circle, nearest to the viewer */}
      {[
        {
          Icon: Leaf,
          place: 'top-[10%] right-[12%] size-9 rotate-12 text-moss',
          float: 'motion-safe:animate-float',
        },
        {
          Icon: Wheat,
          place: 'top-[44%] left-[1%] size-10 rotate-12 text-orange',
          float: 'motion-safe:animate-float-slow',
        },
        {
          Icon: Carrot,
          place: 'right-[2%] bottom-[34%] size-9 rotate-[20deg] text-orange',
          float: 'motion-safe:animate-float',
        },
        {
          Icon: Cherry,
          place: 'top-[6%] left-[42%] size-8 text-moss/80',
          float: 'motion-safe:animate-float-slow',
        },
      ].map(({ Icon, place, float }) => (
        <Layer key={place} depth={16} pointer={pointer} className={`absolute ${place}`}>
          <m.div variants={pop} whileHover={{ rotate: 20, scale: 1.2 }}>
            <Icon className={`size-full ${float}`} strokeWidth={1.75} />
          </m.div>
        </Layer>
      ))}
      <span className="absolute right-[7%] bottom-[24%] size-2.5 rounded-full bg-orange motion-safe:animate-ping-soft" />
      <span className="absolute bottom-[18%] left-[8%] size-2 rounded-full bg-moss" />

      {/* The thali swoops in and floats */}
      <Layer depth={22} pointer={pointer} className="absolute top-[2%] left-[2%] w-[28%]">
        <m.div
          variants={{
            hidden: { opacity: 0, y: -60, rotate: -60 },
            shown: {
              opacity: 1,
              y: 0,
              rotate: -12,
              transition: { type: 'spring', stiffness: 90, damping: 12 },
            },
          }}
        >
          <ThaliIllustration className="w-full drop-shadow-lg motion-safe:animate-float-slow" />
        </m.div>
      </Layer>

      {/* The pair rises up behind the counter, then the volunteer says thank you */}
      <Layer depth={6} pointer={pointer} className="absolute inset-x-[4%] bottom-[8%]">
        <m.div
          variants={{
            hidden: { opacity: 0, y: 60 },
            shown: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 15 } },
          }}
        >
          <LazyMascot className="w-full drop-shadow-xl" />
        </m.div>
        <m.div
          className="absolute top-[-2%] right-[6%] origin-bottom-left"
          variants={{
            hidden: { opacity: 0, scale: 0 },
            shown: {
              opacity: 1,
              scale: 1,
              transition: { type: 'spring', stiffness: 260, damping: 14, delay: 0.9 },
            },
          }}
        >
          <div className="rounded-2xl rounded-bl-sm border-2 border-forest bg-surface px-3 py-1.5 font-display text-sm font-semibold text-forest shadow-soft motion-safe:animate-float sm:text-base">
            Thank you!
          </div>
        </m.div>
      </Layer>
    </m.div>
  );
}

function Eyebrow({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-bold tracking-[0.22em] text-moss uppercase ${centered ? 'justify-center' : ''}`}
    >
      <span className="h-px w-8 bg-orange" aria-hidden="true" />
      {children}
    </p>
  );
}

function AudienceCard({
  eyebrow,
  title,
  points,
  cta,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  points: string[];
  cta?: { to: string; label: string };
  icon: LucideIcon;
}) {
  return (
    <m.div
      variants={rise}
      className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 transition-colors duration-300 hover:bg-white/[0.08] sm:p-10"
    >
      <Icon
        className="absolute -right-6 -bottom-6 size-40 text-white/5 transition duration-500 group-hover:-rotate-6 group-hover:scale-110"
        strokeWidth={1}
        aria-hidden="true"
      />
      <p className="text-xs font-bold tracking-[0.22em] text-[#e8894f] uppercase">{eyebrow}</p>
      <h3 className="mt-4 max-w-md font-display text-3xl leading-tight">{title}</h3>
      <ul className="mt-6 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex gap-3 text-[#f7f5ef]/80">
            <Check className="mt-0.5 size-5 shrink-0 text-[#a7b9a0]" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
      {cta && (
        <Link
          to={cta.to}
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#e8894f] px-6 py-3 text-sm font-bold text-white transition duration-200 hover:shadow-lg hover:shadow-black/20 active:scale-[0.97]"
        >
          {cta.label} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </m.div>
  );
}

/** Faint food doodles scattered behind the closing call to action. */
const DOODLES: { icon: LucideIcon; className: string }[] = [
  { icon: Wheat, className: 'top-6 left-8 size-12 rotate-[-15deg]' },
  { icon: Carrot, className: 'bottom-8 left-[38%] hidden size-10 rotate-[20deg] lg:block' },
  { icon: Leaf, className: 'top-10 left-[45%] hidden size-9 rotate-12 lg:block' },
  { icon: Soup, className: 'bottom-6 left-6 size-11 rotate-6' },
  { icon: Apple, className: 'bottom-10 left-[24%] hidden size-8 -rotate-12 lg:block' },
  { icon: Cherry, className: 'top-6 right-10 size-10 rotate-12' },
  { icon: Salad, className: 'right-8 bottom-6 size-12 -rotate-6' },
];

function CtaDoodles() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {DOODLES.map(({ icon: Icon, className }) => (
        <Icon key={className} className={`absolute text-white/15 ${className}`} strokeWidth={1.5} />
      ))}
    </div>
  );
}
