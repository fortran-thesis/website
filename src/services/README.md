# API Library Documentation

This directory contains the API client library and endpoint configuration for the application.

## Structure

- **`apiClient.ts`** - Core API client with HTTP methods (GET, POST, PATCH, PUT, DELETE)
- **`endpoints.ts`** - Centralized endpoint routing configuration
- **`index.ts`** - Module exports

## Usage Examples

### Basic Usage

```typescript
import { apiClient, endpoints } from '@/api';

// GET request
const response = await apiClient.get(endpoints.user.profile);

if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}
```

### POST Request with Body

```typescript
import { apiClient, endpoints } from '@/api';

const loginData = {
  email: 'user@example.com',
  password: 'password123',
};

const response = await apiClient.post(endpoints.auth.login, loginData);

if (response.success) {
  // Store token
  localStorage.setItem('authToken', response.data.token);
}
```

### GET Request with Query Parameters

```typescript
import { apiClient, endpoints } from '@/api';

const response = await apiClient.get(endpoints.cases.list, {
  params: {
    page: 1,
    limit: 10,
    status: 'pending',
  },
});
```

### PATCH Request (Update)

```typescript
import { apiClient, endpoints } from '@/api';

const updateData = {
  name: 'John Doe',
  email: 'john@example.com',
};

const response = await apiClient.patch(
  endpoints.user.updateProfile,
  updateData
);
```

### DELETE Request

```typescript
import { apiClient, endpoints } from '@/api';

const caseId = '123';
const response = await apiClient.delete(endpoints.cases.delete(caseId));
```

### Request Without Authentication

```typescript
import { apiClient, endpoints } from '@/api';

// Public endpoint that doesn't require authentication
const response = await apiClient.post(
  endpoints.auth.register,
  registerData,
  { auth: false }
);
```

### Custom Headers

```typescript
import { apiClient } from '@/api';

const response = await apiClient.get('/custom-endpoint', {
  headers: {
    'Custom-Header': 'value',
  },
});
```

## API Response Structure

All API methods return a standardized response:

```typescript
interface ApiResponse<T> {
  data?: T;              // Response data
  error?: string;        // Error message if failed
  message?: string;      // Success message
  success: boolean;      // Whether request succeeded
  status: number;        // HTTP status code
}
```

## Authentication

The API client automatically includes the Bearer token from `localStorage` or `sessionStorage` when `auth: true` (default).

To store a token after login:

```typescript
localStorage.setItem('authToken', token);
```

## Adding New Endpoints

To add new endpoints, edit `endpoints.ts`:

```typescript
export const endpoints = {
  // ... existing endpoints
  
  newFeature: {
    list: '/new-feature',
    create: '/new-feature',
    getById: (id: string) => `/new-feature/${id}`,
  },
};
```

## Environment Configuration

API URL is configured in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Access it via:

```typescript
import { envOptions } from '@/configs/envOptions';
console.log(envOptions.apiUrl);
```
