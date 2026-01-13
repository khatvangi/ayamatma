// /voice-message - receives and stores voice recordings
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Get the audio blob from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `vada-${timestamp}.webm`;

    // Store in R2 bucket
    // Access R2 bucket (binding name has hyphen, so use bracket notation)
    const bucket = env['voice-messages'];
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
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
