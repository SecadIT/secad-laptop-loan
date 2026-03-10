import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get Power Automate flow URL from environment variable
    const paFlowUrl = process.env.PA_STAFF_LIST_URL;

    if (!paFlowUrl) {
      return NextResponse.json(
        { ok: false, error: 'Staff list endpoint not configured' },
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
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid JSON response from Power Automate');
    }

    // Power Automate returns the staff array as 'staffs' (plural)
    const staff = data.staffs || data.staff || data.value || data;

    return NextResponse.json({
      ok: true,
      staff: Array.isArray(staff) ? staff : [],
      count: Array.isArray(staff) ? staff.length : 0,
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch staff',
        staff: [],
      },
      { status: 500 }
    );
  }
}
