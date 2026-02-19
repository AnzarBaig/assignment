# Project Overview

QuessCorpAssignment frontend — a Next.js application.

## Tech Stack

- **Framework:** Next.js 16 (Pages Router — `src/pages/`)
- **Language:** TypeScript (strict mode)
- **React:** 19
- **UI:** shadcn/ui + Radix UI + Base UI
- **Styling:** Tailwind CSS 4
- **Data Fetching:** React Query (@tanstack/react-query) + Axios
- **Package Manager:** bun

## Commands

- `bun dev` — start dev server
- `bun run build` — production build
- `bun run lint` — run ESLint

## Project Structure

```
src/
  api/
    client.ts                    # Axios instance + auth interceptors
    services/
      projectService.ts          # CRUD methods (all POST)
  constant/
    apiEndpoints.ts              # API_BASE_URL + API_ENDPOINTS
  types/
    projectTypes.ts              # Request/response interfaces
  utils/
    queryKeys.ts                 # React Query cache key factories
  hooks/
    useProject.ts                # React Query hooks (queries + mutations)
  components/
    ui/                          # shadcn UI components
  lib/
    utils.ts                     # cn() utility (clsx + tailwind-merge)
  pages/
    _app.tsx                     # QueryClientProvider + ThemeProvider
    _document.tsx
    index.tsx
  styles/
    globals.css
```

## Data Fetching Architecture

All API calls use POST. The pipeline follows this flow:

```
constant/apiEndpoints.ts → types/*.ts → api/services/*.ts → utils/queryKeys.ts → hooks/*.ts
```

### Adding a new entity

1. Add endpoint routes to `src/constant/apiEndpoints.ts`
2. Create `src/types/<entity>Types.ts` with request/response interfaces
3. Create `src/api/services/<entity>Service.ts` — plain object, `apiClient.post()`, returns `response.data`
4. Add key factory to `src/utils/queryKeys.ts`
5. Create `src/hooks/use<Entity>.ts` — useQuery for reads, useMutation for writes

No changes to `client.ts` or `_app.tsx` needed.

### Cache invalidation strategy

- **Create:** invalidate `all` (refetch lists)
- **Update:** invalidate specific `detail` + `all`
- **Delete:** `removeQueries` for deleted item + invalidate `all`

## Conventions

- Path alias: `@/*` maps to `./src/*`
- Services are plain objects (not classes), no error handling (React Query handles it)
- Query keys use hierarchical factories with `as const`
- Auth token stored in `localStorage("authToken")`, attached via Axios request interceptor
- Axios response interceptor redirects to `/login` on 401/403
