/**
 * API Endpoints Configuration
 * Centralized endpoint routing
 */

// Only add /v1/ prefix in development (local Docker setup)
// Production uses direct paths
const API_PREFIX = process.env.NODE_ENV === 'development' ? '/v1' : '';

export const endpoints = {
  // Authentication
  auth: {
    login: `${API_PREFIX}/auth/login`,
    logout: `${API_PREFIX}/auth/logout`,
    register: `${API_PREFIX}/auth/register`,
    recoverAccount: `${API_PREFIX}/auth/recover`,
    resetPassword: `${API_PREFIX}/auth/reset-password`,
    verifyEmail: `${API_PREFIX}/auth/verify-email`,
    changePassword: `${API_PREFIX}/auth/change-password`,
    forgotPassword: `${API_PREFIX}/auth/forgot-password`,
    forgotUsername: `${API_PREFIX}/auth/forgot-username`,
    forgotPasswordVerify: `${API_PREFIX}/auth/forgot-password/verify`,
    forgotUsernameVerify: `${API_PREFIX}/auth/forgot-username/verify`,
    verifyCode: `${API_PREFIX}/auth/verify-code`,
  },

  // User Management
  user: {
    profile: `${API_PREFIX}/user/profile`,
    updateProfile: `${API_PREFIX}/user/profile`,
    list: `${API_PREFIX}/user`,
    getById: (id: string) => `${API_PREFIX}/user/${id}`,
    delete: (id: string) => `${API_PREFIX}/user/${id}`,
    mycologists: `${API_PREFIX}/user/mycologists`,
    search: `${API_PREFIX}/user/search`,
    countsRoles: `${API_PREFIX}/user/counts/roles`,
    countsDisabled: `${API_PREFIX}/user/counts/disabled`,
  },

  // Cases/Investigations
  cases: {
    list: `${API_PREFIX}/cases`,
    create: `${API_PREFIX}/cases`,
    getById: (id: string) => `${API_PREFIX}/cases/${id}`,
    update: (id: string) => `${API_PREFIX}/cases/${id}`,
    delete: (id: string) => `${API_PREFIX}/cases/${id}`,
    assign: (id: string) => `${API_PREFIX}/cases/${id}/assign`,
  },

  // Identification History
  identification: {
    list: `${API_PREFIX}/identifications`,
    getById: (id: string) => `${API_PREFIX}/identifications/${id}`,
    getByCaseId: (caseId: string) => `${API_PREFIX}/cases/${caseId}/identifications`,
  },

  // Treatment History
  treatment: {
    list: `${API_PREFIX}/treatments`,
    create: `${API_PREFIX}/treatments`,
    getById: (id: string) => `${API_PREFIX}/treatments/${id}`,
    update: (id: string) => `${API_PREFIX}/treatments/${id}`,
    delete: (id: string) => `${API_PREFIX}/treatments/${id}`,
    getByCaseId: (caseId: string) => `${API_PREFIX}/cases/${caseId}/treatments`,
  },

  // Support
  support: {
    bugReport: `${API_PREFIX}/support/bug-report`,
    feedback: `${API_PREFIX}/support/feedback`,
    appeal: `${API_PREFIX}/support/appeal`,
  },

  // (Deprecated) singular `report` endpoints removed — use `flagReports` instead.

  // Mold Reports
  moldReport: {
    list: `${API_PREFIX}/mold-report`,
    getById: (id: string) => `${API_PREFIX}/mold-report/${id}`,
    exportById: (id: string) => `${API_PREFIX}/mold-report/${id}/export`,
    unassigned: `${API_PREFIX}/mold-report/unassigned`,
    assigned: `${API_PREFIX}/mold-report/assigned`,
    assignedCount: `${API_PREFIX}/mold-report/assigned/count`,
    closed: `${API_PREFIX}/mold-report/closed`,
    search: `${API_PREFIX}/mold-report/search`,
    assign: (id: string) => `${API_PREFIX}/mold-report/${id}/assign`,
    reject: (id: string) => `${API_PREFIX}/mold-report/${id}/reject`,
    countMonthly: `${API_PREFIX}/mold-report/counts/monthly`,
    countPriorities: `${API_PREFIX}/mold-report/counts/priorities`,
    countStatuses: `${API_PREFIX}/mold-report/counts/statuses`,
    publicResolvedCount: `${API_PREFIX}/mold-report/public/resolved-count`,
  },

  // Mold Cases
  moldCase: {
    list: `${API_PREFIX}/mold-case`,
    create: `${API_PREFIX}/mold-case`,
    getById: (id: string) => `${API_PREFIX}/mold-case/${id}`,
    update: (id: string) => `${API_PREFIX}/mold-case/${id}`,
    logs: (id: string) => `${API_PREFIX}/mold-case/${id}/logs`,
    deleteLog: (id: string, logId: string) => `${API_PREFIX}/mold-case/${id}/logs/${logId}`,
    cultivationDetails: (id: string) => `${API_PREFIX}/mold-case/${id}/cultivation-details`,
    cultureSessions: (id: string) => `${API_PREFIX}/mold-case/${id}/culture-sessions`,
    availableCultureSessions: (id: string) => `${API_PREFIX}/mold-case/${id}/culture-sessions/available`,
    createCultureSession: (id: string) => `${API_PREFIX}/mold-case/${id}/culture-sessions`,
    endCultureSessionEarly: (id: string, cultureId: string) => `${API_PREFIX}/mold-case/${id}/culture-sessions/${cultureId}/end-early`,
    reassignCultureSession: (id: string, cultureId: string) => `${API_PREFIX}/mold-case/${id}/culture-sessions/${cultureId}/reassign`,
    deleteCultureSession: (id: string, cultureId: string) => `${API_PREFIX}/mold-case/${id}/culture-sessions/${cultureId}`,
    byReport: (reportId: string) => `${API_PREFIX}/mold-case/by-report/${reportId}`,
    countMetadata: `${API_PREFIX}/mold-case/counts/metadata`,
  },

  // Mycologists
  mycologist: {
    register: `${API_PREFIX}/mycologist/register`,
  },

  // Dashboard/Statistics
  dashboard: {
    statistics: `${API_PREFIX}/dashboard/statistics`,
    priorityBreakdown: `${API_PREFIX}/dashboard/priority-breakdown`,
    timeline: `${API_PREFIX}/dashboard/timeline`,
    statusOverview: `${API_PREFIX}/dashboard/status-overview`,
    countsTotal: `${API_PREFIX}/dashboard/counts/totals`,
  },

  // Mold Information
  mold: {
    list: `${API_PREFIX}/mold`,
    getById: (id: string) => `${API_PREFIX}/mold/${id}`,
    create: `${API_PREFIX}/mold`,
    update: (id: string) => `${API_PREFIX}/mold/${id}`,
  },

  // WikiMold/Moldipedia
  moldipedia: {
    list: `${API_PREFIX}/moldipedia`,
    getById: (id: string) => `${API_PREFIX}/moldipedia/${id}`,
    create: `${API_PREFIX}/moldipedia`,
    update: (id: string) => `${API_PREFIX}/moldipedia/${id}`,
    archive: (id: string) => `${API_PREFIX}/moldipedia/${id}/archive`,
    archived: `${API_PREFIX}/moldipedia/archive`,
    restore: (id: string) => `${API_PREFIX}/moldipedia/${id}/unarchive`,
    casesById: (id: string) => `${API_PREFIX}/moldipedia/${id}/cases`,
  },

  // Flag Reports
  flagReports: {
    list: `${API_PREFIX}/flag-report`,
    getById: (id: string) => `${API_PREFIX}/flag-report/${id}`,
  },

  // FAQ
  faq: {
    list: `${API_PREFIX}/faq`,
    getById: (id: string) => `${API_PREFIX}/faq/${id}`,
  },

  // Audit Logs
  auditLog: {
    list: `${API_PREFIX}/audit-log`,
    byAction: (action: string) => `${API_PREFIX}/audit-log/${action}`,
  },

  // Notifications
  notification: {
    list: `${API_PREFIX}/notification`,
    getById: (id: string) => `${API_PREFIX}/notification/${id}`,
    unreadCount: `${API_PREFIX}/notification/unread-count`,
    markRead: (id: string) => `${API_PREFIX}/notification/${id}/read`,
    markAllRead: `${API_PREFIX}/notification/read-all`,
    delete: (id: string) => `${API_PREFIX}/notification/${id}`,
    deviceToken: `${API_PREFIX}/notification/device-token`,
    removeDeviceToken: (id: string) => `${API_PREFIX}/notification/device-token/${id}`,
  },
} as const;
