# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint (flat config, Next.js core-web-vitals + TS rules)
```

No test runner is configured in this project.

## Architecture

Two-page Next.js 15 App Router application for browsing and visualizing Figma design token variables.

**Page flow:**
1. `/` — User enters Figma PAT + Team ID, browses projects/files via checkboxes, clicks "Load variables" → stores data in context and navigates to `/viewer`
2. `/viewer` — Tabbed library view with a collapsible group sidebar on the left and variable tables on the right; supports multi-mode display and CSV/JSON export

**Data pipeline:**
```
Figma REST API
  → /api/figma (Next.js proxy, avoids CORS)
  → src/lib/figma-api.ts (fetch wrappers, 200ms rate-limit between files)
  → AppContext (global state, localStorage persistence)
  → src/lib/variable-resolver.ts (alias resolution, RGBA→hex conversion)
  → src/lib/variable-parser.ts (group tree, export)
  → Components (VariableTable, GroupSidebar, ColorSwatch, TypeBadge, ModeSelector)
```

**State management:** `src/context/AppContext.tsx` — single React Context holding `token`, `teamId`, `selectedFiles`, `libraries`. Consumed via `useApp()` hook.

## Key Patterns

**Variable grouping:** Group paths are inferred from `/`-separated variable names — all segments except the last become the group path (e.g. `colors/brand/primary` → group `colors/brand`, name `primary`). Logic lives in `getVariableGroupPath()` in [src/lib/variable-parser.ts](src/lib/variable-parser.ts).

**Alias resolution:** `VARIABLE_ALIAS` values are resolved recursively (max depth 10) via `resolveAliasName()` and `resolveColorValue()` in [src/lib/variable-resolver.ts](src/lib/variable-resolver.ts). A unified `Map<id, FigmaVariable>` built by `buildVariableMap()` covers all loaded libraries.

**Token classification:** `getTokenType()` returns `'brand-dependent'` (alias) or `'static'` (hardcoded value) — rendered as colored badges via `TypeBadge`.

**Multi-mode support:** Collections can have multiple modes (e.g. light/dark). `ModeSelector` toggles between "All modes" (side-by-side columns) and a single filtered mode.

**React Compiler is enabled** (`reactCompiler: true` in `next.config.ts`) — do not add manual `useMemo` / `useCallback` unless there is a specific reason; the compiler handles memoization.

**Tailwind v4** — configuration is in [src/app/globals.css](src/app/globals.css) via `@theme` directives. There is no `tailwind.config.js`.

## Environment Variables

Optional — values can also be entered in the UI and are persisted to `localStorage`.

```
NEXT_PUBLIC_FIGMA_TOKEN=figd_...     # Pre-fill Figma Personal Access Token
NEXT_PUBLIC_FIGMA_TEAM_ID=123...     # Pre-fill Team ID
```
