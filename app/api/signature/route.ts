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

    const flowUrl = process.env.PA_SIGNATURE_FLOW_URL;

    if (!flowUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Signature flow URL not configured. Please set PA_SIGNATURE_FLOW_URL.',
        },
        { status: 500 }
      );
    }

    const response = await fetch(flowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Power Automate returned ${response.status}`,
          details: responseText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Signature submitted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
