import { Link } from 'react-router';
import { HOME_BY_ROLE, useAuth } from '../auth/context.ts';
import { buttonClasses } from '../components/ui/styles.ts';
import heroImage from '../assets/hero.png';

const STEPS = [
  {
    title: 'Donors share',
    text: 'Restaurants, stores and households list safe surplus food in a few simple details.',
  },
  {
    title: 'NGOs claim',
    text: 'Verified NGOs see donations near them and claim one. Only one NGO can claim each.',
  },
  {
    title: 'Communities eat',
    text: 'The NGO collects the food and it reaches people who need it, not the bin.',
  },
];

export function LandingPage() {
  const auth = useAuth();
  const home = auth.status === 'signed-in' ? HOME_BY_ROLE[auth.me.role] : null;

  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:pt-16">
        <div className="max-w-xl">
          <p className="mb-6 flex items-center gap-3 text-xs font-bold tracking-[0.22em] text-moss uppercase">
            <span className="h-px w-8 bg-orange" aria-hidden="true" /> Good food deserves another
            plate.
          </p>
          <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.04em] text-forest sm:text-6xl lg:text-7xl">
            Good food, <em className="font-normal text-moss">shared</em> with purpose.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-forest/70">
            RePlate brings restaurants, stores, NGOs and neighbours together so surplus food reaches
            people instead of landfills.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {home ? (
              <Link to={home} className={buttonClasses('primary', 'lg')}>
                Go to your dashboard <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <>
                <Link to="/signup" className={buttonClasses('accent', 'lg')}>
                  Donate food <span aria-hidden="true">→</span>
                </Link>
                <Link to="/signup" className={buttonClasses('secondary', 'lg')}>
                  I represent an NGO
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl lg:justify-self-end">
          <img
            src={heroImage}
            alt="Volunteers serving food from a large pot"
            className="aspect-[1.08/1] w-full rounded-[2.5rem] object-cover shadow-soft"
          />
          <div className="absolute bottom-5 left-5 rounded-2xl bg-surface/90 px-5 py-3 shadow-soft backdrop-blur">
            <p className="text-xs font-semibold tracking-widest text-moss uppercase">
              Together, we can
            </p>
            <p className="mt-1 font-display text-xl text-forest">feed more, waste less.</p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how-title"
        className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-10"
      >
        <p className="text-xs font-bold tracking-[0.22em] text-moss uppercase">How it works</p>
        <h2
          id="how-title"
          className="mt-4 max-w-xl font-display text-4xl leading-tight tracking-tight text-forest sm:text-5xl"
        >
          A simple route from surplus to <em className="font-normal text-moss">shared.</em>
        </h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-3xl bg-surface p-7 shadow-soft">
              <span className="font-display text-3xl text-orange" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-display text-2xl text-forest">{step.title}</h3>
              <p className="mt-3 leading-7 text-forest/70">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
