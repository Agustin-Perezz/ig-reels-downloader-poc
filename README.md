# next-scaffold

A production-ready [Next.js](https://nextjs.org) starter built on the App Router with React 19, TypeScript strict mode, base-ui + shadcn components, Tailwind CSS v4, Biome for lint/format, Playwright for E2E, and Sentry for monitoring. The scaffold follows a shift-left approach: linting, type checking, security scanning, and E2E tests run on every push and pull request so issues are caught as early as possible in the development cycle.

## Tech Stack

| Area            | Choice                                        |
| --------------- | --------------------------------------------- |
| Framework       | Next.js 16 (App Router)                        |
| UI runtime      | React 19                                       |
| Language        | TypeScript (strict)                           |
| Components      | base-ui + shadcn                               |
| Styling         | Tailwind CSS v4                                |
| Forms           | react-hook-form + zod                          |
| Lint / Format   | Biome 2                                        |
| E2E             | Playwright (Chromium)                          |
| Monitoring      | Sentry (`@sentry/nextjs`)                      |
| Security scan   | Snyk (SARIF → GitHub Code Scanning)            |
| Package manager | pnpm 9                                         |
| Git hooks       | Husky + nano-staged                            |

## Folder Structure

```
next-scaffold/
├── .github/
│   └── workflows/
│       └── ci.yml                # Lint, typecheck, E2E, build pipeline
├── docs/                         # Engineering guidelines
│   ├── 01_COMPONENT-PATTERNS.md
│   ├── 02_FRONTEND-FOLDER-STRUCTURE.md
│   └── 04_TYPESCRIPT-STANDARDS.md
├── public/                       # Static assets served at root
├── src/
│   ├── app/                      # App Router routes (pages, layouts, actions)
│   ├── components/
│   │   └── ui/                   # Reusable base-ui / shadcn primitives
│   └── lib/
│       └── utils.ts              # Shared utilities (cn, helpers)
├── tests/                        # Playwright E2E specs
├── biome.json                    # Linter & formatter config
├── next.config.ts                # Next.js configuration
├── package.json
├── playwright.config.ts
└── tsconfig.json                 # Path alias: @/* -> ./src/*
```

See [`AGENTS.md`](./AGENTS.md) for the engineering conventions agents and contributors should follow.

## Setup

1. Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies and Playwright browsers:

   ```bash
   pnpm install
   pnpm test:install
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Start development server                  |
| `pnpm build`        | Production build                         |
| `pnpm start`        | Start production server                  |
| `pnpm lint`         | Run Biome lint & format checks           |
| `pnpm format`       | Auto-format with Biome                   |
| `pnpm typecheck`    | Run TypeScript type checking (`tsc --noEmit`) |
| `pnpm test`         | Run Playwright E2E tests                 |
| `pnpm test:ui`      | Run Playwright with interactive UI       |
| `pnpm test:install` | Install Playwright Chromium browser      |

## Git Hooks

[Husky](https://typicode.github.io/husky/) manages Git hooks:

- **pre-commit**: runs `nano-staged`, which executes `biome check --staged` on staged files.
- **pre-push**: runs `pnpm typecheck && pnpm test`.

Hooks are installed automatically via the `prepare` script when running `pnpm install`.

## CI (GitHub Actions)

The `.github/workflows/ci.yml` workflow runs on push to `main` and on pull requests:

1. Lint (Biome)
2. Typecheck (`tsc --noEmit`)
3. E2E tests (Playwright, Chromium only)
4. Build (`next build` with Sentry source map upload)

A `snyk` job runs in parallel, scanning dependencies for high-severity vulnerabilities and uploading the results as SARIF to GitHub Code Scanning. It is allowed to continue on error so findings do not block the pipeline.

### Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret                   | Description                            |
| ------------------------ | -------------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (client + server)           |
| `SENTRY_AUTH_TOKEN`      | Sentry auth token for source map upload |
| `SENTRY_ORG`             | Sentry organization slug               |
| `SENTRY_PROJECT`         | Sentry project slug                    |
| `SNYK_TOKEN`             | Snyk API token for vulnerability scans |

## Documentation

- [Component Patterns](./docs/01_COMPONENT-PATTERNS.md)
- [Frontend Folder Structure](./docs/02_FRONTEND-FOLDER-STRUCTURE.md)
- [TypeScript Standards](./docs/04_TYPESCRIPT-STANDARDS.md)

