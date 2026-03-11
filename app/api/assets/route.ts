import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    console.log('Power Automate Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Power Automate Error Response:', errorText);
      throw new Error(`Power Automate returned status ${response.status}`);
    }

    // Get the raw response text first
    const rawText = await response.text();
    console.log('Raw Response Text:', rawText);

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw text that failed to parse:', rawText);
      throw new Error(`Invalid JSON response from Power Automate`);
    }

    // Power Automate returns the assets array
    const assets = data.assets || data.value || data;

    // Console log the structure for debugging
    console.log('===== ASSET MANAGER LIST STRUCTURE =====');
    console.log('Full response:', JSON.stringify(data, null, 2));
    console.log('Assets count:', Array.isArray(assets) ? assets.length : 0);
    if (Array.isArray(assets) && assets.length > 0) {
      console.log('First asset structure:', JSON.stringify(assets[0], null, 2));
      console.log('Asset keys:', Object.keys(assets[0]));
    }
    console.log('=========================================');

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
