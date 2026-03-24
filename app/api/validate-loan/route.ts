import { NextRequest, NextResponse } from 'next/server';
import { verifyApiRequest } from '@/lib/auth/verify-api-request';

export async function POST(request: NextRequest) {
  // Verify session and API key
  const session = await verifyApiRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { loanId } = await request.json();

    if (!loanId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Loan ID is required',
        },
        { status: 400 }
      );
    }

    const flowUrl = process.env.PA_VALIDATE_LOAN_URL;

    if (!flowUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Loan validation flow URL not configured. Please set PA_VALIDATE_LOAN_URL.',
        },
        { status: 500 }
      );
    }

    const response = await fetch(flowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loanId }),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    // Check if loan exists - loan property will be null if not found
    if (!response.ok || !responseData.loan || responseData.loan === null) {
      return NextResponse.json(
        {
          ok: false,
          exists: false,
          error: 'Loan not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        exists: true,
        loan: responseData.loan,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
