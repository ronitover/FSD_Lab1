/**
 * End-to-end check of the API against a real Supabase project: starts the API in-process,
 * signs in as throwaway donor, NGO and admin accounts, and walks the whole donation flow over HTTP.
 * The accounts are deleted afterwards.
 *
 *   npm run api:check -w @replate/api
 *
 * Run it against the dev project only. It also makes two real requests to Nominatim.
 */
import type { AddressInfo } from 'node:net';
import { createClient } from '@supabase/supabase-js';
import { createApp } from '../src/app.ts';

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

const server = createApp().listen(0);
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) {
    console.warn(`  ✓ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${name}`, detail === undefined ? '' : JSON.stringify(detail));
  }
}

async function signUp(label: string, metadata: Record<string, string>) {
  const email = `replate-api-${run}-${label}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error || !data.user) throw new Error(`Could not create ${label}: ${error?.message}`);
  createdUserIds.push(data.user.id);
  return { id: data.user.id, email };
}

async function tokenFor(email: string) {
  const client = createClient(url!, publishableKey!, clientOptions);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Could not sign in ${email}: ${error?.message}`);
  return data.session.access_token;
}

type Json = any;

async function api(token: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: (text ? JSON.parse(text) : null) as Json };
}

const hours = (n: number) => new Date(Date.now() + n * 60 * 60 * 1000).toISOString();

const biryani = {
  title: 'Vegetable biryani',
  description: 'Fresh from lunch service',
  category: 'cooked_meal',
  dietaryType: 'veg',
  quantity: 20,
  allergens: ['nuts'],
  expiresAt: hours(4),
  pickupAddress: 'MG Road, Bengaluru',
  pickupLat: 12.9756,
  pickupLng: 77.6066,
};

