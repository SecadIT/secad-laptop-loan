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
    const paFlowUrl = process.env.PA_ASSETS_LIST_URL;

    if (!paFlowUrl) {
      return NextResponse.json(
        { ok: false, error: 'Asset list endpoint not configured' },
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
      const errorText = await response.text();
      console.error('Power Automate Error Response:', errorText);
      throw new Error(`Power Automate returned status ${response.status}`);
    }

    // Parse JSON response
    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error(`Invalid JSON response from Power Automate`);
    }

    // Power Automate returns the assets array
    const assets = data.assets || data.value || data;

    return NextResponse.json({
      ok: true,
      assets: Array.isArray(assets) ? assets : [],
      count: Array.isArray(assets) ? assets.length : 0,
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assets',
        assets: [],
      },
      { status: 500 }
    );
  }
}
