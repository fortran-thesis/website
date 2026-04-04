import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { mutate } from 'swr';

/**
 * Hook that revalidates all SWR caches when the route changes.
 *
 * This ensures that when the user navigates (via router.push, router.back, links, etc.),
 * all active SWR keys are revalidated in the background, providing fresh data without
 * blocking navigation.
 *
 * Usage in a root layout or provider:
 * ```tsx
 * export default function RootLayout() {
 *   useRouteChangeRevalidate();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useRouteChangeRevalidate() {
  const pathname = usePathname();

  useEffect(() => {
    // Revalidate all SWR keys when pathname changes
    // This broadcasts to all active SWR hooks and triggers background revalidation
    mutate(() => true, undefined, { revalidate: true });
  }, [pathname]);
}
