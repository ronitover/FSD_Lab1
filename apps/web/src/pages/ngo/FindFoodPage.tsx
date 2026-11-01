import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  DIETARY_TYPES,
  FOOD_CATEGORIES,
  type DietaryType,
  type FoodCategory,
} from '@replate/shared';
import { useMe } from '../../auth/context.ts';
import { NearbyMap } from '../../components/map/NearbyMap.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState, FullPageError, Spinner } from '../../components/ui/Feedback.tsx';
import { SearchBar } from '../../components/ui/SearchBar.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { useToast } from '../../components/ui/toast-context.ts';
import { useNearbyDonations } from '../../features/donations/queries.ts';
import { useDonationActions } from '../../features/donations/useDonationActions.tsx';
import { NearbyDonationCard } from '../../features/ngo/NearbyDonationCard.tsx';
import { SearchOriginPicker, type SearchOrigin } from '../../features/ngo/SearchOriginPicker.tsx';
import { useUpdateNgoSettings, useUpdateProfile } from '../../features/profile/queries.ts';
import { errorMessage } from '../../lib/api.ts';
import { CATEGORY_LABELS, DIETARY_LABELS, formatQuantity, optionsFrom } from '../../lib/labels.ts';

const RADIUS_CHOICES = [2, 5, 10, 20, 50, 100];
const CATEGORY_OPTIONS = optionsFrom(CATEGORY_LABELS);
const DIETARY_OPTIONS = optionsFrom(DIETARY_LABELS);

const pick = <T extends string>(values: readonly T[], value: string | null) =>
  values.find((item) => item === value);

