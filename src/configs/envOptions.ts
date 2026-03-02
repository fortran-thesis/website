/**
 * Environment Configuration
 * Centralized configuration for environment variables
 */

export const envOptions = {
  // API Configuration
  // Local dev: http://localhost:5001/thesis-2e701/asia-southeast1/api
  // Production: https://api-2p4weeh6lq-as.a.run.app/api/v1
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/thesis-2e701/asia-southeast1/api',

  // Temporary auth bypass (set NEXT_PUBLIC_DISABLE_AUTH=true to skip auth checks)
  disableAuth: process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true',
  
  // Add other environment variables here as needed
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Type-safe environment variable validation
export const validateEnv = () => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn('⚠️  NEXT_PUBLIC_API_URL is not defined, using default');
  }
};
