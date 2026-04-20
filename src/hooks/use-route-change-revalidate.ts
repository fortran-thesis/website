/**
 * Retained as a no-op so import sites don't need to change.
 *
 * The previous implementation called `mutate(() => true)` on every route change,
 * which blasted ALL active SWR caches on every navigation. That caused a request
 * storm proportional to the number of mounted SWR hooks whenever the user clicked
 * any link. The global SWR provider already sets `revalidateIfStale: true`, so
 * each hook revalidates naturally when its page mounts — no explicit broadcast needed.
 */
export function useRouteChangeRevalidate() {
  // intentionally empty
}
