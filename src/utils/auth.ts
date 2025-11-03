/**
 * Authentication Utilities
 * Helper functions for managing authentication tokens
 */

/**
 * Set authentication token in both localStorage and cookies
 * For Firebase Functions (cross-origin), we store token client-side
 */
export const setAuthToken = (token: string) => {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage for API calls
  localStorage.setItem('authToken', token);
  
  // Store in cookies for middleware (expires in 7 days)
  const maxAge = 60 * 60 * 24 * 7; // 7 days in seconds
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
  
  console.log('🍪 Token stored in localStorage and cookie for middleware');
};

/**
 * Get authentication token from localStorage or cookies
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const localToken = localStorage.getItem('authToken');
  if (localToken) return localToken;
  
  // Fallback to cookies
  const cookieToken = getCookie('authToken');
  if (cookieToken) {
    // Sync back to localStorage
    localStorage.setItem('authToken', cookieToken);
    return cookieToken;
  }
  
  return null;
};

/**
 * Remove authentication token from both localStorage and cookies
 */
export const removeAuthToken = () => {
  if (typeof window === 'undefined') return;
  
  // Remove from localStorage
  localStorage.removeItem('authToken');
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
  return !!getAuthToken();
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
