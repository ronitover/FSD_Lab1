/**
 * Demo accounts with realistic data, for presentations. Re-running replaces the demo accounts and
 * their donations, so pickup times are always fresh: run it shortly before a demo.
 *
 *   npm run db:seed-demo -w @replate/api
 *
 * Needs DEMO_PASSWORD (at least 8 characters) in apps/api/.env; every demo account uses it.
 * Run it against the dev project only.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const password = process.env.DEMO_PASSWORD;
if (!url || !publishableKey || !secretKey) {
  console.error(
    'Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY in apps/api/.env',
  );
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error('Set DEMO_PASSWORD (at least 8 characters) in apps/api/.env');
  process.exit(1);
}

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secretKey, clientOptions);

// Bengaluru: the NGO's base and the donors are a few kilometres apart.
const SPICE_ROUTE = {
  address: '12 MG Road, Ashok Nagar, Bengaluru 560001',
  lat: 12.9716,
  lng: 77.5946,
};
const DAILY_BREAD = {
  address: '80 Feet Road, Indiranagar, Bengaluru 560038',
  lat: 12.9784,
  lng: 77.6408,
};
const KORAMANGALA = {
  address: '5th Block, Koramangala, Bengaluru 560095',
  lat: 12.9352,
  lng: 77.6245,
};
const ANNAPURNA = {
  address: '4th Cross, Shivajinagar, Bengaluru 560001',
  lat: 12.9836,
  lng: 77.6006,
};

const ACCOUNTS = {
  donor: {
    email: 'demo-donor@example.com',
    metadata: { role: 'donor', display_name: 'Spice Route Kitchen', phone: '+91 98450 12345' },
    home: SPICE_ROUTE,
  },
  bakery: {
    email: 'demo-bakery@example.com',
    metadata: { role: 'donor', display_name: 'Daily Bread Bakery', phone: '+91 98860 55555' },
    home: DAILY_BREAD,
  },
  ngo: {
    email: 'demo-ngo@example.com',
    metadata: {
      role: 'ngo',
      display_name: 'Annapurna Community Food Trust',
      phone: '+91 80 4123 4567',
      registration_number: 'KA/2019/0234567',
    },
    home: ANNAPURNA,
  },
  pendingNgo: {
    email: 'demo-ngo-pending@example.com',
    metadata: {
      role: 'ngo',
      display_name: 'Seva Meals Foundation',
      phone: '+91 99000 11223',
      registration_number: 'KA/2024/0099812',
    },
    home: null,
  },
  pendingNgo2: {
    email: 'demo-ngo-pending-2@example.com',
    metadata: {
      role: 'ngo',
      display_name: 'Hope Shelter Kitchen',
      registration_number: 'KA/2025/0011457',
    },
    home: null,
  },
  admin: {
    email: 'demo-admin@example.com',
    metadata: { role: 'donor', display_name: 'RePlate Admin' },
    home: null,
  },
} as const;

type AccountKey = keyof typeof ACCOUNTS;

const hours = (n: number) => new Date(Date.now() + n * 60 * 60 * 1000).toISOString();

/** Unwraps a Supabase result, stopping the script on an error or missing data. */
function must<T>(
  { data, error }: { data: T; error: { message: string } | null },
  what: string,
): NonNullable<T> {
  if (error || data == null) throw new Error(`${what}: ${error?.message ?? 'no data returned'}`);
  return data;
}

async function removeExisting() {
  const emails = new Set<string>(Object.values(ACCOUNTS).map((a) => a.email));
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(`List users: ${error.message}`);
  const existing = data.users.filter((user) => user.email && emails.has(user.email));
  // Deleting the auth user cascades to the profile, NGO record and donations.
  for (const user of existing) await admin.auth.admin.deleteUser(user.id);
  return existing.length;
}

/** Creates the account and returns a client signed in as it, so changes go through the same rules as the app. */
async function create(key: AccountKey): Promise<{ id: string; db: SupabaseClient }> {
  const account = ACCOUNTS[key];
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password,
    email_confirm: true,
    user_metadata: account.metadata,
  });
  const user = data.user;
  if (error || !user) throw new Error(`Create ${account.email}: ${error?.message}`);
  if (account.home) {
    must(
      await admin
        .from('profiles')
        .update({ address: account.home.address, lat: account.home.lat, lng: account.home.lng })
        .eq('id', user.id)
        .select('id'),
      `Set address for ${account.email}`,
    );
  }
  const db = createClient(url!, publishableKey!, clientOptions);
  const signIn = await db.auth.signInWithPassword({ email: account.email, password: password! });
  if (signIn.error) throw new Error(`Sign in ${account.email}: ${signIn.error.message}`);
  return { id: user.id, db };
}

interface DonationSeed {
  title: string;
  description?: string;
  category: 'cooked_meal' | 'produce' | 'bakery' | 'packaged' | 'dairy';
  dietary_type: 'veg' | 'non_veg' | 'vegan';
  quantity: number;
  quantity_unit?: 'servings' | 'kg' | 'items';
  allergens?: string[];
  needs_refrigeration?: boolean;
  expires_at: string;
  pickup_notes?: string;
}

