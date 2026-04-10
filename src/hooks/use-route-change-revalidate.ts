import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
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
  const lastPathRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lastPathRef.current === null) {
      lastPathRef.current = pathname;
      return;
    }

    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Revalidate all SWR keys after navigation settles to reduce burst traffic.
      mutate(() => true, undefined, { revalidate: true });
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [pathname]);
}
