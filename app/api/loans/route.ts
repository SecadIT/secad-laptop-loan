import { NextRequest, NextResponse } from 'next/server';
import { verifyApiRequest } from '@/lib/auth/verify-api-request';

export async function GET(request: NextRequest) {
  // Verify session and API key
  const session = await verifyApiRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get Power Automate flow URL from environment variable
    const paFlowUrl = process.env.PA_LOANS_LIST_URL;

    if (!paFlowUrl) {
      return NextResponse.json(
        { ok: false, error: 'Loan list endpoint not configured' },
        { status: 500 }
      );
    }

    // Call Power Automate flow to get SharePoint list items
    const response = await fetch(paFlowUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Power Automate returned status ${response.status}`);
    }

    // Parse JSON response
    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid JSON response from Power Automate');
    }

    // Power Automate returns the loans array
    const loans = data.loans || data.value || data;

    return NextResponse.json({
      ok: true,
      loans: Array.isArray(loans) ? loans : [],
      count: Array.isArray(loans) ? loans.length : 0,
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch loans',
        loans: [],
      },
      { status: 500 }
    );
  }
}
