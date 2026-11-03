-- RePlate core schema: user profiles, NGO details, donations and their status history.
-- Access rules live in the security migration; status changes live in the donation_workflow migration.

create extension if not exists postgis with schema extensions;

-- Helpers that policies and triggers call. Not exposed through the Supabase API.
create schema if not exists private;

create type public.user_role as enum ('donor', 'ngo', 'admin');
create type public.ngo_verification as enum ('pending', 'verified', 'rejected');
create type public.donation_status as enum ('available', 'claimed', 'collected', 'cancelled', 'expired');
create type public.dietary_type as enum ('veg', 'non_veg', 'vegan');
create type public.food_category as enum ('cooked_meal', 'produce', 'bakery', 'packaged', 'dairy');

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- One row per signed-up user, created automatically from auth.users (see handle_new_user below).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  display_name text not null check (char_length(display_name) between 2 and 120),
  phone text check (phone ~ '^\+?[0-9 ()-]{7,20}$'),
  address text check (char_length(address) <= 300),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  -- Derived from lat/lng so clients only ever send plain numbers.
  location extensions.geography(point, 4326) generated always as (
    case
      when lat is not null and lng is not null
        then extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_lat_lng_together check ((lat is null) = (lng is null))
);

create table public.ngos (
  id uuid primary key references public.profiles (id) on delete cascade,
  registration_number text check (char_length(registration_number) <= 60),
  verification public.ngo_verification not null default 'pending',
  verified_at timestamptz,
  service_radius_km integer not null default 10 check (service_radius_km between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text check (char_length(description) <= 1000),
  category public.food_category not null,
  dietary_type public.dietary_type not null,
  quantity integer not null check (quantity between 1 and 100000),
  quantity_unit text not null default 'servings' check (quantity_unit in ('servings', 'kg', 'items')),
  allergens text[] not null default '{}' check (cardinality(allergens) <= 20),
  needs_refrigeration boolean not null default false,
  prepared_at timestamptz,
  pickup_from timestamptz not null default now(),
  -- After this the food is no longer safe to collect; the expiry job marks it expired.
  expires_at timestamptz not null,
  pickup_address text not null check (char_length(pickup_address) between 5 and 300),
  pickup_lat double precision not null check (pickup_lat between -90 and 90),
  pickup_lng double precision not null check (pickup_lng between -180 and 180),
  pickup_location extensions.geography(point, 4326) generated always as (
    extensions.st_setsrid(extensions.st_makepoint(pickup_lng, pickup_lat), 4326)::extensions.geography
  ) stored,
  pickup_notes text check (char_length(pickup_notes) <= 500),
  status public.donation_status not null default 'available',
  claimed_by uuid references public.ngos (id) on delete set null,
  claimed_at timestamptz,
  collected_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donations_pickup_window check (expires_at > pickup_from),
  constraint donations_prepared_before_expiry check (prepared_at is null or prepared_at < expires_at)
);

create index donations_donor_id_idx on public.donations (donor_id, created_at desc);
create index donations_claimed_by_idx on public.donations (claimed_by) where claimed_by is not null;
create index donations_available_expiry_idx on public.donations (expires_at) where status = 'available';
create index donations_pickup_location_idx on public.donations using gist (pickup_location);

-- Append-only history of status changes, written by a trigger so it can't be skipped or edited.
create table public.donation_events (
  id bigint generated always as identity primary key,
  donation_id uuid not null references public.donations (id) on delete cascade,
  status public.donation_status not null,
  actor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index donation_events_donation_id_idx on public.donation_events (donation_id, created_at);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger ngos_set_updated_at before update on public.ngos
  for each row execute function private.set_updated_at();
create trigger donations_set_updated_at before update on public.donations
  for each row execute function private.set_updated_at();

create function private.log_donation_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    -- auth.uid() is null when the expiry job makes the change.
    insert into public.donation_events (donation_id, status, actor_id)
    values (new.id, new.status, auth.uid());
  end if;
  return null;
end;
$$;

create trigger donations_log_status after insert or update of status on public.donations
  for each row execute function private.log_donation_status();

-- Creates the profile (and NGO row) when someone signs up through Supabase Auth.
-- Sign-up metadata is user-controlled, so only 'donor' and 'ngo' are accepted; admins are promoted by hand.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role public.user_role := case when v_meta ->> 'role' = 'ngo' then 'ngo' else 'donor' end;
  v_name text := left(trim(coalesce(v_meta ->> 'display_name', split_part(new.email, '@', 1), '')), 120);
  v_phone text := trim(v_meta ->> 'phone');
begin
  insert into public.profiles (id, role, display_name, phone)
  values (
    new.id,
    v_role,
    case when char_length(v_name) >= 2 then v_name else 'RePlate user' end,
    -- An invalid phone shouldn't block sign-up; it can be added from the profile later.
    case when v_phone ~ '^\+?[0-9 ()-]{7,20}$' then v_phone end
  );

  if v_role = 'ngo' then
    insert into public.ngos (id, registration_number)
    values (new.id, nullif(left(trim(v_meta ->> 'registration_number'), 60), ''));
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();
