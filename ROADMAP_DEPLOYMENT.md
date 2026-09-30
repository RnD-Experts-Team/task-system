# Public Roadmap & Feedback — frontend deployment guide

Branch: `feature/roadmap` (repo `RnD-Experts-Team/task-system`).

Adds the **public roadmap site** (`/roadmap`, `/changelog`, anonymous, no login) and the **Roadmap admin console** (`/roadmap-admin/*`, staff) to the React app. Deploy the backend first (see the `TasksSystem` repo's `ROADMAP_DEPLOYMENT.md`); the public pages call `/api/public/roadmap/*` and the admin console calls `/api/roadmap/admin/*`.

---

## 1. What changed

Existing files touched: `src/App.tsx` (lazy staff `Layout`, public and admin routes), `src/components/app-sidebar.tsx` ("Roadmap" group), `src/hooks/useBreadcrumbs.ts` (labels), `src/services/api.ts` (added a `patch` method), `index.html` (icon font no longer blocks first paint; Outfit font preload).

New: `src/app/roadmap-public/**`, `src/app/roadmap-admin/**`, `public/robots.txt` (blocks all crawlers: this is an internal system).

No new npm packages.

Notable side effect (good): the staff `Layout` (sidebar, Echo/pusher, etc.) is now lazy-loaded, so **every anonymous page, including the existing `/support-ticket` form, downloads less JavaScript** (entry chunk 93 KB → 72 KB gzipped).

## 2. Routes

| Route | Who |
|---|---|
| `/roadmap`, `/roadmap/:board`, `/roadmap/:board/roadmap`, `/roadmap/:board/p/:number-:slug`, `/changelog`, `/changelog/:slug` | Anyone (anonymous) |
| `/roadmap-admin` (Overview), `/roadmap-admin/moderation`, `/roadmap-admin/visitors` | `admin` role or `moderate roadmap` |
| `/roadmap-admin/posts`, `/roadmap-admin/board`, `/roadmap-admin/boards`, `/roadmap-admin/tags` | `admin` role or `manage roadmap` |
| `/roadmap-admin/changelog`, `/roadmap-admin/changelog/new`, `/roadmap-admin/changelog/:id` | `admin` role or `manage changelog` |
| `/roadmap-admin/settings` | `admin` role or `manage roadmap settings` |

The sidebar hides entries the user cannot use; direct URLs redirect to the dashboard.

## 3. Build-time environment (Vite bakes `VITE_*` in at build time)

```env
# Base URL of the Laravel API, including /api  (REQUIRED)
VITE_API_URL=https://tasksbackend.rdexperts.tech/api

# Only for the staff app's existing realtime features (clocking, work sessions). The public roadmap
# does not use websockets. Set them as described in WORK_SESSIONS_DEPLOYMENT.md.
VITE_REVERB_APP_KEY=<same as backend REVERB_APP_KEY>
VITE_REVERB_HOST=<public ws host>
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

Changing any `VITE_*` value later requires a **rebuild**; editing the env file on the server does nothing to an existing `dist/`.

## 4. Build and publish

Node 20+ (built with Node 24).

```bash
git fetch origin && git checkout feature/roadmap && git pull
npm ci
npm run build          # tsc -b + vite build -> dist/
```

Publish `dist/` to the static host. Check that `dist/robots.txt` exists (it comes from `public/`).

## 5. nginx (frontend host `tasks.rdexperts.tech`)

**No roadmap-specific nginx rules are needed.** The site is a single-page app, so the existing `try_files $uri /index.html` already serves `/roadmap/...` and `/changelog/...`. The system is internal, so there is no search-engine or link-preview support (no sitemap, no crawler shell). `robots.txt` tells crawlers to stay out. The changelog RSS link in the footer points straight at the API (`VITE_API_URL` + `/changelog/feed.xml`).

Make sure `/robots.txt` is served as a file from `dist/` and is not swallowed by the SPA fallback (a normal `try_files $uri /index.html` does this).

Recommended (not roadmap-specific): gzip or brotli for JS/CSS/JSON/SVG and long-lived caching for hashed assets. A test server without compression measured a mobile first load of about 2.3 s LCP; compression and HTTP/2 are what bring that down in production.

```nginx
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
```

Test and reload if you changed anything:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6. Verify after deploy

```bash
curl -s https://tasks.rdexperts.tech/robots.txt                      # "Disallow: /"
curl -s https://tasksbackend.rdexperts.tech/api/public/roadmap/changelog/feed.xml | head
curl -s -o /dev/null -w "%{http_code}\n" https://tasks.rdexperts.tech/roadmap   # 200 (the SPA)
```

Then in a browser (desktop and phone):

1. `/roadmap` shows boards; open a board, search, sort, filter; submit an idea (it is held for review by default) and confirm it appears in **Roadmap → Moderation** in the admin console.
2. Approve it, refresh the public feed: it is listed. Vote, then reload: the vote is still marked.
3. Devtools → Network on any public page: **no `Authorization` header** and **no request to `/login`**.
4. Optional: Lighthouse (mobile) on a board page. On a local test build it scored Accessibility 100 and Best Practices 100.

## 7. Notes

- **Uploaded logos** (Settings → Branding) are served from the API host at `APP_URL/storage/...`. If the logo does not appear, check the backend's `storage:link` and `APP_URL` (see the backend guide).
- **Theme:** brand colour, radius and default theme come from the admin Settings and apply only inside the public site; the staff app is untouched. Colours that would be unreadable are adjusted automatically by the server.
- **Anonymous visitors** are identified by a random token kept in their browser (`localStorage`, key `pne.rm.v1`). Clearing it makes them a new visitor.
- **Adding Arabic later:** all public UI copy lives in `src/app/roadmap-public/lib/strings.ts` and layouts use logical CSS properties, so translation and RTL can be added without restructuring.

## 8. Rollback

Redeploy the previous `dist/`. No data lives in the frontend and nginx was not changed.
