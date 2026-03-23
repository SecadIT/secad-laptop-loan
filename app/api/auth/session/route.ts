import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify the JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return NextResponse.json({
      user: { email: payload.email as string },
    });
  } catch (error) {
    console.error('Session verification failed:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
