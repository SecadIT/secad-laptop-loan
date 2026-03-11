import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const flowUrl = process.env.PA_ISSUE_LAPTOP_FLOW_URL;

    if (!flowUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Issue laptop flow URL not configured. Please set PA_ISSUE_LAPTOP_FLOW_URL.',
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
        message: 'Issue laptop form submitted successfully',
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
