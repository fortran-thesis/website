/**
 * Cache Invalidation Utilities
 *
 * Centralized, reusable cache invalidation patterns for SWR per domain.
 * Ensures consistent revalidation across all mutation callers.
 *
 * Usage:
 *   import { invalidateUsers, invalidateMoldipedia } from '@/utils/cache-invalidation';
 *   await invalidateMoldipedia();
 *   await invalidateUsers();
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
 * Invalidate all user-domain caches:
 * - role counts, mycologist lists, disabled counts
 * - all users lists (with infinite-scroll support)
 * - dashboard summary
 */
export async function invalidateUsers() {
  const { mutate } = useSWRConfig();

  await Promise.all([
    mutate('/api/v1/users/counts/roles', undefined, { revalidate: true }),
    mutate('/api/v1/users/mycologists', undefined, { revalidate: true }),
    mutate('/api/v1/users/counts/disabled', undefined, { revalidate: true }),
    mutate(createPattern('/api/v1/users'), undefined, { revalidate: true }),
    mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
  ]);
}

/**
 * Invalidate all notification-domain caches:
 * - notification lists (with infinite-scroll support)
 * - unread counts
 */
export async function invalidateNotifications() {
  const { mutate } = useSWRConfig();

  await mutate(
    (key: unknown) =>
      typeof key === 'string' &&
      (key.startsWith('/api/v1/notification') || key.startsWith('$inf$/api/v1/notification')),
    undefined,
    { revalidate: true },
  );
}

/**
 * Invalidate all mold-report domain caches:
 * - report lists (with infinite-scroll support)
 * - report counts and aggregates
 * - related mold-case lists
 * - dashboard summary
 */
export async function invalidateMoldReports() {
  const { mutate } = useSWRConfig();

  await Promise.all([
    mutate(createPattern('/api/v1/mold-reports'), undefined, { revalidate: true }),
    mutate(createPattern('/api/v1/mold-cases'), undefined, { revalidate: true }),
    mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
  ]);
}

/**
 * Invalidate all mold-case domain caches:
 * - case lists (with infinite-scroll support)
 * - case details
 * - cultivation logs
 * - dashboard summary
 */
export async function invalidateMoldCases() {
  const { mutate } = useSWRConfig();

  await Promise.all([
    mutate(createPattern('/api/v1/mold-cases'), undefined, { revalidate: true }),
    mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
  ]);
}

/**
 * Invalidate all moldipedia domain caches:
 * - article lists (with infinite-scroll support)
 * - article details
 * - dashboard summary
 */
export async function invalidateMoldipedia() {
  const { mutate } = useSWRConfig();

  await Promise.all([
    mutate(createPattern('/api/v1/moldipedia'), undefined, { revalidate: true }),
    mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
  ]);
}

/**
 * Invalidate all mold domain caches:
 * - mold lists (with infinite-scroll support)
 * - mold details
 * - dashboard summary
 */
export async function invalidateMolds() {
  const { mutate } = useSWRConfig();

  await Promise.all([
    mutate(createPattern('/api/v1/mold'), undefined, { revalidate: true }),
    mutate('/api/v1/dashboard/summary', undefined, { revalidate: true }),
  ]);
}

/**
 * Invalidate flag-report domain caches:
 * - flag lists (with infinite-scroll support)
 * - flag details
 */
export async function invalidateFlagReports() {
  const { mutate } = useSWRConfig();

  await mutate(createPattern('/api/v1/flag-report'), undefined, { revalidate: true });
}

/**
 * Invalidate all caches across all domains.
 * Use sparingly; prefer domain-specific invalidation when possible.
 */
export async function invalidateAll() {
  const { mutate } = useSWRConfig();
  await mutate(() => true, undefined, { revalidate: true });
}
