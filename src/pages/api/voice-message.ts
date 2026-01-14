import type { APIRoute } from 'astro';

export const prerender = false;

// list recordings or stream a specific one
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const runtime = locals.runtime;
    const bucket = runtime?.env?.VOICE_MESSAGES;

    if (!bucket) {
      return new Response(JSON.stringify({ error: 'Storage not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filename = url.searchParams.get('file');

    if (filename) {
      // stream specific recording
      const object = await bucket.get(filename);
      if (!object) {
        return new Response(JSON.stringify({ error: 'Recording not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(object.body, {
        headers: {
          'Content-Type': 'audio/webm',
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // list all recordings
    const listed = await bucket.list({ prefix: 'vada-' });
    const recordings = listed.objects.map(obj => ({
      filename: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString()
    })).sort((a, b) => b.uploaded.localeCompare(a.uploaded)); // newest first

    return new Response(JSON.stringify({ recordings }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Voice message list/get error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to retrieve recordings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

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
