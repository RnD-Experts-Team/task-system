# Public Roadmap & Feedback — frontend deployment guide

Branch: `feature/roadmap` (repo `RnD-Experts-Team/task-system`).

Adds the **public roadmap site** (`/roadmap`, `/changelog`, anonymous, no login) and the **Roadmap admin console** (`/roadmap-admin/*`, staff) to the React app. Deploy the backend first (see the `TasksSystem` repo's `ROADMAP_DEPLOYMENT.md`); the public pages call `/api/public/roadmap/*` and the admin console calls `/api/roadmap/admin/*`.

---

## 1. What changed

Existing files touched: `src/App.tsx` (lazy staff `Layout`, public and admin routes), `src/components/app-sidebar.tsx` ("Roadmap" group), `src/hooks/useBreadcrumbs.ts` (labels), `src/services/api.ts` (added a `patch` method), `index.html` (icon font no longer blocks first paint; Outfit font preload).

New: `src/app/roadmap-public/**`, `src/app/roadmap-admin/**`, `public/robots.txt`, `public/og-default.png`.

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

Publish `dist/` to the static host. Check that `dist/robots.txt` and `dist/og-default.png` exist (they come from `public/`).

## 5. nginx (frontend host `tasks.rdexperts.tech`)

The site is a single-page app, so nginx already serves `index.html` for every path. Two additions are needed:

1. **Crawler preview shell.** Link scrapers (WhatsApp, Slack, LinkedIn, X, Facebook) and search bots do not reliably run JavaScript, so a shared `/roadmap/...` link would show a generic title with no preview. For known bot user-agents, nginx fetches a small server-rendered page from the API instead (real title, description, canonical, OG tags, JSON-LD and readable content). Humans still get the SPA.
2. **`/sitemap.xml` and the changelog RSS feed**, proxied from the API.

**A. `http` context** — e.g. `/etc/nginx/conf.d/roadmap.conf`:

```nginx
map $http_user_agent $rm_is_bot {
    default 0;
    ~*(googlebot|google-inspectiontool|bingbot|duckduckbot|yandexbot|baiduspider|applebot|slackbot|twitterbot|facebookexternalhit|facebot|linkedinbot|whatsapp|telegrambot|discordbot|skypeuripreview|redditbot|pinterestbot|embedly|iframely|mastodon|vkshare|w3c_validator|gptbot|claudebot|perplexitybot) 1;
}

# Optional 5-minute micro-cache of the shell (protects the API from crawler bursts)
proxy_cache_path /var/cache/nginx/rm_seo levels=1:2 keys_zone=rm_seo:5m max_size=50m inactive=10m use_temp_path=off;
```

**B. Inside the existing `server { ... }` block** for `tasks.rdexperts.tech` (keep your current `root`, TLS and `location /` SPA fallback):

```nginx
    # Sitemap and RSS come straight from the API (not bot-gated)
    location = /sitemap.xml {
        proxy_pass https://tasksbackend.rdexperts.tech/api/seo/sitemap.xml;
        proxy_ssl_server_name on;
        proxy_set_header Host tasksbackend.rdexperts.tech;
    }
    location = /changelog/feed.xml {
        proxy_pass https://tasksbackend.rdexperts.tech/api/public/roadmap/changelog/feed.xml;
        proxy_ssl_server_name on;
        proxy_set_header Host tasksbackend.rdexperts.tech;
    }

    # Public roadmap + changelog: bots get the preview shell, humans get the SPA.
    # (Does not match /roadmap-admin: that has "-" right after "roadmap".)
    location ~ ^/(roadmap|changelog)(/|$) {
        add_header Vary User-Agent;
        if ($rm_is_bot) {
            rewrite ^ /__rm_seo$uri last;
        }
        try_files $uri /index.html;
    }

    location ^~ /__rm_seo/ {
        internal;
        rewrite ^/__rm_seo/(.*)$ /api/seo/$1 break;    # the query string is preserved
        proxy_pass https://tasksbackend.rdexperts.tech;
        proxy_ssl_server_name on;
        proxy_set_header Host tasksbackend.rdexperts.tech;
        proxy_set_header Accept "text/html";
        proxy_read_timeout 10s;

        proxy_cache rm_seo;
        proxy_cache_key "$scheme$host$request_uri";
        proxy_cache_valid 200 5m;
        proxy_cache_valid 301 404 1m;
        add_header Vary User-Agent;
    }
```

Also confirm gzip (or brotli) is on for JS/CSS/JSON/SVG on this host. A test server without compression measured a mobile first load ~2.3 s LCP; compression and HTTP/2 (which the host already uses) are what bring that down in production:

```nginx
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
```

Test and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6. Verify after deploy

```bash
# Humans get the SPA shell (no roadmap-specific <title>)
curl -s -A "Mozilla/5.0" https://tasks.rdexperts.tech/roadmap | grep -i "<title>"

# Crawlers get the server-rendered preview (real title, canonical, OG, JSON-LD)
curl -s -A "Googlebot" https://tasks.rdexperts.tech/roadmap | grep -Ei "<title>|canonical|og:title|ld\+json"
curl -s -A "facebookexternalhit/1.1" https://tasks.rdexperts.tech/roadmap/<board-slug> | grep -i "og:"

curl -s https://tasks.rdexperts.tech/sitemap.xml | head
curl -s https://tasks.rdexperts.tech/changelog/feed.xml | head
curl -s https://tasks.rdexperts.tech/robots.txt
curl -sI https://tasks.rdexperts.tech/og-default.png | head -3
```

Then in a browser (desktop and phone):

1. `/roadmap` shows boards; open a board, search, sort, filter; submit an idea (it is held for review by default) and confirm it appears in **Roadmap → Moderation** in the admin console.
2. Approve it, refresh the public feed: it is listed. Vote, then reload: the vote is still marked.
3. Devtools → Network on any public page: **no `Authorization` header** and **no request to `/login`**.
4. Paste a `/roadmap/...` post link into Slack/WhatsApp: a titled preview card appears.
5. Optional: Lighthouse (mobile) on a board page. On a local test build it scored Accessibility 100, Best Practices 100, SEO 100.

## 7. Notes

- **Uploaded logos** (Settings → Branding) are served from the API host at `APP_URL/storage/...`. If the logo does not appear, check the backend's `storage:link` and `APP_URL` (see the backend guide).
- **Theme:** brand colour, radius and default theme come from the admin Settings and apply only inside the public site; the staff app is untouched. Colours that would be unreadable are adjusted automatically by the server.
- **Anonymous visitors** are identified by a random token kept in their browser (`localStorage`, key `pne.rm.v1`). Clearing it makes them a new visitor.
- **Adding Arabic later:** all public UI copy lives in `src/app/roadmap-public/lib/strings.ts` and layouts use logical CSS properties, so translation and RTL can be added without restructuring.

## 8. Rollback

Redeploy the previous `dist/` and remove the roadmap `location` blocks and the `map` from nginx (reload). No data lives in the frontend.
