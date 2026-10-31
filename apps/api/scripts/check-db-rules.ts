/**
 * Checks the database rules (Row Level Security, column privileges and workflow functions)
 * against a real Supabase project, using throwaway accounts that are deleted afterwards.
 *
 *   npm run db:check -w @replate/api
 *
 * Run it against the dev project only: it creates and deletes users.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !publishableKey || !secretKey) {
  console.error(
    'Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY in apps/api/.env',
  );
  process.exit(1);
}

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secretKey, clientOptions);

const run = Date.now().toString(36);
const password = `Check-${run}-${Math.random().toString(36).slice(2)}!`;
const createdUserIds: string[] = [];
let failures = 0;

function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) {
    console.warn(`  ✓ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${name}`, detail ?? '');
  }
}

async function createUser(label: string, metadata: Record<string, string>) {
  const email = `replate-check-${run}-${label}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error || !data.user) throw new Error(`Could not create ${label}: ${error?.message}`);
  createdUserIds.push(data.user.id);

  const client = createClient(url!, publishableKey!, clientOptions);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`Could not sign in ${label}: ${signInError.message}`);
  return { id: data.user.id, client };
}

async function verifyNgo(id: string) {
  const { error } = await admin.from('ngos').update({ verification: 'verified' }).eq('id', id);
  if (error) throw new Error(`Could not verify NGO: ${error.message}`);
}

const hourFromNow = () => new Date(Date.now() + 60 * 60 * 1000).toISOString();

function donationInput(donorId: string, title: string) {
  return {
    donor_id: donorId,
    title,
    category: 'cooked_meal',
    dietary_type: 'veg',
    quantity: 20,
    expires_at: hourFromNow(),
    pickup_address: 'MG Road, Bengaluru',
    pickup_lat: 12.9756,
    pickup_lng: 77.6066,
  };
}

async function visibleDonationIds(client: SupabaseClient) {
  const { data } = await client.from('donations').select('id');
  return new Set((data ?? []).map((row) => row.id as string));
}

async function main() {
  console.warn('Creating test accounts…');
  const donorA = await createUser('donor-a', { role: 'donor', display_name: 'Donor A' });
  const donorB = await createUser('donor-b', { role: 'donor', display_name: 'Donor B' });
  const ngo1 = await createUser('ngo-1', {
    role: 'ngo',
    display_name: 'NGO One',
    phone: '+91 98765 43210',
  });
  const ngo2 = await createUser('ngo-2', { role: 'ngo', display_name: 'NGO Two' });
  const ngoPending = await createUser('ngo-pending', { role: 'ngo', display_name: 'Pending NGO' });
  const sneaky = await createUser('sneaky', { role: 'admin', display_name: 'Sneaky' });
  await verifyNgo(ngo1.id);
  await verifyNgo(ngo2.id);

  console.warn('\nSign-up');
  {
    const { data } = await sneaky.client
      .from('profiles')
      .select('role')
      .eq('id', sneaky.id)
      .single();
    check(
      'asking for the admin role at sign-up gives a donor account',
      data?.role === 'donor',
      data,
    );
    const { data: ngoRow } = await ngo1.client
      .from('ngos')
      .select('verification')
      .eq('id', ngo1.id)
      .single();
    check('an NGO account gets an NGO record', ngoRow?.verification === 'verified', ngoRow);
  }

  console.warn('\nCreate');
  const { data: donation, error: createError } = await donorA.client
    .from('donations')
    .insert(donationInput(donorA.id, 'Vegetable biryani, 20 portions'))
    .select()
    .single();
  check(
    'a donor can create a donation',
    !createError && donation?.status === 'available',
    createError,
  );
  if (!donation) throw new Error('Cannot continue without a donation');
  {
    const { error } = await ngoPending.client
      .from('donations')
      .insert(donationInput(ngoPending.id, 'Not allowed'));
    check('an NGO cannot create donations', Boolean(error), 'insert succeeded');
    const { error: forged } = await donorB.client
      .from('donations')
      .insert(donationInput(donorA.id, 'Forged'));
    check(
      "a donor cannot create a donation in someone else's name",
      Boolean(forged),
      'insert succeeded',
    );
    const { error: statusError } = await donorA.client
      .from('donations')
      .insert({ ...donationInput(donorA.id, 'Pre-claimed'), status: 'claimed' });
    check('a donor cannot set the status when creating', Boolean(statusError), 'insert succeeded');
  }

  console.warn('\nRead');
  check(
    'the donor sees their own donation',
    (await visibleDonationIds(donorA.client)).has(donation.id),
  );
  check(
    'another donor does not see it',
    !(await visibleDonationIds(donorB.client)).has(donation.id),
  );
  check(
    'an unverified NGO does not see it',
    !(await visibleDonationIds(ngoPending.client)).has(donation.id),
  );
  check('a verified NGO sees it', (await visibleDonationIds(ngo1.client)).has(donation.id));
  {
    const { data, error } = await ngo1.client.rpc('nearby_donations', {
      p_lat: 12.97,
      p_lng: 77.6,
      p_radius_km: 5,
    });
    const row = data?.find((d: { id: string }) => d.id === donation.id);
    check(
      'nearby search finds it with a distance and donor name',
      !error && row?.distance_km < 5 && row?.donor_name === 'Donor A',
      error ?? row,
    );
    const { data: far } = await ngo1.client.rpc('nearby_donations', {
      p_lat: 19.076,
      p_lng: 72.8777,
      p_radius_km: 50,
    });
    check(
      'nearby search leaves out donations outside the radius',
      !far?.some((d: { id: string }) => d.id === donation.id),
    );
    const { data: searched } = await ngo1.client.rpc('nearby_donations', {
      p_lat: 12.97,
      p_lng: 77.6,
      p_search: 'biryani',
    });
    const { data: missed } = await ngo1.client.rpc('nearby_donations', {
      p_lat: 12.97,
      p_lng: 77.6,
      p_search: 'pizza',
    });
    check(
      'search by text matches and filters',
      searched?.length >= 1 && !missed?.some((d: { id: string }) => d.id === donation.id),
    );
    const { error: pendingError } = await ngoPending.client.rpc('nearby_donations', {
      p_lat: 12.97,
      p_lng: 77.6,
    });
    check('an unverified NGO cannot browse', pendingError?.code === '42501', pendingError);
    const { data: hidden } = await ngo1.client.from('profiles').select('phone').eq('id', donorA.id);
    check("an NGO cannot read a donor's profile before claiming", hidden?.length === 0, hidden);
  }

  console.warn('\nUpdate');
  {
    const { data, error } = await donorA.client
      .from('donations')
      .update({ quantity: 25 })
      .eq('id', donation.id)
      .select();
    check('the donor can edit while available', !error && data?.[0]?.quantity === 25, error);
    const { data: other } = await donorB.client
      .from('donations')
      .update({ quantity: 1 })
      .eq('id', donation.id)
      .select();
    check('another donor cannot edit it', other?.length === 0, other);
    const { error: statusError } = await donorA.client
      .from('donations')
      .update({ status: 'collected' })
      .eq('id', donation.id);
    check(
      'the donor cannot change the status directly',
      statusError?.code === '42501',
      statusError,
    );
    const { error: roleError } = await donorA.client
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', donorA.id);
    check('a user cannot change their own role', roleError?.code === '42501', roleError);
  }

  console.warn('\nClaim');
  {
    const results = await Promise.all([
      ngo1.client.rpc('claim_donation', { p_donation_id: donation.id }),
      ngo2.client.rpc('claim_donation', { p_donation_id: donation.id }),
    ]);
    const winners = results.filter((r) => !r.error);
    const loser = results.find((r) => r.error);
    check(
      'two NGOs claiming at once: exactly one wins',
      winners.length === 1,
      results.map((r) => r.error?.message ?? 'ok'),
    );
    check('the other gets "no longer available"', loser?.error?.code === 'P0002', loser?.error);

    const winner = results[0]?.error ? ngo2 : ngo1;
    const other = winner === ngo1 ? ngo2 : ngo1;
    const { data: edit } = await donorA.client
      .from('donations')
      .update({ quantity: 30 })
      .eq('id', donation.id)
      .select();
    check('the donor can no longer edit once claimed', edit?.length === 0, edit);
    const { data: removed } = await donorA.client
      .from('donations')
      .delete()
      .eq('id', donation.id)
      .select();
    check('the donor cannot delete a claimed donation', removed?.length === 0, removed);
    const { data: claimerProfile } = await donorA.client
      .from('profiles')
      .select('display_name')
      .eq('id', winner.id);
    check(
      "the donor can now see the claiming NGO's profile",
      claimerProfile?.length === 1,
      claimerProfile,
    );
    const { data: donorProfile } = await winner.client
      .from('profiles')
      .select('display_name')
      .eq('id', donorA.id);
    check(
      "the claiming NGO can now see the donor's profile",
      donorProfile?.length === 1,
      donorProfile,
    );
    const { data: stranger } = await donorB.client
      .from('profiles')
      .select('id')
      .eq('id', winner.id);
    check(
      "an unrelated donor still cannot see the NGO's profile",
      stranger?.length === 0,
      stranger,
    );
    check(
      'the losing NGO no longer sees the donation',
      !(await visibleDonationIds(other.client)).has(donation.id),
    );

    const { error: notTheirs } = await other.client.rpc('mark_collected', {
      p_donation_id: donation.id,
    });
    check('only the claiming NGO can mark it collected', notTheirs?.code === 'P0002', notTheirs);
    const { data: collected, error } = await winner.client.rpc('mark_collected', {
      p_donation_id: donation.id,
    });
    check(
      'the claiming NGO marks it collected',
      !error && collected?.status === 'collected',
      error,
    );

    const { data: events } = await donorA.client
      .from('donation_events')
      .select('status')
      .eq('donation_id', donation.id)
      .order('id');
    const history = (events ?? []).map((e) => e.status).join(' → ');
    check('the status history is recorded', history === 'available → claimed → collected', history);
  }

  console.warn('\nDelete');
  {
    const { data: second } = await donorA.client
      .from('donations')
      .insert(donationInput(donorA.id, 'Bread loaves'))
      .select()
      .single();
    const { data: byOther } = await donorB.client
      .from('donations')
      .delete()
      .eq('id', second?.id)
      .select();
    check('another donor cannot delete it', byOther?.length === 0, byOther);
    const { data: removed, error } = await donorA.client
      .from('donations')
      .delete()
      .eq('id', second?.id)
      .select();
    check('the donor can delete an available donation', !error && removed?.length === 1, error);
  }
}

try {
  await main();
} catch (error) {
  failures += 1;
  console.error('\nStopped early:', error instanceof Error ? error.message : error);
} finally {
  // Deleting the auth users cascades to their profiles, NGO records and donations.
  for (const id of createdUserIds) await admin.auth.admin.deleteUser(id);
  console.warn(`\nCleaned up ${createdUserIds.length} test accounts.`);
}

console.warn(
  failures === 0 ? '\nAll database rules behave as intended.' : `\n${failures} check(s) failed.`,
);
process.exit(failures === 0 ? 0 : 1);
