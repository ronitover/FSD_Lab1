-- Row Level Security and privileges.
-- The API queries Supabase as the signed-in user, so these rules apply to every request,
-- not just to anyone calling Supabase directly with the public key.

alter table public.profiles enable row level security;
alter table public.ngos enable row level security;
alter table public.donations enable row level security;
alter table public.donation_events enable row level security;

-- Helpers run as their owner so policies can look up roles without triggering each other's policies.
create function private.user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.user_role() = 'admin', false)
$$;

create function private.is_verified_ngo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.ngos where id = auth.uid() and verification = 'verified')
$$;

-- Contact details are shared only between a donor and the NGO that claimed one of their donations.
create function private.can_view_profile(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target = auth.uid()
    or private.is_admin()
    or exists (
      select 1
      from public.donations d
      where (d.donor_id = target and d.claimed_by = auth.uid())
         or (d.claimed_by = target and d.donor_id = auth.uid())
    )
$$;

-- profiles
create policy "profiles: self, admin, or donation counterpart can read"
  on public.profiles for select to authenticated
  using (private.can_view_profile(id));

create policy "profiles: users update their own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ngos
create policy "ngos: self, admin, or donors whose donation they claimed can read"
  on public.ngos for select to authenticated
  using (
    id = (select auth.uid())
    or private.is_admin()
    or exists (
      select 1 from public.donations d
      where d.claimed_by = ngos.id and d.donor_id = (select auth.uid())
    )
  );

create policy "ngos: NGOs update their own settings"
  on public.ngos for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- donations
create policy "donations: owner, claimer, verified NGOs (open ones) and admins can read"
  on public.donations for select to authenticated
  using (
    donor_id = (select auth.uid())
    or claimed_by = (select auth.uid())
    or (status = 'available' and expires_at > now() and private.is_verified_ngo())
    or private.is_admin()
  );

create policy "donations: donors create their own"
  on public.donations for insert to authenticated
  with check (donor_id = (select auth.uid()) and private.user_role() = 'donor');

-- Editing locks once an NGO has claimed the donation.
create policy "donations: donors edit their own while available"
  on public.donations for update to authenticated
  using (donor_id = (select auth.uid()) and status = 'available')
  with check (donor_id = (select auth.uid()) and status = 'available');

-- Claimed and collected donations stay as a record for both sides.
create policy "donations: donors delete their own unless claimed or collected"
  on public.donations for delete to authenticated
  using (donor_id = (select auth.uid()) and status in ('available', 'cancelled', 'expired'));

-- donation_events: visible to whoever can see the donation (the subquery applies donations' policies).
create policy "donation_events: readable alongside the donation"
  on public.donation_events for select to authenticated
  using (exists (select 1 from public.donations d where d.id = donation_id));

-- Privileges. Column lists keep status, verification and role changes out of plain updates:
-- those go through the workflow functions, which check who is asking.
revoke all on public.profiles, public.ngos, public.donations, public.donation_events from anon, authenticated;

grant select on public.profiles, public.ngos, public.donations, public.donation_events to authenticated;
grant update (display_name, phone, address, lat, lng) on public.profiles to authenticated;
grant update (service_radius_km) on public.ngos to authenticated;
grant insert (
  donor_id, title, description, category, dietary_type, quantity, quantity_unit, allergens,
  needs_refrigeration, prepared_at, pickup_from, expires_at, pickup_address, pickup_lat, pickup_lng, pickup_notes
) on public.donations to authenticated;
grant update (
  title, description, category, dietary_type, quantity, quantity_unit, allergens,
  needs_refrigeration, prepared_at, pickup_from, expires_at, pickup_address, pickup_lat, pickup_lng, pickup_notes
) on public.donations to authenticated;
grant delete on public.donations to authenticated;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function
  private.user_role(),
  private.is_admin(),
  private.is_verified_ngo(),
  private.can_view_profile(uuid)
to authenticated;
