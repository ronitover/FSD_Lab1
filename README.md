# RePlate

RePlate connects surplus food from restaurants, stores and individuals with nearby NGOs before it goes to waste. Donors post what they have; NGOs nearby claim it and collect it.

## Repository layout

| Path              | What it is                                                                |
| ----------------- | ------------------------------------------------------------------------- |
| `apps/web`        | React + TypeScript web app (Vite)                                         |
| `apps/api`        | Express + TypeScript REST API                                             |
| `packages/shared` | Types, constants and validation rules used by both apps                   |
| `supabase`        | Database migrations and seed data (Supabase / Postgres)                   |
| `docs`            | Report, screenshots and design decisions                                  |
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
```

Fill in the Supabase URL and keys in both `.env` files from Project Settings → API Keys. Run `db:check` against the dev project only: it creates and deletes test users.

New NGO accounts start as `pending` and can't browse or claim until an admin verifies them.

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

## Environment variables

Each app has a `.env.example` listing what it reads. Real `.env` files are never committed. Values prefixed `VITE_` are bundled into the browser, so only public values (such as the Supabase publishable key) go there; secrets stay in `apps/api/.env`.
