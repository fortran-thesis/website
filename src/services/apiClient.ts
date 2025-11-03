/**
 * API Client Library
 * Handles all HTTP requests with centralized configuration
 */

import { envOptions } from '@/configs/envOptions';
import { getAuthToken } from '@/utils/auth';

// Response type
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  status: number;
}

// Request options interface
export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  auth?: boolean; // Whether to include auth token
}

/**
 * Base API Client Class
 */
class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = envOptions.apiUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authentication token from storage or cookies
   */
  private getAuthToken(): string | null {
    return getAuthToken();
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * Build headers with optional authentication
   */
  private buildHeaders(auth: boolean = false, customHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = { ...this.defaultHeaders };

    if (auth) {
      const token = this.getAuthToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status;
    let data: any;

    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      return {
        success: false,
        status,
        error: data.error || data.message || `HTTP Error ${status}`,
        data: data.data,
      };
    }

    return {
      success: true,
      status,
      data: data.data || data,
      message: data.message,
    };
  }

  /**
   * Handle fetch errors
   */
  private handleError<T>(error: any): ApiResponse<T> {
    console.error('API Request Error:', error);
    
    return {
      success: false,
      status: 0,
      error: error.message || 'Network error or server unreachable',
    };
  }

  /**
   * GET Request
   */
  async get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { params, auth = true, ...fetchOptions } = options;
      const url = this.buildURL(endpoint, params);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(auth, fetchOptions.headers),
        credentials: 'include', // Important: Include cookies in request/response
        ...fetchOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * POST Request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { params, auth = true, ...fetchOptions } = options;
      const url = this.buildURL(endpoint, params);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(auth, fetchOptions.headers),
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Important: Include cookies in request/response
        ...fetchOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * PATCH Request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { params, auth = true, ...fetchOptions } = options;
      const url = this.buildURL(endpoint, params);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.buildHeaders(auth, fetchOptions.headers),
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
        ...fetchOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * PUT Request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { params, auth = true, ...fetchOptions } = options;
      const url = this.buildURL(endpoint, params);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.buildHeaders(auth, fetchOptions.headers),
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
        ...fetchOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * DELETE Request
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { params, auth = true, ...fetchOptions } = options;
      const url = this.buildURL(endpoint, params);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.buildHeaders(auth, fetchOptions.headers),
        credentials: 'include',
        ...fetchOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
