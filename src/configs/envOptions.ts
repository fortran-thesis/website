/**
 * Environment Configuration
 * Centralized configuration for environment variables
 */

export const envOptions = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  
  // Add other environment variables here as needed
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Type-safe environment variable validation
export const validateEnv = () => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn('⚠️  NEXT_PUBLIC_API_URL is not defined in environment variables');
  }
};
