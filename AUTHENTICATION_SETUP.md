# Authentication System

This application uses OTP (One-Time Password) authentication via email for secure access.

## Features

- ✅ Email-based login (restricted to @secad.ie domain)
- ✅ 6-digit OTP sent via Power Automate flow
- ✅ JWT session tokens (8-hour expiration)
- ✅ HTTP-only secure cookies
- ✅ Protected routes with middleware
- ✅ Auto-logout on token expiration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install jose
```

### 2. Configure Power Automate Flow

Follow the setup guide in [POWER_AUTOMATE_SEND_OTP_SETUP.md](POWER_AUTOMATE_SEND_OTP_SETUP.md) to create the email sending flow.

### 3. Environment Variables

Add to your `.env.local`:

```bash
# Generate a secure secret (use this command):
# openssl rand -base64 32
JWT_SECRET=your-secure-secret-key-here

# Power Automate Flow URL for sending OTP
PA_SEND_OTP_URL=your-power-automate-send-otp-flow-url
```

**Important:** Generate a secure JWT secret in production using:

```bash
openssl rand -base64 32
```

### 4. Test the Login Flow

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
   - You'll be redirected to `/login` automatically

3. Enter your SECAD email address
   - Only emails ending with `@secad.ie` are allowed

4. Check your email for the 6-digit code
   - Code expires in 5 minutes
   - Each code can only be used once

5. Enter the OTP
   - Auto-submits when all 6 digits are entered
   - On success, redirected to the home page

6. Session persists for 8 hours
   - Click "Logout" to end session early

## How It Works

### Login Flow

```
User enters email (@secad.ie)
    ↓
API generates 6-digit OTP
    ↓
OTP stored in memory (5-min expiry)
    ↓
Power Automate sends email with OTP
    ↓
User enters OTP code
    ↓
API verifies OTP
    ↓
JWT session token created
    ↓
Token stored in HTTP-only cookie
    ↓
User authenticated for 8 hours
```

### Security Features

1. **Email Validation**: Only `@secad.ie` emails accepted
2. **OTP Expiration**: Codes expire after 5 minutes
3. **One-Time Use**: Each OTP can only be used once
4. **JWT Tokens**: Cryptographically signed session tokens
5. **HTTP-only Cookies**: Tokens not accessible via JavaScript
6. **Route Protection**: Middleware enforces authentication
7. **Auto-logout**: Invalid/expired tokens clear automatically

## API Endpoints

### POST `/api/auth/send-otp`

Send OTP code to user's email.

**Request:**

```json
{
  "email": "user@secad.ie"
}
```

**Response:**

```json
{
  "ok": true,
  "message": "OTP sent to your email"
}
```

### POST `/api/auth/verify-otp`

Verify OTP and create session.

**Request:**

```json
{
  "email": "user@secad.ie",
  "otp": "123456"
}
```

**Response:**

```json
{
  "ok": true,
  "message": "Login successful",
  "user": {
    "email": "user@secad.ie"
  }
}
```

Sets `session` cookie with JWT token.

### GET `/api/auth/session`

Check current session status.

**Response (authenticated):**

```json
{
  "user": {
    "email": "user@secad.ie"
  }
}
```

**Response (not authenticated):**

```json
{
  "user": null
}
```

### POST `/api/auth/logout`

End current session.

**Response:**

```json
{
  "ok": true,
  "message": "Logged out successfully"
}
```

Clears `session` cookie.

## Usage in Components

### Check Authentication Status

```typescript
import { useSession } from '@/lib/hooks/use-session';

export default function MyPage() {
  const { user, loading, logout } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Logged in as: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Disable Auto-redirect

```typescript
// Don't redirect to login if not authenticated
const { user, loading } = useSession(false);
```

## Middleware Configuration

Protected routes are defined in `middleware.ts`:

```typescript
// Public routes (no auth required)
const publicRoutes = ['/login'];

// Everything else requires authentication
// except API routes, static files, and public assets
```

## Production Considerations

### Current Implementation (Development)

- OTPs stored in memory using `Map`
- Resets when server restarts
- Not suitable for multi-instance deployments

### Production Recommendations

1. **Use Redis for OTP Storage**

   ```bash
   npm install ioredis
   ```

2. **Update send-otp route:**

   ```typescript
   import Redis from 'ioredis';
   const redis = new Redis(process.env.REDIS_URL);

   // Store OTP
   await redis.setex(
     `otp:${email}`,
     300, // 5 minutes
     otp
   );
   ```

3. **Update verify-otp route:**

   ```typescript
   const storedOtp = await redis.get(`otp:${email}`);
   if (storedOtp === otp) {
     await redis.del(`otp:${email}`);
     // Create session...
   }
   ```

4. **Use secure JWT secret:**

   ```bash
   openssl rand -base64 32 > .env.production.local
   ```

5. **Enable HTTPS** for secure cookies

6. **Consider rate limiting** to prevent brute force attacks

## Troubleshooting

### OTP email not received

1. Check spam/junk folder
2. Verify Power Automate flow is running
3. Check flow run history for errors
4. Ensure email address ends with `@secad.ie`

### "Invalid or expired OTP" error

- Code expires after 5 minutes
- Each code can only be used once
- Request a new code if needed

### Session expires too quickly

- Default: 8 hours
- Adjust in `verify-otp/route.ts`:
  ```typescript
  .setExpirationTime('24h') // Change to 24 hours
  ```

### Stuck in login loop

1. Clear cookies in browser
2. Check browser console for errors
3. Verify JWT_SECRET is set in `.env.local`
4. Ensure middleware is not blocking `/login` route

## Email Template Preview

The OTP email includes:

- SECAD branding header
- Large, easy-to-read 6-digit code
- 5-minute expiration notice
- Security notice
- Professional footer

See [POWER_AUTOMATE_SEND_OTP_SETUP.md](POWER_AUTOMATE_SEND_OTP_SETUP.md) for the full HTML template.
