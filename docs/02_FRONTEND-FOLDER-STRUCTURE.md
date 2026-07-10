# Frontend Folder Structure

## Route Folder Pattern

Every route follows this structure:

```
src/app/{feature}/
├── page.tsx                       # Composition only — imports + arranges components
├── layout.tsx                     # Optional: route-level layout (keep flat, no nesting)
├── loading.tsx                    # Optional: Suspense fallback for the route
├── error.tsx                      # Optional: Error boundary for the route
├── actions.ts                     # Server Actions & data fetchers ("use server")
└── components/
    ├── {Feature}Header.tsx        # Page title, description, action buttons
    ├── {Feature}List.tsx          # Iterates items, delegates to card
    ├── {Feature}EmptyState.tsx    # Empty list message/CTA
    ├── {Feature}Card.tsx          # Single item display
    ├── {Feature}CreateForm.tsx    # react-hook-form + zod wiring ("use client")
    └── {Feature}FormFields.tsx    # Input fields only, no <form> tag
```

## Rules

- `page.tsx` is composition-only: imports and arranges components, nothing else. No logic, no inline styles, no conditionals beyond prop-passing. Server data fetching happens here (async Server Component) and the data is passed down as props.
- `actions.ts` handles all server logic: data fetchers and Server Actions (`"use server"`). See [Component Patterns](./01_COMPONENT-PATTERNS.md) for the container and use-case wiring pattern.
- `components/` holds every sub-component for that route. Component files are named with the feature prefix (e.g. `ProductCard`, not `Card`).
- Components that use hooks, events, or browser APIs must start with `"use client"`. Keep the server/client boundary as low in the tree as possible - prefer Server Components and push `"use client"` down to leaf components.

## Example

```
src/app/products/
├── page.tsx
├── actions.ts
└── components/
    ├── ProductHeader.tsx
    ├── ProductList.tsx
    ├── ProductEmptyState.tsx
    ├── ProductCard.tsx
    ├── ProductCreateForm.tsx
    └── ProductFormFields.tsx
```

## Root Layout

`src/app/layout.tsx` renders the `<html>`/`<body>` shell, fonts, and global providers (e.g. Toaster). No nested layouts unless strictly required.

```tsx
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
```

## Component Limits

Each component file has a 50-line hard limit. Split proactively at 40 lines. See [Component Patterns](./01_COMPONENT-PATTERNS.md) for details.