import type { APIRoute } from 'astro';

export const prerender = false;

interface RoomState {
  hostPeerId: string;
  hostName: string;
  created: string;
  waiting: Array<{ peerId: string; name: string }>;
  admitted: Array<{ peerId: string; name: string }>;
}

// create new room
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { token, hostPeerId, hostName } = await request.json();

    if (!token || !hostPeerId || !hostName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const runtime = locals.runtime;
    const bucket = runtime?.env?.VOICE_MESSAGES;

    if (!bucket) {
      return new Response(JSON.stringify({ error: 'Storage not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const roomState: RoomState = {
      hostPeerId,
      hostName,
      created: new Date().toISOString(),
      waiting: [],
      admitted: []
    };

    await bucket.put(`video-rooms/${token}.json`, JSON.stringify(roomState), {
      httpMetadata: { contentType: 'application/json' }
    });

    return new Response(JSON.stringify({ success: true, room: roomState }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create room error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create room' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// get room state
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const runtime = locals.runtime;
    const bucket = runtime?.env?.VOICE_MESSAGES;

    if (!bucket) {
      return new Response(JSON.stringify({ error: 'Storage not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const object = await bucket.get(`video-rooms/${token}.json`);

    if (!object) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const roomState = await object.json();

    return new Response(JSON.stringify({ room: roomState }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get room error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get room' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// update room state (admit, reject, join waiting, leave)
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const { token, action, peerId, name } = await request.json();

    if (!token || !action) {
      return new Response(JSON.stringify({ error: 'Token and action required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const runtime = locals.runtime;
    const bucket = runtime?.env?.VOICE_MESSAGES;

    if (!bucket) {
      return new Response(JSON.stringify({ error: 'Storage not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const object = await bucket.get(`video-rooms/${token}.json`);

    if (!object) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const roomState: RoomState = await object.json();

    switch (action) {
      case 'join-waiting':
        if (!peerId || !name) {
          return new Response(JSON.stringify({ error: 'peerId and name required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        roomState.waiting = roomState.waiting.filter(p => p.peerId !== peerId);
        roomState.admitted = roomState.admitted.filter(p => p.peerId !== peerId);
        roomState.waiting.push({ peerId, name });
        break;

      case 'admit':
        if (!peerId) {
          return new Response(JSON.stringify({ error: 'peerId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const toAdmit = roomState.waiting.find(p => p.peerId === peerId);
        if (toAdmit) {
          roomState.waiting = roomState.waiting.filter(p => p.peerId !== peerId);
          roomState.admitted.push(toAdmit);
        }
        break;

      case 'reject':
        if (!peerId) {
          return new Response(JSON.stringify({ error: 'peerId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        roomState.waiting = roomState.waiting.filter(p => p.peerId !== peerId);
        break;

      case 'leave':
        if (!peerId) {
          return new Response(JSON.stringify({ error: 'peerId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        roomState.waiting = roomState.waiting.filter(p => p.peerId !== peerId);
        roomState.admitted = roomState.admitted.filter(p => p.peerId !== peerId);
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    await bucket.put(`video-rooms/${token}.json`, JSON.stringify(roomState), {
      httpMetadata: { contentType: 'application/json' }
    });

    return new Response(JSON.stringify({ success: true, room: roomState }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update room error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update room' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
