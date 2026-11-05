import { Check, Clock, Navigation, Utensils } from 'lucide-react';
import type { ReactNode } from 'react';
import heroImage from '../../assets/hero.png';
import { FoodTypeMark } from '../ui/FoodVisuals.tsx';
import { LogoMark } from './Logo.tsx';

const POINTS = [
  'Free for donors and NGOs',
  'Only verified NGOs can claim food',
  'Phone numbers shared only after a claim',
];

/**
 * The layout for sign-in, sign-up and password screens: the form beside a brand panel that reminds
 * people what RePlate does. On phones the panel shrinks to a banner above the form.
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:py-12">
      <BrandPanel />

      <div className="flex flex-col justify-center motion-safe:animate-fade-up lg:py-6">
        <div className="mx-auto w-full max-w-lg rounded-3xl bg-surface p-6 shadow-soft sm:p-8">
          <h1 className="font-display text-3xl tracking-tight text-forest sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-6 text-forest/65">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-forest/70">{footer}</div>}
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative isolate overflow-hidden rounded-[2rem] bg-[#173b2a] text-[#f7f5ef]"
    >
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover opacity-35 mix-blend-luminosity"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#173b2a] via-[#173b2a]/80 to-[#173b2a]/40" />
      <div className="absolute -top-16 -right-16 -z-10 size-64 rounded-full bg-[#e8894f]/30 blur-3xl motion-safe:animate-blob" />

      {/* Phones: a short banner. */}
      <div className="flex items-center gap-4 p-5 lg:hidden">
        <LogoMark className="size-12 shrink-0 [&_.fill-forest]:fill-white/10 [&_.stroke-cream]:stroke-[#f7f5ef] [&_.stroke-cream\/45]:stroke-[#f7f5ef]/45" />
        <p className="font-display text-xl leading-snug">
          Good food deserves <em className="text-[#e8894f]">another plate.</em>
        </p>
      </div>

      {/* Larger screens: the full panel. */}
      <div className="hidden h-full min-h-[36rem] flex-col justify-between gap-10 p-10 lg:flex">
        <LogoMark className="size-14 [&_.fill-forest]:fill-white/10 [&_.stroke-cream]:stroke-[#f7f5ef] [&_.stroke-cream\/45]:stroke-[#f7f5ef]/45" />

        <div>
          <p className="font-display text-4xl leading-tight tracking-tight xl:text-5xl">
            Good food deserves <em className="text-[#e8894f]">another plate.</em>
          </p>
          <p className="mt-4 max-w-sm leading-7 text-[#f7f5ef]/75">
            Restaurants, hostels, wedding halls and homes list surplus food. Verified NGOs nearby
            claim it and collect it while it's still good.
          </p>
          <ul className="mt-6 space-y-2.5">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm text-[#f7f5ef]/85">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#a7b9a0]/25">
                  <Check className="size-3 text-[#a7b9a0]" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-72 rounded-2xl bg-[#f7f5ef] p-4 text-[#173b2a] shadow-2xl motion-safe:animate-float">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Utensils className="size-5" />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <FoodTypeMark type="veg" className="size-3.5" /> Dal, rice and sabzi
              </p>
              <p className="text-xs text-[#173b2a]/60">60 servings · hostel mess</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2 text-[11px] font-semibold">
            <span className="flex items-center gap-1 rounded-full bg-[#e8894f]/15 px-2 py-0.5 text-[#c0652d]">
              <Clock className="size-3" /> in 2 hours
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#496a4c]/15 px-2 py-0.5 text-[#496a4c]">
              <Navigation className="size-3" /> 2.3 km
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
