/**
 * Cache Invalidation Utilities
 *
 * Centralized, reusable cache invalidation patterns for SWR per domain.
 * Ensures consistent revalidation across all mutation callers.
 *
 * Usage:
 *   import { useInvalidationFunctions } from '@/utils/cache-invalidation';
 *   const { invalidateMolds } = useInvalidationFunctions();
 *   await invalidateMolds();
 */

import { useSWRConfig } from 'swr';

/**
 * Create a pattern matcher for SWR cache invalidation.
 * Matches both direct keys (`/api/v1/...`) and infinite keys (`$inf$/api/v1/...`).
 */
function createPattern(endpoint: string): (key: unknown) => boolean {
  return (key: unknown) =>
    typeof key === 'string' &&
    (key.startsWith(endpoint) || key.startsWith(`$inf$${endpoint}`));
}

/**
 * Hook to get all cache invalidation functions.
 * Must be called from within a function component (or another hook).
 * This solves the React error #321 by ensuring hooks are called correctly.
 */
export function useInvalidationFunctions() {
  const { mutate } = useSWRConfig();

  return {
    /**
     * Invalidate all user-domain caches
     */
    invalidateUsers: async () => {
      await Promise.all([
        mutate('/api/v1/users/counts/roles', undefined, { revalidate: true }),
        mutate('/api/v1/users/mycologists', undefined, { revalidate: true }),
        mutate('/api/v1/users/counts/disabled', undefined, { revalidate: true }),
        mutate(createPattern('/api/v1/users'), undefined, { revalidate: true }),
        mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
      ]);
    },

    /**
     * Invalidate all notification-domain caches
     */
    invalidateNotifications: async () => {
      await mutate(
        (key: unknown) =>
          typeof key === 'string' &&
          (key.startsWith('/api/v1/notification') || key.startsWith('$inf$/api/v1/notification')),
        undefined,
        { revalidate: true },
      );
    },

    /**
     * Invalidate all mold-report domain caches
     */
    invalidateMoldReports: async () => {
      await Promise.all([
        mutate(createPattern('/api/v1/mold-reports'), undefined, { revalidate: true }),
        mutate(createPattern('/api/v1/mold-cases'), undefined, { revalidate: true }),
        mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
      ]);
    },

    /**
     * Invalidate all mold-case domain caches
     */
    invalidateMoldCases: async () => {
      await Promise.all([
        mutate(createPattern('/api/v1/mold-cases'), undefined, { revalidate: true }),
        mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
      ]);
    },

    /**
     * Invalidate all moldipedia domain caches
     */
    invalidateMoldipedia: async () => {
      await Promise.all([
        mutate(createPattern('/api/v1/moldipedia'), undefined, { revalidate: true }),
        mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
      ]);
    },

    /**
     * Invalidate all mold domain caches
     */
    invalidateMolds: async () => {
      await Promise.all([
        mutate(createPattern('/api/v1/mold'), undefined, { revalidate: true }),
        mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
      ]);
    },

    /**
     * Invalidate flag-report domain caches
     */
    invalidateFlagReports: async () => {
      await mutate(createPattern('/api/v1/flag-report'), undefined, { revalidate: true });
    },

    /**
     * Invalidate all caches across all domains
     */
    invalidateAll: async () => {
      await mutate(() => true, undefined, { revalidate: true });
    },
  };
}
