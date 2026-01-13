import type { APIRoute } from 'astro';

export const prerender = false;

// simple in-memory store (per isolate) + R2 fallback for persistence
// peers auto-expire after 30 seconds without heartbeat

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const room = url.searchParams.get('room')?.toUpperCase();

  if (!room) {
    return new Response(JSON.stringify({ error: 'Room code required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const runtime = locals.runtime;
    const bucket = runtime?.env?.VOICE_MESSAGES;

    if (!bucket) {
      return new Response(JSON.stringify({ peers: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // get room data from R2
    const key = `rooms/${room}.json`;
    const obj = await bucket.get(key);

    if (!obj) {
      return new Response(JSON.stringify({ peers: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await obj.json() as { peers: Record<string, number> };
    const now = Date.now();

    // filter out stale peers (older than 30 seconds)
    const activePeers = Object.entries(data.peers || {})
      .filter(([_, timestamp]) => now - timestamp < 30000)
      .map(([peerId]) => peerId);

    return new Response(JSON.stringify({ peers: activePeers }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get peers error:', error);
    return new Response(JSON.stringify({ peers: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as { room: string; peerId: string; action?: string };
    const { room, peerId, action } = body;

    if (!room || !peerId) {
      return new Response(JSON.stringify({ error: 'Room and peerId required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const roomCode = room.toUpperCase();
    const runtime = locals.runtime;
    const bucket = runtime?.env?.VOICE_MESSAGES;

    if (!bucket) {
      return new Response(JSON.stringify({ error: 'Storage not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const key = `rooms/${roomCode}.json`;
    const now = Date.now();

    // get existing room data
    let data: { peers: Record<string, number> } = { peers: {} };
    try {
      const obj = await bucket.get(key);
      if (obj) {
        data = await obj.json() as { peers: Record<string, number> };
      }
    } catch (e) {
      // start fresh if corrupted
      data = { peers: {} };
    }

    // clean stale peers (older than 30 seconds)
    const activePeers: Record<string, number> = {};
    for (const [id, timestamp] of Object.entries(data.peers || {})) {
      if (now - timestamp < 30000) {
        activePeers[id] = timestamp;
      }
    }

    if (action === 'leave') {
      // remove this peer
      delete activePeers[peerId];
    } else {
      // register/heartbeat this peer
      activePeers[peerId] = now;
    }

    // save back to R2
    await bucket.put(key, JSON.stringify({ peers: activePeers }), {
      httpMetadata: { contentType: 'application/json' }
    });

    // return other peers (excluding self)
    const otherPeers = Object.keys(activePeers).filter(id => id !== peerId);

    return new Response(JSON.stringify({
      success: true,
      peers: otherPeers,
      registered: peerId
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Register peer error:', error);
    return new Response(JSON.stringify({ error: 'Failed to register' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