async function main() {
  console.warn('Creating test accounts…');
  const donorUser = await signUp('donor', { role: 'donor', display_name: 'Spice Route Kitchen' });
  const ngo1User = await signUp('ngo-1', { role: 'ngo', display_name: 'Annapurna Trust' });
  const ngo2User = await signUp('ngo-2', { role: 'ngo', display_name: 'Seva Meals' });
  const pendingUser = await signUp('ngo-pending', { role: 'ngo', display_name: 'New NGO' });
  const adminUser = await signUp('admin', { role: 'donor', display_name: 'RePlate Admin' });
  // Admins are promoted by hand; sign-up can't grant the role.
  await admin.from('profiles').update({ role: 'admin' }).eq('id', adminUser.id);

  const [donor, ngo1, ngo2, pending, adminToken] = await Promise.all(
    [donorUser, ngo1User, ngo2User, pendingUser, adminUser].map((u) => tokenFor(u.email)),
  );
  const t = { donor: donor!, ngo1: ngo1!, ngo2: ngo2!, pending: pending!, admin: adminToken! };

  console.warn('\nProfile');
  {
    const me = await api(t.donor, 'GET', '/api/me');
    check(
      'GET /api/me returns the donor profile',
      me.status === 200 && me.body.role === 'donor' && me.body.ngo === null,
      me.body,
    );
    const ngoMe = await api(t.ngo1, 'GET', '/api/me');
    check(
      'an NGO profile includes its NGO details',
      ngoMe.body.ngo?.verification === 'pending',
      ngoMe.body,
    );
    const updated = await api(t.donor, 'PATCH', '/api/me', { phone: '+91 98765 43210' });
    check(
      'PATCH /api/me updates the profile',
      updated.status === 200 && updated.body.phone === '+91 98765 43210',
      updated.body,
    );
    const badPhone = await api(t.donor, 'PATCH', '/api/me', { phone: 'call me' });
    check('an invalid phone is rejected with 400', badPhone.status === 400, badPhone.body);
    const radius = await api(t.ngo1, 'PATCH', '/api/me/ngo', { serviceRadiusKm: 15 });
    check(
      'an NGO can change its service radius',
      radius.body.ngo?.serviceRadiusKm === 15,
      radius.body,
    );
    const donorRadius = await api(t.donor, 'PATCH', '/api/me/ngo', { serviceRadiusKm: 15 });
    check('a donor cannot use NGO settings (403)', donorRadius.status === 403, donorRadius.body);
  }

  console.warn('\nCreate');
  const created = await api(t.donor, 'POST', '/api/donations', biryani);
  check(
    'POST /api/donations creates a donation (201)',
    created.status === 201 && created.body.status === 'available',
    created.body,
  );
  const donationId: string = created.body.id;
  {
    const invalid = await api(t.donor, 'POST', '/api/donations', {
      ...biryani,
      quantity: 0,
      expiresAt: hours(-1),
    });
    check(
      'invalid input is rejected with 400 and a readable message',
      invalid.status === 400 && invalid.body.error.code === 'VALIDATION_ERROR',
      invalid.body,
    );
    const byNgo = await api(t.ngo1, 'POST', '/api/donations', biryani);
    check('an NGO cannot create donations (403)', byNgo.status === 403, byNgo.body);
  }

  console.warn('\nRead and search (donor)');
  {
    const mine = await api(t.donor, 'GET', '/api/donations/mine');
    check(
      'GET /mine lists the donation',
      mine.body.some((d: Json) => d.id === donationId),
      mine.body,
    );
    const found = await api(t.donor, 'GET', '/api/donations/mine?q=biryani');
    const missed = await api(t.donor, 'GET', '/api/donations/mine?q=pizza');
    check(
      'search finds matches and leaves out the rest',
      found.body.length === 1 && missed.body.length === 0,
      { found: found.body.length, missed: missed.body.length },
    );
    const byAddress = await api(t.donor, 'GET', '/api/donations/mine?q=mg%20road');
    check('search also matches the pickup address', byAddress.body.length === 1, byAddress.body);
    const tricky = await api(
      t.donor,
      'GET',
      `/api/donations/mine?q=${encodeURIComponent('biryani,(title.eq.x)')}`,
    );
    check('search text with filter syntax is handled safely', tricky.status === 200, tricky.body);
    const filtered = await api(t.donor, 'GET', '/api/donations/mine?status=claimed');
    check('status filter works', filtered.body.length === 0, filtered.body);
    const detail = await api(t.donor, 'GET', `/api/donations/${donationId}`);
    check(
      'GET /:id returns history and no contact before a claim',
      detail.body.events?.length === 1 && detail.body.contact === null,
      detail.body,
    );
    const badId = await api(t.donor, 'GET', '/api/donations/not-a-uuid');
    check('a malformed id is rejected with 400', badId.status === 400, badId.body);
  }

  console.warn('\nUpdate (donor)');
  {
    const edited = await api(t.donor, 'PATCH', `/api/donations/${donationId}`, { quantity: 25 });
    check(
      'PATCH /:id edits while available',
      edited.status === 200 && edited.body.quantity === 25 && edited.body.title === biryani.title,
      edited.body,
    );
    const empty = await api(t.donor, 'PATCH', `/api/donations/${donationId}`, {});
    check('an empty update is rejected with 400', empty.status === 400, empty.body);
  }

  console.warn('\nNGO verification (admin)');
  {
    const notAdmin = await api(t.donor, 'GET', '/api/admin/ngos');
    check('non-admins cannot list NGOs (403)', notAdmin.status === 403, notAdmin.body);
    const queue = await api(t.admin, 'GET', '/api/admin/ngos?verification=pending');
    check(
      'admin sees pending NGOs',
      queue.body.some((n: Json) => n.id === ngo1User.id && n.displayName === 'Annapurna Trust'),
      queue.body,
    );
    const blocked = await api(t.pending, 'GET', '/api/donations/nearby?lat=12.97&lng=77.6');
    check('an unverified NGO cannot browse (403)', blocked.status === 403, blocked.body);
    for (const ngo of [ngo1User, ngo2User]) {
      const verified = await api(t.admin, 'POST', `/api/admin/ngos/${ngo.id}/verification`, {
        verification: 'verified',
      });
      check(
        `admin verifies ${verified.body.displayName}`,
        verified.status === 200 && verified.body.verification === 'verified',
        verified.body,
      );
    }
  }

  console.warn('\nBrowse and claim (NGO)');
  {
    const nearby = await api(t.ngo1, 'GET', '/api/donations/nearby?lat=12.97&lng=77.6&q=biryani');
    const hit = nearby.body.find?.((d: Json) => d.id === donationId);
    check(
      'nearby search finds it with distance and donor name',
      hit?.distanceKm < 5 && hit?.donorName === 'Spice Route Kitchen',
      nearby.body,
    );
    check(
      'browse results do not include donor contact details',
      hit && !('contact' in hit) && !('donorId' in hit),
      hit,
    );
    const veganOnly = await api(
      t.ngo1,
      'GET',
      '/api/donations/nearby?lat=12.97&lng=77.6&dietaryType=vegan',
    );
    check(
      'dietary filter leaves it out',
      !veganOnly.body.some((d: Json) => d.id === donationId),
      veganOnly.body,
    );

    const [a, b] = await Promise.all([
      api(t.ngo1, 'POST', `/api/donations/${donationId}/claim`),
      api(t.ngo2, 'POST', `/api/donations/${donationId}/claim`),
    ]);
    const statuses = [a.status, b.status].sort();
    check(
      'two NGOs claiming at once: one 200, one 409',
      statuses[0] === 200 && statuses[1] === 409,
      [a.body, b.body],
    );
    const winner =
      a.status === 200
        ? { token: t.ngo1, name: 'Annapurna Trust' }
        : { token: t.ngo2, name: 'Seva Meals' };
    const loser = a.status === 200 ? t.ngo2 : t.ngo1;

    const donorView = await api(t.donor, 'GET', `/api/donations/${donationId}`);
    check(
      "the donor now sees the claiming NGO's contact",
      donorView.body.contact?.displayName === winner.name,
      donorView.body.contact,
    );
    const ngoView = await api(winner.token, 'GET', `/api/donations/${donationId}`);
    check(
      "the NGO now sees the donor's phone",
      ngoView.body.contact?.phone === '+91 98765 43210',
      ngoView.body.contact,
    );
    const loserView = await api(loser, 'GET', `/api/donations/${donationId}`);
    check('the other NGO can no longer see it (404)', loserView.status === 404, loserView.body);

    const lockedEdit = await api(t.donor, 'PATCH', `/api/donations/${donationId}`, {
      quantity: 30,
    });
    check(
      'the donor cannot edit a claimed donation (409)',
      lockedEdit.status === 409,
      lockedEdit.body,
    );
    const lockedDelete = await api(t.donor, 'DELETE', `/api/donations/${donationId}`);
    check(
      'the donor cannot delete a claimed donation (409)',
      lockedDelete.status === 409,
      lockedDelete.body,
    );

    const pickups = await api(winner.token, 'GET', '/api/donations/claimed');
    check(
      'GET /claimed lists it for the claiming NGO',
      pickups.body.some((d: Json) => d.id === donationId),
      pickups.body,
    );
    const wrongCollect = await api(loser, 'POST', `/api/donations/${donationId}/collect`);
    check(
      'the other NGO cannot mark it collected (409)',
      wrongCollect.status === 409,
      wrongCollect.body,
    );
    const collected = await api(winner.token, 'POST', `/api/donations/${donationId}/collect`);
    check(
      'the claiming NGO marks it collected',
      collected.status === 200 && collected.body.status === 'collected',
      collected.body,
    );
    const history = await api(t.donor, 'GET', `/api/donations/${donationId}`);
    const statusesSeen = history.body.events.map((e: Json) => e.status).join(' → ');
    check(
      'the full history is returned',
      statusesSeen === 'available → claimed → collected',
      statusesSeen,
    );
  }

  console.warn('\nRelease, cancel and delete');
  {
    const second = await api(t.donor, 'POST', '/api/donations', {
      ...biryani,
      title: 'Bread loaves',
      category: 'bakery',
    });
    await api(t.ngo1, 'POST', `/api/donations/${second.body.id}/claim`);
    const released = await api(t.ngo1, 'POST', `/api/donations/${second.body.id}/release`);
    check(
      'an NGO can release its claim',
      released.body.status === 'available' && released.body.claimedBy === null,
      released.body,
    );
    const cancelled = await api(t.donor, 'POST', `/api/donations/${second.body.id}/cancel`);
    check('the donor can cancel', cancelled.body.status === 'cancelled', cancelled.body);
    const reclaim = await api(t.ngo2, 'POST', `/api/donations/${second.body.id}/claim`);
    check('a cancelled donation cannot be claimed (409)', reclaim.status === 409, reclaim.body);

    const third = await api(t.donor, 'POST', '/api/donations', {
      ...biryani,
      title: 'Fruit crates',
      category: 'produce',
    });
    const byNgo = await api(t.ngo1, 'DELETE', `/api/donations/${third.body.id}`);
    check('an NGO cannot delete donations (403)', byNgo.status === 403, byNgo.body);
    const deleted = await api(t.donor, 'DELETE', `/api/donations/${third.body.id}`);
    check('DELETE /:id removes an available donation (204)', deleted.status === 204, deleted.body);
    const gone = await api(t.donor, 'GET', `/api/donations/${third.body.id}`);
    check('it is gone afterwards (404)', gone.status === 404, gone.body);
  }

  console.warn('\nAddress search (OpenStreetMap)');
  {
    const search = await api(
      t.donor,
      'GET',
      `/api/geocode?q=${encodeURIComponent('MG Road, Bengaluru')}`,
    );
    const first = search.body?.[0];
    check(
      'address search returns places with coordinates',
      search.status === 200 && typeof first?.lat === 'number' && first.label.length > 0,
      search.body,
    );
    const reverse = await api(t.donor, 'GET', '/api/geocode/reverse?lat=12.9756&lng=77.6066');
    check(
      'reverse lookup returns an address',
      reverse.status === 200 && reverse.body.label?.includes('Bengaluru'),
      reverse.body,
    );
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
  server.close();
}

console.warn(failures === 0 ? '\nThe API behaves as intended.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
