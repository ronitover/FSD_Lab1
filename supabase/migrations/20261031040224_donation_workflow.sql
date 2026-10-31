-- Status changes, nearby search and the expiry job.
-- Each status change is a single UPDATE guarded by the current status, so concurrent requests
-- can't both succeed: the second one finds the row already changed and gets an error.
--
-- Errors use two SQLSTATEs the API maps to HTTP responses:
--   42501 (insufficient_privilege) -> 403, the caller isn't allowed to do this
--   P0002 (no_data_found)          -> 409, the donation isn't in a state that allows it

create function public.claim_donation(p_donation_id uuid)
returns public.donations
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.donations;
begin
  if not private.is_verified_ngo() then
    raise exception 'Only verified NGOs can claim donations' using errcode = '42501';
  end if;

  update public.donations
  set status = 'claimed', claimed_by = auth.uid(), claimed_at = now()
  where id = p_donation_id and status = 'available' and expires_at > now()
  returning * into result;

  if not found then
    raise exception 'This donation is no longer available' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

-- The NGO can't make the pickup after all; the donation goes back to other NGOs.
create function public.release_claim(p_donation_id uuid)
returns public.donations
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.donations;
begin
  update public.donations
  set status = 'available', claimed_by = null, claimed_at = null
  where id = p_donation_id and status = 'claimed' and claimed_by = auth.uid()
  returning * into result;

  if not found then
    raise exception 'You have no active claim on this donation' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

create function public.mark_collected(p_donation_id uuid)
returns public.donations
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.donations;
begin
  update public.donations
  set status = 'collected', collected_at = now()
  where id = p_donation_id and status = 'claimed' and claimed_by = auth.uid()
  returning * into result;

  if not found then
    raise exception 'You have no active claim on this donation' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

-- Donors can cancel before collection; claimed_by is kept so the NGO still sees what happened.
create function public.cancel_donation(p_donation_id uuid)
returns public.donations
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.donations;
begin
  update public.donations
  set status = 'cancelled', cancelled_at = now()
  where id = p_donation_id and donor_id = auth.uid() and status in ('available', 'claimed')
  returning * into result;

  if not found then
    raise exception 'This donation can no longer be cancelled' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

create function public.set_ngo_verification(p_ngo_id uuid, p_verification public.ngo_verification)
returns public.ngos
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.ngos;
begin
  if not private.is_admin() then
    raise exception 'Only admins can verify NGOs' using errcode = '42501';
  end if;

  update public.ngos
  set verification = p_verification,
      verified_at = case when p_verification = 'verified' then now() end
  where id = p_ngo_id
  returning * into result;

  if not found then
    raise exception 'NGO not found' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

-- What a verified NGO sees when browsing: open donations within range, nearest first.
-- Returns only the donor's name; phone and address details are shared after a claim.
create function public.nearby_donations(
  p_lat double precision,
  p_lng double precision,
  p_radius_km integer default null,
  p_search text default null,
  p_category public.food_category default null,
  p_dietary_type public.dietary_type default null,
  p_limit integer default 50
)
returns table (
  id uuid,
  title text,
  description text,
  category public.food_category,
  dietary_type public.dietary_type,
  quantity integer,
  quantity_unit text,
  allergens text[],
  needs_refrigeration boolean,
  prepared_at timestamptz,
  pickup_from timestamptz,
  expires_at timestamptz,
  pickup_address text,
  pickup_lat double precision,
  pickup_lng double precision,
  donor_name text,
  distance_km double precision
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  origin extensions.geography :=
    extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography;
  radius_km integer;
  pattern text;
begin
  if not private.is_verified_ngo() then
    raise exception 'Only verified NGOs can browse donations' using errcode = '42501';
  end if;

  select coalesce(p_radius_km, n.service_radius_km) into radius_km from public.ngos n where n.id = auth.uid();
  radius_km := least(greatest(radius_km, 1), 100);

  if nullif(trim(p_search), '') is not null then
    -- Escape LIKE wildcards so a search for "50%" matches literally.
    pattern := '%' || replace(replace(replace(trim(p_search), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  return query
  select
    d.id, d.title, d.description, d.category, d.dietary_type, d.quantity, d.quantity_unit,
    d.allergens, d.needs_refrigeration, d.prepared_at, d.pickup_from, d.expires_at,
    d.pickup_address, d.pickup_lat, d.pickup_lng,
    p.display_name,
    extensions.st_distance(d.pickup_location, origin) / 1000
  from public.donations d
  join public.profiles p on p.id = d.donor_id
  where d.status = 'available'
    and d.expires_at > now()
    and extensions.st_dwithin(d.pickup_location, origin, radius_km * 1000)
    and (pattern is null or d.title ilike pattern or d.description ilike pattern)
    and (p_category is null or d.category = p_category)
    and (p_dietary_type is null or d.dietary_type = p_dietary_type)
  order by extensions.st_distance(d.pickup_location, origin)
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
end;
$$;

revoke execute on function
  public.claim_donation(uuid),
  public.release_claim(uuid),
  public.mark_collected(uuid),
  public.cancel_donation(uuid),
  public.set_ngo_verification(uuid, public.ngo_verification),
  public.nearby_donations(double precision, double precision, integer, text, public.food_category, public.dietary_type, integer)
from public, anon;

grant execute on function
  public.claim_donation(uuid),
  public.release_claim(uuid),
  public.mark_collected(uuid),
  public.cancel_donation(uuid),
  public.set_ngo_verification(uuid, public.ngo_verification),
  public.nearby_donations(double precision, double precision, integer, text, public.food_category, public.dietary_type, integer)
to authenticated;

-- Expiry: open donations past their expiry time are marked expired every 5 minutes.
-- Claimed ones are left alone, since the NGO may already be on the way.
create extension if not exists pg_cron with schema pg_catalog;

create function private.expire_donations()
returns integer
language sql
security definer
set search_path = ''
as $$
  with expired as (
    update public.donations
    set status = 'expired'
    where status = 'available' and expires_at <= now()
    returning 1
  )
  select count(*)::integer from expired
$$;

select cron.schedule('expire-donations', '*/5 * * * *', 'select private.expire_donations()');
