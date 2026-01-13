import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `vada-${timestamp}.webm`;

    // Get R2 binding from Cloudflare runtime
    const runtime = locals.runtime;
    const bucket = runtime?.env?.VOICE_MESSAGES;

    if (!bucket) {
      console.error('R2 bucket binding not found');
      return new Response(JSON.stringify({
        error: 'Storage not configured',
        details: 'R2 bucket binding missing'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store in R2 bucket
    await bucket.put(filename, audioFile.stream(), {
      httpMetadata: {
        contentType: 'audio/webm',
      },
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    return new Response(JSON.stringify({
      success: true,
      filename,
      message: 'Voice message received. Thank you for your vāda.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Voice message upload error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to save voice message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
