/**
 * Shared types for SWR data hooks.
 */

/** Standard paginated response wrapper from the backend. */
export interface PaginatedResponse<T> {
  snapshot: T[];
  nextPageToken?: string | null;
  /** Some endpoints double-wrap data */
  data?: T[];
}
