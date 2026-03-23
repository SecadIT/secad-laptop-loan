import { NextRequest, NextResponse } from 'next/server';

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email is from secad.ie domain
    if (!email || !email.toLowerCase().endsWith('@secad.ie')) {
      return NextResponse.json(
        { error: 'Only @secad.ie email addresses are allowed' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Store OTP (in production, use proper storage)
    otpStore.set(email.toLowerCase(), {
      otp,
      expires: expiresAt.getTime(),
    });

    // Clean up expired OTPs
    setTimeout(
      () => {
        otpStore.delete(email.toLowerCase());
      },
      5 * 60 * 1000
    );

    // Call Power Automate flow to send email
    const paUrl = process.env.PA_SEND_OTP_URL;
    if (!paUrl) {
      console.error('PA_SEND_OTP_URL not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const response = await fetch(paUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        otp,
        expiresAt: expiresAt.toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Power Automate flow failed:', response.statusText);
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

// Export the OTP store for verification
export { otpStore };
