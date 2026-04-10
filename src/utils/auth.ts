/**
 * Authentication Utilities
 * Helper functions for managing authentication tokens
 */

const AUTH_TOKEN_SESSION_KEY = 'authToken';
const CSRF_COOKIE_NAME = 'csrfToken';

/**
 * Set authentication token in both localStorage and cookies
 * For Firebase Functions (cross-origin), we store token client-side
 */
export const setAuthToken = (token: string) => {
  if (typeof window === 'undefined') return;

  // Keep auth token in sessionStorage only to reduce long-lived XSS exposure.
  sessionStorage.setItem(AUTH_TOKEN_SESSION_KEY, token);
};

/**
 * Get authentication token from localStorage or cookies
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  return sessionStorage.getItem(AUTH_TOKEN_SESSION_KEY);
};

/**
 * Remove authentication token from both localStorage and cookies
 */
export const removeAuthToken = () => {
  if (typeof window === 'undefined') return;

  // Remove from sessionStorage and legacy localStorage key.
  sessionStorage.removeItem(AUTH_TOKEN_SESSION_KEY);
  localStorage.removeItem(AUTH_TOKEN_SESSION_KEY);
  localStorage.removeItem('user');
  
  // Remove from cookies
  // Try removal with multiple common attribute combinations to ensure deletion
  const hostname = window.location.hostname;
  const domainsToTry = [hostname, `.${hostname}`, ''];
  const isSecure = window.location.protocol === 'https:';

  const removeFor = (name: string) => {
    // base removal
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    // try with Secure flag if on HTTPS
    if (isSecure) document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax; Secure`;
    // try with domains
    domainsToTry.forEach(d => {
      const domainPart = d ? `; domain=${d}` : '';
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${domainPart}`;
      if (isSecure) document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax; Secure${domainPart}`;
    });
  };

  removeFor('authToken');
  removeFor(CSRF_COOKIE_NAME);

  // Debug: log cookies after attempted removal
  try {
    // small delay to allow cookie jar to update
    setTimeout(() => console.debug('document.cookie after removal attempts:', document.cookie), 50);
  } catch (e) {
    // ignore
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith('session='));
};

/**
 * Returns CSRF token from cookie for double-submit validation.
 */
export const getCsrfToken = (): string | null => getCookie(CSRF_COOKIE_NAME);

/**
 * Set CSRF token cookie (non-httpOnly by design so frontend can echo header).
 */
export const setCsrfToken = (token: string) => {
  if (typeof window === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7;
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CSRF_COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): any | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Set user data in localStorage
 */
export const setUserData = (user: any) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove user data from localStorage
 */
export const removeUserData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
};

/**
 * Helper function to get a cookie by name
 */
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
};
