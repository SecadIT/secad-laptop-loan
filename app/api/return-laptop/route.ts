import { NextRequest, NextResponse } from 'next/server';
import { verifyApiRequest } from '@/lib/auth/verify-api-request';

export async function POST(request: NextRequest) {
  // Verify session and API key
  const session = await verifyApiRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      loanId,
      serialNumber,
      returnDate,
      condition,
      damageNotes,
      itemsReturned,
      witnessName,
      witnessEmail,
    } = body;

    // Validate required fields
    if (
      !loanId ||
      !serialNumber ||
      !returnDate ||
      !condition ||
      !itemsReturned ||
      !witnessName ||
      !witnessEmail
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call Power Automate flow to update Asset Manager
    const paReturnUrl = process.env.PA_RETURN_LAPTOP_URL;
    if (!paReturnUrl) {
      console.error('PA_RETURN_LAPTOP_URL not configured');
      return NextResponse.json({ error: 'Return laptop service not configured' }, { status: 500 });
    }

    // Call Power Automate flow to update Loan List status
    const paUpdateLoanUrl = process.env.PA_UPDATE_LOAN_STATUS_URL;
    if (!paUpdateLoanUrl) {
      console.error('PA_UPDATE_LOAN_STATUS_URL not configured');
      return NextResponse.json(
        { error: 'Update loan status service not configured' },
        { status: 500 }
      );
    }

    // Prepare payload with all return data (both flows will receive the same data)
    const payload = {
      loanId,
      serialNumber,
      returnDate,
      condition,
      damageNotes: damageNotes || '',
      itemsReturned,
      witnessName,
      witnessEmail,
      status: 'Returned',
    };

    // Update Asset Manager with return details
    const returnResponse = await fetch(paReturnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle both JSON and non-JSON responses for Asset Manager update
    const contentType = returnResponse.headers.get('content-type');
    let returnResult;

    if (contentType && contentType.includes('application/json')) {
      returnResult = await returnResponse.json();
    } else {
      const text = await returnResponse.text();
      returnResult = { ok: returnResponse.ok, message: text || 'Asset return processed' };
    }

    if (!returnResponse.ok) {
      console.error('Asset Manager update failed:', returnResult);
      return NextResponse.json(
        { error: returnResult.error || 'Failed to update asset return details' },
        { status: returnResponse.status }
      );
    }

    // Update Loan List status to "Returned" (same payload)
    const loanStatusResponse = await fetch(paUpdateLoanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle both JSON and non-JSON responses for Loan List update
    const loanContentType = loanStatusResponse.headers.get('content-type');
    let loanResult;

    if (loanContentType && loanContentType.includes('application/json')) {
      loanResult = await loanStatusResponse.json();
    } else {
      const text = await loanStatusResponse.text();
      loanResult = { ok: loanStatusResponse.ok, message: text || 'Loan status updated' };
    }

    if (!loanStatusResponse.ok) {
      console.error('Loan List update failed:', loanResult);
      return NextResponse.json(
        { error: loanResult.error || 'Failed to update loan status' },
        { status: loanStatusResponse.status }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Laptop return processed successfully',
      assetUpdate: returnResult,
      loanUpdate: loanResult,
    });
  } catch (error) {
    console.error('Error in return-laptop:', error);
    return NextResponse.json({ error: 'Failed to process laptop return' }, { status: 500 });
  }
}
