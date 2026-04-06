# Repository Guidelines

## Project Structure & Module Organization
- `www/`: Next.js app (App Router). All UI, SSR routes, and middleware live here.
  - `app/`: Single source of truth for pages.
  - `components/`: Reusable UI, charts, tables.
  - `lib/`: Domain and utility modules (pace logic, metadata, theme).
  - `proxy.ts`: Middleware rewrite to `/ssr/[target]` (defaults to `champion`).
- `data/`: Python data pipeline (Dagster) and tests.
- `public/`: Static assets (e.g., flags).

## Build, Test, and Development Commands
- Web app (from repo root):
  - `pnpm -C www dev`: Run Next.js locally.
  - `pnpm -C www build`: Build (generates Prisma client, pushes schema, Next build).
  - `pnpm -C www start`: Start the production server.
  - `pnpm -C www lint`: Lint and import‑order checks.
  - `pnpm -C www typegen`: Generate types from Next for typechecking.
  - `pnpm -C www typecheck`: Typechecks.
- Data pipeline:
  - `cd data && pytest`: Run Python tests.

## Coding Style & Naming Conventions
- TypeScript/React:
  - Prefer explicit props and narrow types over `any`.
  - Server components by default; `"use client"` only when necessary.
  - Import order (enforced):
    1) Group all multi‑specifier imports (e.g., `import { A, B } from ...`) before all single‑specifier imports (e.g., `import A from ...`). Single-specifier non-default imports like `import { A } from ...` are treated the same as single-specifier default imports.
    2) Within each group, sort alphabetically by the first imported identifier (ignore the `type` keyword for sorting), where  capital letters are sorted before lower case letters.
- Python: idiomatic, black‑style formatting (PEP8) and pytest naming `test_*.py`.

## Testing Guidelines
- Web: Component behavior is verified via data/fixtures and manual runs; lint must pass.
- Data: `pytest -q` in `data/`. Prefer small, deterministic tests near the code under test.

## Commit & Pull Request Guidelines
- Single‑thesis commits and stacked diffs. Each commit should do one thing only.
- Messages: imperative mood, concise subject (e.g., "Add target key enum"), optional body for rationale.
- PRs: describe scope and intent, link issues, and include before/after screenshots when UI changes.
- For changes in `www`, *always* run `pnpm -C www lint` and `pnpm -C www typegen && pnpm -C www typecheck`. These two commands *must* pass before any commit is made.

