# Work Sessions module — frontend deployment guide

Branch: `feature/work-sessions` (repo `RnD-Experts-Team/task-system`).

Adds the **Work Sessions** pages (My Day, History, All Sessions, Reports, Monthly Ratings) to the new React frontend. Deploy the backend (`TasksSystem`, see its `WORK_SESSIONS_DEPLOYMENT.md`) **first** — the pages call `/api/work-sessions/*` routes and rely on the five new permissions.

---

## 1. What changed

Existing files touched (3):

| File | Change |
|---|---|
| `src/App.tsx` | 5 lazy imports + 6 routes under `/work-sessions/*` |
| `src/components/app-sidebar.tsx` | new collapsible group **Work Sessions** with permission-based filtering |
| `src/hooks/useBreadcrumbs.ts` | labels for the new routes |

New: everything under `src/app/work-sessions/` (types, service, stores, hooks, components, pages).

No new npm packages — `package.json` / lock files are unchanged. Everything used (`@dnd-kit`, `recharts`, `date-fns`, `laravel-echo`, `pusher-js`, shadcn components) was already a dependency.

## 2. Routes and who sees them

| Route | Access |
|---|---|
| `/work-sessions/my-day`, `/work-sessions/history` | any logged-in user |
| `/work-sessions/admin/sessions` | `admin` role or `view all work sessions` |
| `/work-sessions/admin/reports` | `admin` role or `view work session reports` (export button also needs `export work session reports`) |
| `/work-sessions/admin/ratings` | `admin` role or `rate work sessions` |

The sidebar hides entries the user cannot access; direct URLs redirect to the dashboard.

## 3. Environment variables (build-time)

Vite bakes `VITE_*` values into the bundle at **build** time. Create `.env.production` (or `.env`) next to `package.json` before building; `.env*` files are git-ignored.

```env
# Base URL of the Laravel API, including /api
VITE_API_URL=https://api.example.com/api

# Public websocket endpoint of the Reverb server (see backend guide §6)
VITE_REVERB_APP_KEY=<same value as REVERB_APP_KEY in the backend .env>
VITE_REVERB_HOST=ws.example.com      # or the API host if you expose the port directly
VITE_REVERB_PORT=443                 # 443 when proxied behind TLS; 6001 for the raw docker port
VITE_REVERB_SCHEME=https             # https => wss://, http => ws://
```

Rules:
- `VITE_REVERB_APP_KEY` must match the backend's `REVERB_APP_KEY`, otherwise the "Live" badge stays on "Connecting…" and nothing updates in real time (the pages still work, just without live updates).
- An `https://` site cannot open `ws://` (mixed content) — use `https` + a TLS-terminating proxy for Reverb.
- The API must allow the frontend origin (Laravel's default CORS is `*` for `api/*`; nothing to change unless you have restricted it).

## 4. Build and publish

Node 20+ (built with Node 24).

```bash
git fetch origin && git checkout feature/work-sessions && git pull
npm ci
npm run lint          # pre-existing warnings in unrelated files are expected; the module is clean
npm run build         # runs tsc -b + vite build → dist/
```

Upload `dist/` to the static host. It is a single-page app: every unknown path must fall back to `index.html`.

```nginx
server {
    listen 443 ssl;
    server_name app.example.com;
    root /var/www/task-system/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

If you change any `VITE_*` value later, **rebuild** — editing the env file on the server has no effect on an existing `dist/`.

## 5. Verify after deploy

1. Log in as an employee: sidebar shows **Work Sessions → My Day, History** only.
2. My Day → **Start my day** → add an item (optionally link an assigned task) → drag to reorder → **End of day review** → set outcomes → **Confirm day** → page becomes read-only.
3. Log in as an admin: sidebar also shows **All Sessions, Reports, Monthly Ratings**.
4. All Sessions: badge shows **Live** (green). If it shows "Connecting…", check `VITE_REVERB_*` and the websocket proxy (browser devtools → Network → WS).
5. Reports: run the current month → KPI tiles, chart and per-user table render; **By task** tab groups linked tasks; **Export monthly PDF** downloads a `.zip`.
6. Monthly Ratings: save a score → refresh → it persists; **Average** tab returns per-user and overall averages.
7. Browser console has no errors on these pages.

## 6. Rollback

Redeploy the previous `dist/` build (or check out the previous branch/tag and rebuild). No data lives in the frontend.

## 7. Notes

- Dates: the API sends `work_date` as `YYYY-MM-DD` in the company timezone and timestamps as ISO-8601 UTC; the UI formats timestamps in the viewer's local timezone.
- The Reverb channel `work-sessions.admin` is public (same as the existing `clocking.manager`); payloads contain only user names, dates, statuses and counts.
- The admin user picker uses `GET /work-sessions/admin/users` (all users), not the paginated `/users` endpoint.
