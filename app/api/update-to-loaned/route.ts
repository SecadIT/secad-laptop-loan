import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serialNumber, itOfficerEmail, loanId } = body;

    // Validate required fields
    if (!serialNumber) {
      return NextResponse.json({ error: 'Missing required field: serialNumber' }, { status: 400 });
    }

    const powerAutomateUrl = process.env.PA_UPDATE_TO_LOANED_URL;

    if (!powerAutomateUrl) {
      return NextResponse.json(
        { error: 'Power Automate URL not configured. Please set PA_UPDATE_TO_LOANED_URL.' },
        { status: 500 }
      );
    }

    // Prepare data for Power Automate
    const updateData = {
      serialNumber,
      itOfficerEmail,
      ...(loanId && { loanId }), // Include loanId if provided
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
        { error: 'Failed to update asset to loaned status', details: errorText },
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
      message: 'Asset status updated to loaned successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error updating asset to loaned:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
