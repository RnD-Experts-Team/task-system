// Warms the JS chunk of the page the visitor landed on.
//
// The layout only renders <Outlet/> after the site config has arrived, so without this the page
// chunk would be requested AFTER that round trip (chunk -> config -> page chunk -> data). Calling
// the same dynamic imports the router uses puts the page chunk on the wire in parallel with the
// config request; the module cache makes the later React.lazy resolve instantly.

const routes: [RegExp, () => Promise<unknown>][] = [
  [/^\/roadmap\/[^/]+\/p\/[^/]+\/?$/, () => import("../pages/post")],
  [/^\/roadmap\/[^/]+\/roadmap\/?$/, () => import("../pages/roadmap")],
  [/^\/roadmap\/[^/]+\/?$/, () => import("../pages/board")],
  [/^\/roadmap\/?$/, () => import("../pages/home")],
  [/^\/changelog\/[^/]+\/?$/, () => import("../pages/changelog-entry")],
  [/^\/changelog\/?$/, () => import("../pages/changelog")],
]

export function prefetchRouteChunk(pathname: string): void {
  const match = routes.find(([pattern]) => pattern.test(pathname))
  // A failed prefetch is harmless: the router requests the chunk again when it renders.
  void match?.[1]().catch(() => undefined)
}
