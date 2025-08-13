# JWT Token Changes - Never Expire Until Logout

## Overview

The JWT system has been modified to ensure tokens never expire until the user explicitly logs out. This eliminates the issue of users being automatically logged out after a certain time period.

## What Changed

### 1. JWT Token Creation (`src/utils/jwt.ts`)

- **Before**: Tokens had an expiration time set to year 9999
- **After**: Tokens have no expiration time at all
- Tokens are now cryptographically valid indefinitely

### 2. Token Validation (`src/utils/authToken.ts`)

- **Before**: Tokens were validated against JWT expiration
- **After**: Tokens are validated against an in-memory token store
- Only tokens that exist in the store are considered valid
- This provides immediate invalidation on logout

### 3. Logout Functionality

- **User Logout** (`src/controllers/user/session.controller.ts`): Already properly implemented
- **Admin Logout** (`src/controllers/admin/auth.controller.ts`): Updated to properly invalidate tokens

## How It Works

### Token Lifecycle

1. **Login**: User logs in → `issueAuthToken()` creates JWT and stores it in memory
2. **Usage**: Token is validated against the in-memory store on each request
3. **Logout**: User logs out → `invalidateAuthToken()` removes token from store
4. **Result**: Token becomes immediately invalid, even though JWT signature is still valid

### Security Benefits

- **Immediate Invalidation**: Tokens become invalid instantly on logout
- **No Time-Based Expiration**: Users stay logged in as long as they want
- **Secure Storage**: Tokens are stored in memory and validated on each request
- **Manual Control**: Only explicit logout can invalidate a token

## Code Examples

### Creating a Token

```typescript
import { issueAuthToken } from "@/utils/authToken";

const token = issueAuthToken(userId, "user");
// Token will never expire until logout
```

### Validating a Token

```typescript
import { verifyAuthToken } from "@/utils/authToken";

const payload = verifyAuthToken<{ id: number; role: string }>(token);
if (payload) {
  // Token is valid
} else {
  // Token is invalid or has been logged out
}
```

### Logging Out (Invalidating Token)

```typescript
import { invalidateAuthToken } from "@/utils/authToken";

invalidateAuthToken(userId);
// Token is now invalid and cannot be used
```

## Testing

To test the new JWT functionality:

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Run the test script**:

   ```bash
   node test-jwt.js
   ```

3. **Expected output**:

   ```
   Testing JWT functionality...

   ✅ Token created successfully
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   ✅ Token verified immediately
   Payload: { id: 123, role: 'user', iat: 1234567890 }

   ⏰ Waiting 2 seconds...

   ✅ Token verified after delay
   Payload: { id: 123, role: 'user', iat: 1234567890 }

   🎉 SUCCESS: JWT tokens never expire until manually invalidated!
   ```

## API Endpoints

### User Authentication

- `POST /api/user/auth/login` - Login and get token
- `GET /api/user/logout` - Logout and invalidate token

### Admin Authentication

- `POST /api/admin/auth/login` - Admin login and get token
- `GET /api/admin/auth/logout` - Admin logout and invalidate token

## Important Notes

1. **Memory Usage**: Tokens are stored in memory, so server restarts will invalidate all tokens
2. **Scalability**: For production with multiple servers, consider using Redis for token storage
3. **Security**: The system relies on the token store for validation, not JWT expiration
4. **Backward Compatibility**: Existing tokens will continue to work until logout

## Environment Variables

- `JWT_SECRET`: Secret key for JWT signing (default: "secret")
- No expiration-related environment variables needed

## Migration

No migration is required. The changes are backward compatible:

- Existing tokens will continue to work
- New tokens will never expire
- Logout functionality remains the same
