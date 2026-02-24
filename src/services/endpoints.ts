/**
 * API Endpoints Configuration
 * Centralized endpoint routing
 */

export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    recoverAccount: '/auth/recover',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    changePassword: '/auth/change-password',
  },

  // User Management
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
    list: '/user',
    getById: (id: string) => `/user/${id}`,
    delete: (id: string) => `/user/${id}`,
  },

  // Cases/Investigations
  cases: {
    list: '/cases',
    create: '/cases',
    getById: (id: string) => `/cases/${id}`,
    update: (id: string) => `/cases/${id}`,
    delete: (id: string) => `/cases/${id}`,
    assign: (id: string) => `/cases/${id}/assign`,
  },

  // Identification History
  identification: {
    list: '/identifications',
    getById: (id: string) => `/identifications/${id}`,
    getByCaseId: (caseId: string) => `/cases/${caseId}/identifications`,
  },

  // Treatment History
  treatment: {
    list: '/treatments',
    create: '/treatments',
    getById: (id: string) => `/treatments/${id}`,
    update: (id: string) => `/treatments/${id}`,
    delete: (id: string) => `/treatments/${id}`,
    getByCaseId: (caseId: string) => `/cases/${caseId}/treatments`,
  },

  // Support
  support: {
    bugReport: '/support/bug-report',
    feedback: '/support/feedback',
    appeal: '/support/appeal',
  },

  // Dashboard/Statistics
  dashboard: {
    statistics: '/dashboard/statistics',
    priorityBreakdown: '/dashboard/priority-breakdown',
    timeline: '/dashboard/timeline',
    statusOverview: '/dashboard/status-overview',
  },

  // Mold Information
  mold: {
    list: '/mold',
    getById: (id: string) => `/mold/${id}`,
    create: '/mold',
    update: (id: string) => `/mold/${id}`,
  },

  // WikiMold/Moldipedia
  moldipedia: {
    list: '/moldipedia',
    getById: (id: string) => `/moldipedia/${id}`,
    create: '/moldipedia',
    update: (id: string) => `/moldipedia/${id}`,
  },

  // FAQ
  faq: {
    list: '/faq',
  },
} as const;
