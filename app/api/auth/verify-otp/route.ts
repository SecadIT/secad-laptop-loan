import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { otpStore } from '../send-otp/route';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const stored = otpStore.get(normalizedEmail);

    // Check if OTP exists
    if (!stored) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Check if OTP has expired
    if (Date.now() > stored.expires) {
      otpStore.delete(normalizedEmail);
      return NextResponse.json({ error: 'OTP has expired' }, { status: 401 });
    }

    // Verify OTP
    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    // OTP is valid, delete it (one-time use)
    otpStore.delete(normalizedEmail);

    // Create JWT session token (expires in 8 hours)
    const token = await new SignJWT({ email: normalizedEmail })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Create response with session cookie
    const response = NextResponse.json({
      ok: true,
      message: 'Login successful',
      user: { email: normalizedEmail },
    });

    // Set HTTP-only cookie
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
