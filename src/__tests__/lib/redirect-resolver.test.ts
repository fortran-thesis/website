import { resolveAuditLogRedirect, resolveNotificationRedirect } from '@/lib/redirect-resolver';

describe('resolveNotificationRedirect', () => {
  it('routes mold_report to investigation detail', () => {
    expect(resolveNotificationRedirect('mold_report', 'rep-123')).toBe('/investigation/view-case?id=rep-123');
  });

  it('routes mold_case to investigation detail', () => {
    expect(resolveNotificationRedirect('mold_case', 'case-123')).toBe('/investigation/view-case?id=case-123');
  });

  it('routes user references to user view', () => {
    expect(resolveNotificationRedirect('user', 'usr-123')).toBe('/user/view-user?id=usr-123');
  });

  it('returns null for unknown or incomplete values', () => {
    expect(resolveNotificationRedirect(null, 'x')).toBeNull();
    expect(resolveNotificationRedirect('mold_report', null)).toBeNull();
    expect(resolveNotificationRedirect(undefined, undefined)).toBeNull();
  });
});

describe('resolveAuditLogRedirect', () => {
  it('routes mold report actions to investigation detail', () => {
    expect(resolveAuditLogRedirect('assign_mold_report', 'rep-123')).toBe('/investigation/view-case?id=rep-123');
  });

  it('routes mold case actions to investigation detail', () => {
    expect(resolveAuditLogRedirect('update_mold_case', 'case-123')).toBe('/investigation/view-case?id=case-123');
  });

  it('routes user actions to user view', () => {
    expect(resolveAuditLogRedirect('disable_user', 'usr-123')).toBe('/user/view-user?id=usr-123');
  });

  it('routes flag-report actions to report details page', () => {
    expect(resolveAuditLogRedirect('correct_flag_report', 'flag-123')).toBe('/reports/view-report?id=flag-123');
  });

  it('routes wikimold actions to wikimold details page', () => {
    expect(resolveAuditLogRedirect('edit_wikimold', 'wiki-123')).toBe('/wikimold/view-wikimold/wiki-123');
  });

  it('returns null for unknown or incomplete actions', () => {
    expect(resolveAuditLogRedirect('unknown_action', 'usr-123')).toBeNull();
    expect(resolveAuditLogRedirect('', 'id')).toBeNull();
    expect(resolveAuditLogRedirect('ban_user', null)).toBeNull();
  });
});