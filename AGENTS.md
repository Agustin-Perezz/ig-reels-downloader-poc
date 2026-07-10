## Project

Next.js (App Router) starter with React 19, TypeScript strict mode, base-ui + shadcn components, Biome for lint/format, Playwright for E2E, and Sentry for monitoring.

## Commands

```bash
pnpm dev          # Start dev server
pnpm typecheck    # TypeScript type checking (tsc --noEmit)
pnpm lint         # Biome check
pnpm format       # Biome format --write
pnpm test         # Playwright run
pnpm test:ui      # Playwright UI mode
```

## Key Constraints

Never use magic strings—always use named constants or enums for values that could change or have semantic meaning.

Never declare inline types in function parameters—use type aliases instead.

Server Actions and data fetchers live in `actions.ts` with `"use server"`. Keep the `"use client"` boundary as low in the tree as possible—prefer Server Components and push client directives down to leaf components.

Required env vars must fail loudly—if missing, the app crashes, no defaults.

## Guidelines

If you need to write frontend code, see [Component Patterns](./docs/01_COMPONENT-PATTERNS.md) and [Frontend Folder Structure](./docs/02_FRONTEND-FOLDER-STRUCTURE.md).

If you need to write TypeScript, see [TypeScript Standards](./docs/04_TYPESCRIPT-STANDARDS.md).

If you need to write tests, see Playwright patterns in the `tests/` directory and `playwright.config.ts`.