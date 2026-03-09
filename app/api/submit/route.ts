export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log('Submitting to Power Automate:', data);
    console.log('Flow URL:', process.env.PA_FLOW_URL);

    if (!process.env.PA_FLOW_URL) {
      console.error('PA_FLOW_URL not configured');
      return new Response(JSON.stringify({ ok: false, error: 'Flow URL not configured' }), {
        status: 500,
      });
    }

    const res = await fetch(process.env.PA_FLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseText = await res.text();
    console.log('Power Automate response status:', res.status);
    console.log('Power Automate response:', responseText);

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Power Automate returned ${res.status}`,
          details: responseText,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ ok: true, message: 'Submitted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error submitting to Power Automate:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
}
