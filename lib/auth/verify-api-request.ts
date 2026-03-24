import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const API_KEY = process.env.INTERNAL_API_KEY;

export interface SessionPayload {
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Verify API request has valid session and API key
 * @param request - Next.js request object
 * @returns Session payload if valid, null if invalid
 */
export async function verifyApiRequest(request: NextRequest): Promise<SessionPayload | null> {
  try {
    // 1. Check x-api-key header
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== API_KEY) {
      console.warn('Invalid or missing x-api-key header');
      return null;
    }

    // 2. Check session cookie (JWT)
    const token = request.cookies.get('session')?.value;
    if (!token) {
      console.warn('Missing session cookie');
      return null;
    }

    // 3. Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      email: payload.email as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error('API request verification failed:', error);
    return null;
  }
}
