# Platform UI

A Vite + React dashboard playground showcasing the Clarity Compass decision-making experience.

## Getting started

Install dependencies (pnpm, npm, or yarn all work):

```bash
pnpm install
pnpm start
```

The development server will be available at `http://localhost:5173` by default.

## Available scripts

- `pnpm start` – start the Vite dev server
- `pnpm build` – type-check and build a production bundle
- `pnpm preview` – preview the production build
- `pnpm lint` – run ESLint with the TypeScript ruleset

## Project structure

```
src/
  App.tsx                # Application shell mounting the dashboard
  main.tsx               # React DOM bootstrap
  components/
    ui/                  # Reusable UI primitives (button, card, badge, separator)
  features/
    dashboard/           # Dashboard feature module
      components/        # Dashboard-specific React components
      constants/         # Mock data and configuration constants
      types/             # Shared TypeScript types for the feature
  lib/
    utils.ts             # Shared helper utilities (e.g. class name merger)
```

The dashboard feature exports a ready-to-render `<Dashboard />` component from `@/features/dashboard`.
