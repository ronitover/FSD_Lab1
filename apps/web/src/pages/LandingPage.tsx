import {
  ArrowRight,
  Bike,
  Building2,
  CakeSlice,
  Check,
  ChefHat,
  Clock,
  Croissant,
  HandHeart,
  Hotel,
  Landmark,
  LockKeyhole,
  MapPinned,
  Navigation,
  PartyPopper,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Snowflake,
  Store,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import heroImage from '../assets/hero.png';
import { HOME_BY_ROLE, useAuth } from '../auth/context.ts';
import { FoodTypeMark } from '../components/ui/FoodVisuals.tsx';
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

const TRUST: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'Verified NGOs only',
    text: 'An admin checks every organisation, including its NGO Darpan ID, before it can see or claim food.',
    icon: <ShieldCheck className="size-6" />,
  },
  {
    title: 'Veg and non-veg, clearly marked',
    text: 'Every listing carries the familiar green and brown marks, plus allergens like nuts, gluten and dairy.',
    icon: (
      <span className="flex gap-1">
        <FoodTypeMark type="veg" className="size-5" />
        <FoodTypeMark type="non_veg" className="size-5" />
      </span>
    ),
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

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is RePlate free?',
    a: 'Yes. Listing food and claiming it are both free, for donors and for NGOs.',
  },
  {
    q: 'What food can I donate?',
    a: "Food that is still safe to eat: cooked meals kept hygienically, fresh produce, bakery items, sealed packaged food before its expiry, and dairy kept cold. Follow FSSAI's food safety guidance, and never list food you wouldn't serve yourself.",
  },
  {
    q: 'Who can claim my donation?',
    a: 'Only NGOs that a RePlate admin has verified. Each donation can be claimed by one NGO, and you can see who claimed it and call them.',
  },
  {
    q: "What if the NGO can't make it?",
    a: 'They release the claim and your donation goes straight back to other NGOs nearby. You can also cancel a donation at any time before it is collected.',
  },
  {
    q: 'How does an NGO get verified?',
    a: 'Sign up as an NGO with your organisation details and, ideally, your NGO Darpan ID. An admin reviews it, usually within a day or two.',
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

        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-forest/10 bg-surface/70 px-3.5 py-1.5 text-xs font-semibold text-forest/80 shadow-sm backdrop-blur motion-safe:animate-fade-up">
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-moss motion-safe:animate-ping-soft" />
              <span className="relative size-2 rounded-full bg-moss" />
            </span>
            Rescuing surplus food across India
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] font-medium tracking-[-0.03em] text-forest motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] sm:text-6xl lg:text-7xl">
            Good food,{' '}
            <em className="relative font-normal text-moss">
              shared
              <svg
                viewBox="0 0 200 12"
                className="absolute -bottom-1 left-0 h-3 w-full text-orange"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9C50 3 150 1 198 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </em>{' '}
            with purpose.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-forest/70 motion-safe:animate-fade-up motion-safe:[animation-delay:160ms]">
            Leftover biryani from a wedding, extra rotis from a hostel mess, unsold bread from a
            bakery. RePlate gets it to a verified NGO nearby while it's still good to eat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:240ms]">
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
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-forest/70 motion-safe:animate-fade-up motion-safe:[animation-delay:320ms]">
            {['Free for everyone', 'Verified NGOs only', 'No app to install'].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-moss" strokeWidth={2.5} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

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
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28"
      >
        <div className="reveal max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2
            id="how-title"
            className="mt-4 font-display text-4xl leading-tight tracking-tight text-forest sm:text-5xl"
          >
            A simple route from surplus to <em className="font-normal text-moss">shared.</em>
          </h2>
        </div>
        <div className="relative mt-14">
          <div
            className="absolute top-14 right-[16%] left-[16%] hidden border-t-2 border-dashed border-orange/30 md:block"
            aria-hidden="true"
          />
          <ol className="relative grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="reveal group relative rounded-3xl bg-surface p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
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
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* For donors / for NGOs */}
      <section aria-labelledby="who-title" className="bg-[#173b2a] text-[#f7f5ef]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
          <h2 id="who-title" className="sr-only">
            Who RePlate is for
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
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
          </div>
        </div>
      </section>

      {/* Trust and safety */}
      <section
        aria-labelledby="trust-title"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28"
      >
        <div className="reveal max-w-2xl">
          <Eyebrow>Safe and trusted</Eyebrow>
          <h2
            id="trust-title"
            className="mt-4 font-display text-4xl leading-tight tracking-tight text-forest sm:text-5xl"
          >
            Built so food <em className="font-normal text-moss">and people</em> are looked after.
          </h2>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST.map((item) => (
            <li
              key={item.title}
              className="reveal group rounded-3xl border border-forest/10 bg-surface/70 p-6 transition duration-300 hover:border-moss/40 hover:bg-surface hover:shadow-soft"
            >
              <span
                className="flex size-12 items-center justify-center rounded-2xl bg-moss/15 text-moss transition duration-300 group-hover:scale-110"
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <h3 className="mt-5 text-lg font-bold text-forest">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-forest/70">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="faq-title"
        className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:pb-28"
      >
        <div className="reveal text-center">
          <Eyebrow centered>Questions</Eyebrow>
          <h2 id="faq-title" className="mt-4 font-display text-4xl tracking-tight text-forest">
            Good to know
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="reveal group rounded-2xl bg-surface shadow-soft open:shadow-lift [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold text-forest">
                {faq.q}
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-forest/5 text-lg leading-none transition duration-300 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 text-sm leading-7 text-forest/70">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      {!home && (
        <section className="px-4 pb-20 sm:px-6 lg:px-10">
          <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-orange px-6 py-14 text-center text-white sm:px-12">
            <div
              className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-white/15 blur-2xl motion-safe:animate-blob"
              aria-hidden="true"
            />
            <HandHeart className="mx-auto size-10" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              Tonight's extra food could be someone's dinner.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/85">
              It takes a minute to sign up and a minute to list. NGOs nearby see it straight away.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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
        </section>
      )}
    </div>
  );
}

