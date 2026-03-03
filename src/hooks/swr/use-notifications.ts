/**
 * SWR hooks — Notifications
 */

'use client';

import useSWR from 'swr';
import { apiUrl, apiMutate, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type NotificationReferenceType =
  | 'mold_report'
  | 'flag_report'
  | 'mold_case'
  | 'user';

export type NotificationType =
  | 'mold_report_created'
  | 'mold_report_assigned'
  | 'mold_report_rejected'
  | 'mold_report_resolved'
  | 'case_detail_added'
  | 'flag_report_created'
  | 'flag_report_resolved'
  | 'curator_approved'
  | 'curator_rejected'
  | 'user_disabled'
  | 'user_enabled'
  | 'user_banned';

export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  body: string;
  reference_id: string | null;
  reference_type: NotificationReferenceType | null;
  is_read: boolean;
  metadata?: {
    created_at?: { _seconds: number; _nanoseconds: number } | string;
    updated_at?: string | null;
    deleted_at?: string | null;
  };
}

export interface UnreadCountResponse {
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Fetch paginated notifications for the current user. */
export function useNotifications(
  limit = 20,
  filters?: { is_read?: boolean; type?: NotificationType; pageToken?: string },
  enabled = true,
) {
  return useSWR<ApiResponse<PaginatedResponse<Notification>>>(
    enabled
      ? apiUrl('/api/v1/notification', {
          limit,
          is_read: filters?.is_read,
          type: filters?.type,
          pageToken: filters?.pageToken,
        })
      : null,
    { dedupingInterval: 10_000 },
  );
}

/** Fetch the unread notification count for the current user. */
export function useUnreadNotificationCount(enabled = true) {
  return useSWR<ApiResponse<UnreadCountResponse>>(
    enabled ? '/api/v1/notification/unread-count' : null,
    { dedupingInterval: 10_000 },
  );
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

/** Mark a single notification as read. */
export async function markNotificationRead(id: string) {
  return apiMutate(`/api/v1/notification/${id}/read`, { method: 'PATCH' });
}

/** Mark all notifications as read. */
export async function markAllNotificationsRead() {
  return apiMutate('/api/v1/notification/read-all', { method: 'PATCH' });
}

/** Delete (soft-delete) a notification. */
export async function deleteNotification(id: string) {
  return apiMutate(`/api/v1/notification/${id}`, { method: 'DELETE' });
}

/** Register an FCM device token. */
export async function registerDeviceToken(token: string, platform: 'android' | 'ios' | 'web') {
  return apiMutate('/api/v1/notification/device-token', {
    method: 'POST',
    body: { token, platform },
  });
}

/** Remove a device token. */
export async function removeDeviceToken(id: string) {
  return apiMutate(`/api/v1/notification/device-token/${id}`, { method: 'DELETE' });
}
