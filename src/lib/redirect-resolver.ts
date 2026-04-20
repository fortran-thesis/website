type NotificationReferenceType =
  | 'mold_report'
  | 'flag_report'
  | 'mold_case'
  | 'user'
  | null
  | undefined;

function buildViewCaseRedirect(referenceId: string, entityType: 'mold_report' | 'mold_case') {
  const params = new URLSearchParams({ id: referenceId, entityType });
  return `/investigation/view-case?${params.toString()}`;
}

/**
 * Resolve destination URLs for in-app notifications.
 * Returns null when the notification should not navigate.
 */
export function resolveNotificationRedirect(
  referenceType: NotificationReferenceType,
  referenceId: string | null | undefined,
): string | null {
  if (!referenceType || !referenceId) return null;

  const encodedId = encodeURIComponent(referenceId);

  switch (referenceType) {
    case 'mold_report':
      return buildViewCaseRedirect(referenceId, 'mold_report');
    case 'mold_case':
      return buildViewCaseRedirect(referenceId, 'mold_case');
    case 'flag_report':
      return `/flag-report/${encodedId}`;
    case 'user':
      return `/user/view-user?id=${encodedId}`;
    default:
      return null;
  }
}

/**
 * Resolve destination URLs for audit-log entries based on action + target.
 * Unknown actions intentionally return null so the UI can keep rows non-clickable.
 */
export function resolveAuditLogRedirect(
  action: string | null | undefined,
  targetId: string | null | undefined,
): string | null {
  if (!action || !targetId) return null;

  const normalizedAction = action.trim().toLowerCase();
  const encodedId = encodeURIComponent(targetId);

  if (normalizedAction.includes('mold_report') || normalizedAction === 'resolve_report') {
    return buildViewCaseRedirect(targetId, 'mold_report');
  }

  if (normalizedAction.includes('mold_case') || normalizedAction === 'add_cultivation_log' || normalizedAction === 'analyze_cultivation') {
    return buildViewCaseRedirect(targetId, 'mold_case');
  }

  if (normalizedAction.includes('flag_report')) {
    return `/reports/view-report?id=${encodedId}`;
  }

  if (normalizedAction.includes('wikimold')) {
    return `/wikimold/view-wikimold/${encodedId}`;
  }

  if (
    normalizedAction.includes('user') ||
    normalizedAction === 'create_mycologist' ||
    normalizedAction === 'profile_update'
  ) {
    return `/user/view-user?id=${encodedId}`;
  }

  return null;
}