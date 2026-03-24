# API Security Implementation

This document explains the security measures implemented to protect the API routes.

## Overview

The application uses a **dual-layer authentication** approach:

1. **JWT Session Cookies** - Validates user is logged in with a @secad.ie account
2. **x-api-key Header** - Ensures requests come from the legitimate web application

## How It Works

### Server-Side (API Routes)

All protected API routes verify both:

- Valid JWT session cookie
- Matching x-api-key header

```typescript
import { verifyApiRequest } from '@/lib/auth/verify-api-request';

export async function GET(request: NextRequest) {
  // Verify session and API key
  const session = await verifyApiRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Continue with API logic...
}
```

### Client-Side (Frontend)

All API calls include the x-api-key header automatically:

```typescript
import { fetchApi } from '@/lib/api-client';

const response = await fetchApi('/api/assets', {
  method: 'GET',
});
```

## Environment Variables

### Server-Side

```env
JWT_SECRET=your-jwt-secret-key
INTERNAL_API_KEY=your-internal-api-key
```

### Client-Side (Public)

```env
NEXT_PUBLIC_INTERNAL_API_KEY=your-internal-api-key
```

**Note**: Both `INTERNAL_API_KEY` and `NEXT_PUBLIC_INTERNAL_API_KEY` must have the **same value**.

## Security Benefits

✅ **Prevents unauthorized access** - Must be logged in with @secad.ie account  
✅ **Prevents programmatic access** - Staff can't use curl/Postman with just their session cookie  
✅ **Prevents CSRF attacks** - Requires specific header only your app sends  
✅ **Simple to implement** - Single verification function across all routes

## Protected Routes

The following API routes are protected:

- `/api/assets` - Asset inventory list
- `/api/loans` - Loan records list
- `/api/staff` - Staff directory
- `/api/submit` - New loan request submission
- `/api/issue-laptop` - Issue laptop to client
- `/api/signature` - Signature collection
- `/api/validate-loan` - Loan ID validation
- `/api/update-asset-status` - Update asset status
- `/api/update-to-loaned` - Mark asset as loaned
- `/api/return-laptop` - Process laptop return

## Public Routes

These routes remain public (no API key required):

- `/api/auth/send-otp` - Send OTP email
- `/api/auth/verify-otp` - Verify OTP and create session
- `/api/auth/logout` - Destroy session
- `/api/auth/session` - Check current session

## Generating Secure Keys

### JWT Secret

```bash
openssl rand -base64 32
```

### Internal API Key

```bash
openssl rand -base64 32
```

## Testing

To test the security:

1. **Without API key** - Should return 401 Unauthorized

```bash
curl http://localhost:3000/api/assets
```

2. **With session but no API key** - Should return 401 Unauthorized

```bash
curl http://localhost:3000/api/assets \\
  -H "Cookie: session=your-jwt-token"
```

3. **With both session and API key** - Should return 200 OK

```bash
curl http://localhost:3000/api/assets \\
  -H "Cookie: session=your-jwt-token" \\
  -H "x-api-key: your-api-key"
```

## Important Notes

⚠️ **Never commit `.env` file** - It contains secrets  
⚠️ **Rotate keys regularly** - Especially JWT_SECRET  
⚠️ **Use HTTPS in production** - Prevents header/cookie interception  
⚠️ **Keep INTERNAL_API_KEY secret** - Don't expose in client-side logs

## Migration Notes

If you're upgrading from a version without API security:

1. Add environment variables to `.env`:

   ```env
   INTERNAL_API_KEY=generate-a-secure-key
   NEXT_PUBLIC_INTERNAL_API_KEY=same-key-as-above
   ```

2. Restart your development server:

   ```bash
   npm run dev
   ```

3. All API calls will automatically include the x-api-key header via `fetchApi()`
