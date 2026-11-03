# RePlate

RePlate connects surplus food from restaurants, stores and individuals with nearby NGOs before it goes to waste. Donors post what they have; NGOs nearby claim it and collect it.

## Repository layout

| Path              | What it is                                                                |
| ----------------- | ------------------------------------------------------------------------- |
| `apps/web`        | React + TypeScript web app (Vite)                                         |
| `apps/api`        | Express + TypeScript REST API                                             |
| `packages/shared` | Types, constants and validation rules used by both apps                   |
| `supabase`        | Database migrations (Supabase / Postgres)                                 |
| `docs`            | Demo walkthrough                                                          |
| `legacy/part1`    | The original HTML/CSS/JS site from Lab Part 1 (also tagged `part1-final`) |

## Getting started

Requires Node 22 or newer (`.nvmrc` pins 24).

```bash
npm install
cp apps/api/.env.example apps/api/.env      # copy, don't rename: the examples are committed
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

- Web app: http://localhost:5173
- API: http://localhost:5001 (the web dev server forwards `/api` to it)

## Database (Supabase)

The schema lives in `supabase/migrations` and is applied with the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started):

```bash
supabase login
supabase link --project-ref <project-ref>   # from the dashboard URL
supabase db push --linked                   # applies any new migrations
npm run db:check -w @replate/api            # checks the access rules with throwaway accounts
npm run db:types                            # regenerates apps/api/src/db/database.types.ts
```

Fill in the Supabase URL and keys in both `.env` files from Project Settings → API Keys. Run `db:check` against the dev project only: it creates and deletes test users.

In the dashboard under Authentication, set:

- **URL Configuration:** Site URL `http://localhost:5173` (the production URL on the production project), and add `http://localhost:5173/**` to Redirect URLs, so confirmation and password-reset links come back to the app.
- **Providers → Email:** minimum password length 8, to match the sign-up form.

Supabase's built-in email sender allows only a few emails an hour; set up custom SMTP before launch.

For a demo, `npm run db:seed-demo -w @replate/api` creates demo donor, NGO and admin accounts with realistic donations around Bengaluru (dev project only). They all use `DEMO_PASSWORD` from `apps/api/.env`. Re-running it replaces them, so pickup times stay fresh. The walkthrough is in `docs/demo-script.md`.

New NGO accounts start as `pending` and can't browse or claim until an admin verifies them. Admins are promoted by hand in the Supabase SQL editor: `update profiles set role = 'admin' where id = '<user id>';`

## API

All routes except `/api/health` need a Supabase access token: `Authorization: Bearer <token>`. The API queries Supabase as that user, so the database's access rules apply to every request. Errors always look like `{ "error": { "code", "message" } }`.

| Method and path                                                           | Who    | Does                                                                             |
| ------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `GET /api/me`, `PATCH /api/me`                                            | Anyone | Own profile                                                                      |
| `PATCH /api/me/ngo`                                                       | NGO    | Service radius                                                                   |
| `POST /api/donations`                                                     | Donor  | Create a donation                                                                |
| `GET /api/donations/mine?q=&status=`                                      | Donor  | Own donations, with search and status filter                                     |
| `GET /api/donations/:id`                                                  | Both   | One donation, its status history, and the other party once claimed               |
| `PATCH /api/donations/:id`                                                | Donor  | Edit while available                                                             |
| `DELETE /api/donations/:id`                                               | Donor  | Delete unless claimed or collected                                               |
| `POST /api/donations/:id/cancel`                                          | Donor  | Cancel before collection                                                         |
| `GET /api/donations/nearby?lat=&lng=&radiusKm=&q=&category=&dietaryType=` | NGO    | Open donations nearby, nearest first                                             |
| `POST /api/donations/:id/claim`                                           | NGO    | Claim (only one NGO can win)                                                     |
| `POST /api/donations/:id/release`                                         | NGO    | Give a claim back                                                                |
| `POST /api/donations/:id/collect`                                         | NGO    | Mark collected                                                                   |
| `GET /api/donations/claimed?status=`                                      | NGO    | Own pickups                                                                      |
| `GET /api/geocode?q=`, `GET /api/geocode/reverse?lat=&lng=`               | Anyone | Address search (OpenStreetMap Nominatim, cached and limited to 1 request/second) |
| `GET /api/admin/ngos?verification=`                                       | Admin  | NGOs, e.g. the pending queue                                                     |
| `POST /api/admin/ngos/:id/verification`                                   | Admin  | Verify or reject an NGO                                                          |

`npm run api:check -w @replate/api` walks the whole flow over HTTP against the dev project with throwaway accounts.

## Troubleshooting

**`fetch failed` / `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on campus or office Wi-Fi.** Some networks (for example Sophos firewalls) inspect HTTPS by re-signing certificates with their own authority. macOS trusts it, Node.js does not. Export the authority from your keychain and point Node at it:

```bash
security find-certificate -a -c "Sophos" -p > ~/.network-ca.pem
echo 'export NODE_EXTRA_CA_CERTS="$HOME/.network-ca.pem"' >> ~/.zshrc
```

Never work around it by turning off certificate checks.

## Scripts

Run from the repository root.

| Command             | Does                                                   |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Starts the web app and API together, reloading on save |
| `npm run build`     | Production builds of every workspace                   |
| `npm run typecheck` | TypeScript checks for every workspace                  |
| `npm test`          | Runs the test suites                                   |
| `npm run lint`      | Lints with oxlint                                      |
| `npm run format`    | Formats with Prettier                                  |
| `npm run check`     | Everything CI runs: lint, format, types, tests, build  |
| `npm run db:types`  | Regenerates database types after a migration           |

## Environment variables

Each app has a `.env.example` listing what it reads. Real `.env` files are never committed. Values prefixed `VITE_` are bundled into the browser, so only public values (such as the Supabase publishable key) go there; secrets stay in `apps/api/.env`.