/** The hero photo with example listing cards floating over it, to show what the app does at a glance. */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl motion-safe:animate-fade-up motion-safe:[animation-delay:200ms] lg:justify-self-end">
      <div
        className="absolute -inset-3 -z-10 rotate-3 rounded-[2.75rem] bg-orange/20"
        aria-hidden="true"
      />
      <img
        src={heroImage}
        alt="Volunteers serving food from a large pot"
        className="aspect-[1.05/1] w-full rounded-[2.5rem] object-cover shadow-lift"
      />

      {/* Decorative example cards; the same information is in the text around them. */}
      <div aria-hidden="true">
        <div className="absolute -top-5 -left-3 w-56 rounded-2xl bg-surface p-3.5 shadow-lift motion-safe:animate-float sm:-left-10 sm:w-64">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
              <Utensils className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-bold text-forest">
                <FoodTypeMark type="veg" className="size-3.5" /> Veg biryani
              </p>
              <p className="text-xs text-forest/60">40 servings · wedding hall</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2 text-[11px] font-semibold">
            <span className="flex items-center gap-1 rounded-full bg-orange/15 px-2 py-0.5 text-orange">
              <Clock className="size-3" /> in 3 hours
            </span>
            <span className="flex items-center gap-1 rounded-full bg-moss/15 px-2 py-0.5 text-moss">
              <Navigation className="size-3" /> 1.5 km
            </span>
          </div>
        </div>

        <div className="absolute -right-2 bottom-20 rounded-2xl bg-surface px-4 py-3 shadow-lift motion-safe:animate-float-slow motion-safe:[animation-delay:-3s] sm:-right-8">
          <p className="flex items-center gap-2 text-sm font-bold text-forest">
            <span className="flex size-6 items-center justify-center rounded-full bg-moss text-white">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            Claimed by a verified NGO
          </p>
        </div>

        <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-2xl bg-surface/90 px-4 py-2.5 shadow-soft backdrop-blur motion-safe:animate-float motion-safe:[animation-delay:-1.5s]">
          <Croissant className="size-5 text-amber-600" />
          <p className="text-sm font-semibold text-forest">35 loaves · bakery</p>
          <FoodTypeMark type="vegan" className="size-3.5" />
        </div>
      </div>
    </div>
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
    <div className="reveal group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 transition duration-300 hover:bg-white/[0.08] sm:p-10">
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
    </div>
  );
}