async function list(
  db: SupabaseClient,
  donorId: string,
  at: typeof SPICE_ROUTE,
  seeds: DonationSeed[],
) {
  const rows = seeds.map((seed) => ({
    donor_id: donorId,
    pickup_address: at.address,
    pickup_lat: at.lat,
    pickup_lng: at.lng,
    ...seed,
  }));
  const inserted = must(
    await db.from('donations').insert(rows, { defaultToNull: false }).select('id, title'),
    'List donations',
  );
  return Object.fromEntries(inserted.map((row) => [row.title, row.id as string]));
}

async function main() {
  const removed = await removeExisting();
  if (removed) console.warn(`Removed ${removed} old demo accounts.`);

  const donor = await create('donor');
  const bakery = await create('bakery');
  const ngo = await create('ngo');
  await create('pendingNgo');
  await create('pendingNgo2');
  const adminUser = await create('admin');
  // Admins are promoted by hand; sign-up can't grant the role.
  must(
    await admin.from('profiles').update({ role: 'admin' }).eq('id', adminUser.id).select('id'),
    'Promote admin',
  );
  must(
    await adminUser.db.rpc('set_ngo_verification', {
      p_ngo_id: ngo.id,
      p_verification: 'verified',
    }),
    'Verify NGO',
  );

  const spice = await list(donor.db, donor.id, SPICE_ROUTE, [
    {
      title: 'Gulab jamun from a wedding reception',
      category: 'packaged',
      dietary_type: 'veg',
      quantity: 60,
      quantity_unit: 'items',
      allergens: ['Dairy', 'Gluten'],
      expires_at: hours(30),
    },
    {
      title: 'Sambar and curd rice',
      description: 'Lunch service surplus, in steel containers.',
      category: 'cooked_meal',
      dietary_type: 'veg',
      quantity: 50,
      allergens: ['Dairy'],
      expires_at: hours(5),
    },
    {
      title: 'Leftover dal makhani',
      category: 'cooked_meal',
      dietary_type: 'veg',
      quantity: 15,
      allergens: ['Dairy'],
      expires_at: hours(8),
    },
    {
      title: 'Mixed fruit platters',
      category: 'produce',
      dietary_type: 'vegan',
      quantity: 8,
      quantity_unit: 'kg',
      expires_at: hours(20),
    },
    {
      title: 'Chicken curry with chapatis',
      category: 'cooked_meal',
      dietary_type: 'non_veg',
      quantity: 30,
      allergens: ['Gluten'],
      expires_at: hours(6),
      pickup_notes: 'Use the service entrance at the back and ask for Ravi.',
    },
    {
      title: 'Paneer butter masala and jeera rice',
      description: 'From the evening banquet, kept hot in sealed trays.',
      category: 'cooked_meal',
      dietary_type: 'veg',
      quantity: 25,
      allergens: ['Dairy'],
      needs_refrigeration: true,
      expires_at: hours(3),
      pickup_notes: 'Use the service entrance at the back and ask for Ravi.',
    },
  ]);
  await list(bakery.db, bakery.id, DAILY_BREAD, [
    {
      title: 'Whole wheat bread loaves',
      category: 'bakery',
      dietary_type: 'vegan',
      quantity: 35,
      quantity_unit: 'items',
      allergens: ['Gluten'],
      expires_at: hours(10),
    },
    {
      title: 'Croissants and muffins',
      category: 'bakery',
      dietary_type: 'veg',
      quantity: 48,
      quantity_unit: 'items',
      allergens: ['Gluten', 'Dairy', 'Egg'],
      expires_at: hours(8),
    },
  ]);
  await list(bakery.db, bakery.id, KORAMANGALA, [
    {
      title: 'Fresh milk packets',
      category: 'dairy',
      dietary_type: 'veg',
      quantity: 20,
      quantity_unit: 'items',
      allergens: ['Dairy'],
      needs_refrigeration: true,
      expires_at: hours(12),
    },
  ]);

  // Move a few through their lifecycle as the real users, so each history entry has the right name.
  const claim = (id: string) => ngo.db.rpc('claim_donation', { p_donation_id: id });
  must(await claim(spice['Gulab jamun from a wedding reception']!), 'Claim');
  must(
    await ngo.db.rpc('mark_collected', {
      p_donation_id: spice['Gulab jamun from a wedding reception'],
    }),
    'Collect',
  );
  must(await claim(spice['Sambar and curd rice']!), 'Claim');
  must(
    await donor.db.rpc('cancel_donation', { p_donation_id: spice['Leftover dal makhani'] }),
    'Cancel',
  );

  console.warn('Demo data is ready. Every account uses DEMO_PASSWORD from apps/api/.env:\n');
  for (const [key, account] of Object.entries(ACCOUNTS)) {
    console.warn(
      `  ${key.padEnd(12)} ${account.email.padEnd(32)} ${account.metadata.display_name}`,
    );
  }
}

try {
  await main();
} catch (error) {
  console.error('\nStopped:', error instanceof Error ? error.message : error);
  process.exit(1);
}
