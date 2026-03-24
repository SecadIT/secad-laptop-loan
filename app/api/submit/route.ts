import { NextRequest, NextResponse } from 'next/server';
import { verifyApiRequest } from '@/lib/auth/verify-api-request';

export async function POST(request: NextRequest) {
  // Verify session and API key
  const session = await verifyApiRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!process.env.PA_FLOW_URL) {
      return new Response(JSON.stringify({ ok: false, error: 'Flow URL not configured' }), {
        status: 500,
      });
    }

    const res = await fetch(process.env.PA_FLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseText = await res.text();

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Power Automate returned ${res.status}`,
          details: responseText,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ ok: true, message: 'Submitted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error submitting to Power Automate:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
}
