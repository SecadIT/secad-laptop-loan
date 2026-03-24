import { NextRequest, NextResponse } from 'next/server';
import { verifyApiRequest } from '@/lib/auth/verify-api-request';

export async function POST(req: NextRequest) {
  // Verify session and API key
  const session = await verifyApiRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { serialNumber, status, itOfficerEmail, loanId } = body;

    // Validate required fields
    if (!serialNumber || !itOfficerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: serialNumber, itOfficerEmail' },
        { status: 400 }
      );
    }

    const powerAutomateUrl = process.env.PA_UPDATE_ASSET_STATUS_URL;

    if (!powerAutomateUrl) {
      return NextResponse.json({ error: 'Power Automate URL not configured' }, { status: 500 });
    }

    // Prepare data for Power Automate
    const updateData = {
      serialNumber,
      status,
      itOfficerEmail,
      ...(loanId && { loanId }), // Include loanId only if provided (for future use)
    };

    const response = await fetch(powerAutomateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Power Automate error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to update asset status', details: errorText },
        { status: response.status }
      );
    }

    // Handle response - Power Automate might return empty or non-JSON response
    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // If not JSON, just return success
      result = { message: 'Update completed' };
    }

    return NextResponse.json({
      success: true,
      message: 'Asset status updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error updating asset status:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