export function FindFoodPage() {
  const me = useMe();
  const navigate = useNavigate();
  const toast = useToast();
  const actions = useDonationActions();
  const saveProfile = useUpdateProfile();
  const saveSettings = useUpdateNgoSettings();

  const savedRadius = me.ngo?.serviceRadiusKm ?? 10;
  const savedOrigin: SearchOrigin | null =
    me.lat !== null && me.lng !== null
      ? { lat: me.lat, lng: me.lng, label: me.address ?? 'Your saved location' }
      : null;

  // Where to search from starts at the NGO's saved base and isn't put in the URL, for privacy.
  const [origin, setOrigin] = useState<SearchOrigin | null>(savedOrigin);
  const [choosingOrigin, setChoosingOrigin] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');

  // Filters live in the URL, so a reload or the back button keeps them.
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = pick<FoodCategory>(FOOD_CATEGORIES, params.get('category'));
  const dietaryType = pick<DietaryType>(DIETARY_TYPES, params.get('dietaryType'));
  const radiusParam = Number(params.get('radius'));
  const radiusKm = RADIUS_CHOICES.includes(radiusParam) ? radiusParam : savedRadius;

  function setParam(key: string, value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }

  const nearby = useNearbyDonations(
    origin
      ? {
          lat: origin.lat,
          lng: origin.lng,
          radiusKm,
          q: q || undefined,
          category,
          dietaryType,
        }
      : null,
  );

  const sameAsSaved =
    origin && savedOrigin && origin.lat === savedOrigin.lat && origin.lng === savedOrigin.lng;

  async function saveOrigin() {
    if (!origin) return;
    try {
      await saveProfile.mutateAsync({
        address: origin.label.slice(0, 300),
        lat: origin.lat,
        lng: origin.lng,
      });
      toast.show('Saved. Searches will start here from now on.');
    } catch (error) {
      toast.show(errorMessage(error), 'error');
    }
  }

  async function saveRadius() {
    try {
      await saveSettings.mutateAsync({ serviceRadiusKm: radiusKm });
      setParam('radius', '');
      toast.show(`Your default search area is now ${radiusKm} km.`);
    } catch (error) {
      toast.show(errorMessage(error), 'error');
    }
  }

  const header = (
    <div>
      <p className="text-xs font-bold tracking-[0.22em] text-moss uppercase">{me.displayName}</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight text-forest">Find food near you</h1>
    </div>
  );

  if (!origin || choosingOrigin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <title>Find food · RePlate</title>
        {header}
        <div className="mt-8 rounded-3xl bg-surface p-6 shadow-soft">
          <h2 className="font-display text-xl text-forest">Where should we search from?</h2>
          <p className="mt-1 mb-5 text-sm text-forest/65">
            Usually your kitchen or shelter: wherever you'll bring the food back to.
          </p>
          <SearchOriginPicker
            onPick={(next) => {
              setOrigin(next);
              setChoosingOrigin(false);
            }}
            onCancel={origin ? () => setChoosingOrigin(false) : undefined}
          />
        </div>
      </div>
    );
  }

  const list = nearby.data ?? [];
  const filtered = Boolean(q || category || dietaryType);
  const points = list.map((donation) => ({
    id: donation.id,
    lat: donation.pickupLat,
    lng: donation.pickupLng,
    label: donation.title,
    popup: (
      <div className="min-w-44">
        <p className="font-display text-base">{donation.title}</p>
        <p className="mt-1 text-xs">
          {formatQuantity(donation.quantity, donation.quantityUnit)} · {donation.distanceKm} km
        </p>
        <Link
          to={`/donations/${donation.id}`}
          className="mt-2 inline-block text-xs font-semibold text-moss"
        >
          View details →
        </Link>
      </div>
    ),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <title>Find food · RePlate</title>
      {header}

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-surface px-4 py-3 text-sm shadow-soft">
        <p className="min-w-0 flex-1 truncate text-forest/75">
          Searching within <strong className="text-forest">{radiusKm} km</strong> of{' '}
          <strong className="text-forest">{origin.label}</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          {!sameAsSaved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void saveOrigin()}
              loading={saveProfile.isPending}
            >
              Save as my base
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setChoosingOrigin(true)}>
            Change location
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_10rem_9rem] lg:items-end">
        <SearchBar
          label="Search donations"
          placeholder="Search by food, description or area"
          value={q}
          onSearch={(value) => setParam('q', value)}
        />
        <SelectField
          label="Category"
          options={CATEGORY_OPTIONS}
          placeholder="Any category"
          value={category ?? ''}
          onChange={(value) => setParam('category', value)}
        />
        <SelectField
          label="Food type"
          options={DIETARY_OPTIONS}
          placeholder="Any"
          value={dietaryType ?? ''}
          onChange={(value) => setParam('dietaryType', value)}
        />
        <SelectField
          label="Distance"
          options={RADIUS_CHOICES.map((km) => ({ value: String(km), label: `${km} km` }))}
          value={String(radiusKm)}
          onChange={(value) => setParam('radius', value === String(savedRadius) ? '' : value)}
        />
      </div>
      {radiusKm !== savedRadius && (
        <p className="mt-2 text-xs text-forest/60">
          Your default is {savedRadius} km.{' '}
          <button
            type="button"
            className="font-semibold text-moss underline-offset-4 hover:underline"
            onClick={() => void saveRadius()}
            disabled={saveSettings.isPending}
          >
            Make {radiusKm} km my default
          </button>
        </p>
      )}

      {/* On small screens list and map take turns; on large screens they sit side by side. */}
      <div className="mt-6 flex gap-2 lg:hidden" role="group" aria-label="View">
        {(['list', 'map'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={view === option}
            onClick={() => setView(option)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              view === option ? 'bg-forest text-cream' : 'border border-forest/20 text-forest'
            }`}
          >
            {option === 'list' ? 'List' : 'Map'}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-6 lg:mt-6 lg:grid-cols-[1fr_1.1fr]">
        <div className={view === 'map' ? 'hidden lg:block' : ''} aria-busy={nearby.isFetching}>
          {nearby.isPending ? (
            <div className="grid place-items-center py-20 text-moss">
              <Spinner className="size-8" label="Finding donations near you" />
            </div>
          ) : nearby.isError ? (
            <FullPageError
              message={errorMessage(nearby.error)}
              onRetry={() => void nearby.refetch()}
            />
          ) : list.length === 0 ? (
            <EmptyState
              title={filtered ? 'No matching donations' : 'Nothing nearby right now'}
              action={
                filtered ? (
                  <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
                    Clear filters
                  </Button>
                ) : radiusKm < 100 ? (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setParam('radius', String(RADIUS_CHOICES.find((km) => km > radiusKm)))
                    }
                  >
                    Search further away
                  </Button>
                ) : undefined
              }
            >
              {filtered
                ? 'Try a different word or filter.'
                : 'New donations appear here as soon as they are listed. This page checks every minute.'}
            </EmptyState>
          ) : (
            <>
              <p className="mb-3 text-sm text-forest/60" role="status">
                {list.length} {list.length === 1 ? 'donation' : 'donations'}, nearest first
              </p>
              <div
                className={`grid gap-4 transition-opacity xl:grid-cols-2 ${nearby.isPlaceholderData ? 'opacity-60' : ''}`}
              >
                {list.map((donation) => (
                  <NearbyDonationCard
                    key={donation.id}
                    donation={donation}
                    onClaim={() =>
                      actions.request('claim', donation, () =>
                        navigate(`/donations/${donation.id}`),
                      )
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className={view === 'list' ? 'hidden lg:block' : ''}>
          <div className="lg:sticky lg:top-24">
            <NearbyMap
              origin={origin}
              radiusKm={radiusKm}
              points={points}
              className="h-[28rem] lg:h-[36rem]"
            />
          </div>
        </div>
      </div>

      {actions.dialog}
    </div>
  );
}
