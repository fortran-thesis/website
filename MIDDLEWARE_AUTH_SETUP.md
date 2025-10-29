# Middleware & Authentication Setup

## 🔒 Route Protection Middleware

Your Next.js middleware has been configured to protect routes based on authentication status.

### How It Works

**Location**: `src/middleware.ts`

The middleware runs on **every request** before the page loads and:
1. Checks for `authToken` cookie
2. Redirects based on authentication status
3. Protects routes automatically

### Route Behavior

#### 1. **Public Routes** (No Auth Required)
- `/auth/log-in`
- `/auth/sign-up`
- `/auth/sign-up-2`
- `/auth/account-recovery`
- `/auth/account-recovery-2`
- `/auth/account-recovery-3`

#### 2. **Protected Routes** (Auth Required)
- `/dashboard`
- `/user`
- `/investigation`
- `/support`
- All other routes not in public list

#### 3. **Redirect Rules**

| User State | Accessing | Result |
|------------|-----------|--------|
| ✅ Authenticated | `/auth/*` | Redirect to `/dashboard` |
| ✅ Authenticated | `/` | Redirect to `/dashboard` |
| ✅ Authenticated | Protected routes | Allow access |
| ❌ Not Authenticated | `/` | Redirect to `/auth/log-in` |
| ❌ Not Authenticated | Protected routes | Redirect to `/auth/log-in` |
| ❌ Not Authenticated | `/auth/*` | Allow access |

---

## 🔑 Authentication Utilities

### Location: `src/utils/auth.ts`

Provides helper functions for managing authentication:

```typescript
import { 
  setAuthToken, 
  getAuthToken, 
  removeAuthToken,
  isAuthenticated,
  setUserData,
  getUserData 
} from '@/utils/auth';
```

### Functions

#### `setAuthToken(token: string)`
Stores token in both localStorage and cookies (for middleware).

```typescript
setAuthToken('your-jwt-token-here');
```

#### `getAuthToken(): string | null`
Gets token from localStorage or cookies.

```typescript
const token = getAuthToken();
```

#### `removeAuthToken()`
Removes token from both localStorage and cookies.

```typescript
removeAuthToken();
```

#### `isAuthenticated(): boolean`
Checks if user has a valid token.

```typescript
if (isAuthenticated()) {
  // User is logged in
}
```

#### `setUserData(user: any)`
Stores user data in localStorage.

```typescript
setUserData({ id: 1, name: 'John', role: 'admin' });
```

#### `getUserData(): any | null`
Gets user data from localStorage.

```typescript
const user = getUserData();
console.log(user.name);
```

---

## 🪝 React Hooks

### 1. `useLogout` Hook

**Location**: `src/hooks/useLogout.ts`

```typescript
import { useLogout } from '@/hooks/useLogout';

export default function MyComponent() {
  const logout = useLogout();

  return (
    <button onClick={logout}>
      Log Out
    </button>
  );
}
```

### 2. `useAuth` Hook

**Location**: `src/hooks/useAuth.ts`

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { isAuthenticated, user, token, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

---

## 📝 Login Flow Example

**File**: `src/app/auth/log-in/page.tsx`

```typescript
import { apiClient, endpoints } from '@/services';
import { setAuthToken, setUserData } from '@/utils/auth';
import { useRouter } from 'next/navigation';

const handleLogin = async (username: string, password: string) => {
  const response = await apiClient.post(
    endpoints.auth.login,
    { username, password },
    { auth: false }
  );

  if (response.success) {
    // Store token (localStorage + cookie)
    setAuthToken(response.data.token);
    
    // Store user data
    setUserData(response.data.user);
    
    // Redirect to dashboard
    router.push('/dashboard');
  }
};
```

---

## 🚪 Logout Flow Example

**Sidebar Component**: `src/components/sidebar.tsx`

```typescript
import { useLogout } from '@/hooks/useLogout';

export default function Sidebar() {
  const logout = useLogout();

  return (
    <button onClick={logout}>
      Log Out
    </button>
  );
}
```

---

## 🔄 How Authentication Works

### 1. **Login Process**
```
User enters credentials
        ↓
API call to backend
        ↓
Backend returns token
        ↓
Store in localStorage + cookie
        ↓
Middleware detects cookie
        ↓
Redirect to dashboard
```

### 2. **Protected Route Access**
```
User navigates to /dashboard
        ↓
Middleware checks cookie
        ↓
Cookie exists? → Allow access
Cookie missing? → Redirect to /auth/log-in
```

### 3. **Logout Process**
```
User clicks logout
        ↓
Remove token from localStorage
        ↓
Remove cookie
        ↓
Redirect to /auth/log-in
        ↓
Middleware detects no cookie
        ↓
Access to protected routes blocked
```

---

## ⚙️ Configuration

### Add New Public Route

Edit `src/middleware.ts`:

```typescript
const publicRoutes = [
  '/auth/log-in',
  '/auth/sign-up',
  // Add your new public route here
  '/auth/verify-email',
];
```

### Change Token Expiration

Edit `src/utils/auth.ts`:

```typescript
const maxAge = 60 * 60 * 24 * 7; // 7 days
// Change to: 60 * 60 * 24 * 30 for 30 days
```

### Change Default Redirect

Edit `src/middleware.ts`:

```typescript
// Change dashboard redirect
const dashboardUrl = new URL('/dashboard', request.url);
// To: const dashboardUrl = new URL('/home', request.url);
```

---

## 🧪 Testing

### Test Login
1. Go to `/auth/log-in`
2. Enter credentials
3. Should redirect to `/dashboard`
4. Cookie should be set

### Test Protected Routes
1. Clear cookies (or use incognito)
2. Try to access `/dashboard`
3. Should redirect to `/auth/log-in`

### Test Logout
1. Click logout button
2. Should redirect to `/auth/log-in`
3. Try to access `/dashboard`
4. Should stay on login (no access)

---

## 🐛 Troubleshooting

### Issue: Middleware not redirecting

**Solution**: Check that cookie is being set:
```typescript
// In browser console
document.cookie
// Should show: authToken=...
```

### Issue: Infinite redirect loop

**Solution**: Make sure login page is in `publicRoutes` array.

### Issue: Token exists but still redirected

**Solution**: Check cookie name matches in:
- `src/middleware.ts` → `request.cookies.get('authToken')`
- `src/utils/auth.ts` → `document.cookie = 'authToken=...'`

---

## 📚 Summary

✅ Middleware automatically protects routes
✅ Auth utilities handle token management  
✅ Hooks provide easy integration
✅ Login/logout flow is complete
✅ Sidebar logout button works

Your authentication system is now fully set up! 🎉
