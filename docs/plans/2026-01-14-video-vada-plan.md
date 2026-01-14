# Video Vāda Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build invitation-only video rooms with waiting room, chat, and screen sharing for philosophical debate.

**Architecture:** PeerJS for WebRTC signaling and media. R2 for room state (waiting/admitted lists). Host controls admission. Video grid scales 1-6 participants. Chat via PeerJS data channels.

**Tech Stack:** Astro, PeerJS, WebRTC, Cloudflare R2, TypeScript

---

## Task 1: Video Room API Endpoint

**Files:**
- Create: `src/pages/api/video-room.ts`

**Step 1: Create the API file with POST handler (create room)**

```typescript
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
```

**Step 2: Add GET handler (fetch room state)**

Add after POST handler:

```typescript
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
```

**Step 3: Add PUT handler (admit/reject/join waiting)**

Add after GET handler:

```typescript
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
        // remove if already in waiting/admitted, then add to waiting
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
```

**Step 4: Commit**

```bash
git add src/pages/api/video-room.ts
git commit -m "feat: add video room API for waiting room state"
```

---

## Task 2: Update Vāda Landing Page

**Files:**
- Modify: `src/pages/vada.astro`

**Step 1: Add "Start Private Video Vāda" button**

After the existing room-create div (around line 22), add:

```html
      <div class="room-divider">
        <span>or</span>
      </div>

      <div class="room-create">
        <button class="vada-btn video-btn" id="create-video-room-btn">
          <span class="btn-icon">📹</span>
          <span class="btn-label">Start Private Video Vāda</span>
        </button>
        <p class="action-hint">Invitation-only video room with waiting room</p>
      </div>
```

**Step 2: Add CSS for video button**

Add in the style section:

```css
.vada-btn.video-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}
```

**Step 3: Add JavaScript for video room creation**

Add in the script section:

```javascript
// Create private video room
function generateToken() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

document.getElementById('create-video-room-btn')?.addEventListener('click', () => {
  const token = generateToken();
  window.location.href = `/vada/v/${token}`;
});
```

**Step 4: Commit**

```bash
git add src/pages/vada.astro
git commit -m "feat: add private video vāda button to landing page"
```

---

## Task 3: Create Video Room Page Structure

**Files:**
- Create: `src/pages/vada/v/[token].astro`

**Step 1: Create basic page with pre-join screen**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';

export const prerender = false;

const { token } = Astro.params;
const roomToken = token || '';
---

<BaseLayout title="Video Vāda" description="Private video dialogue" lang="en">
  <!-- Pre-join screen -->
  <div class="prejoin-screen" id="prejoin-screen">
    <div class="prejoin-card">
      <h1 class="prejoin-title">Join Video Vāda</h1>

      <div class="device-preview">
        <video id="local-preview" autoplay muted playsinline></video>
        <div class="device-status" id="device-status">Checking devices...</div>
      </div>

      <div class="prejoin-form">
        <input
          type="text"
          id="name-input"
          placeholder="Your name"
          maxlength="30"
          autocomplete="off"
        />
        <button class="join-btn" id="join-btn" disabled>
          Join Room
        </button>
      </div>

      <p class="prejoin-note">Camera and microphone access required</p>
    </div>
  </div>

  <!-- Waiting screen (for guests) -->
  <div class="waiting-screen" id="waiting-screen" style="display: none;">
    <div class="waiting-card">
      <div class="waiting-spinner"></div>
      <h2>Waiting for host to admit you...</h2>
      <p id="waiting-name"></p>
      <video id="waiting-preview" autoplay muted playsinline></video>
    </div>
  </div>

  <!-- Rejected screen -->
  <div class="rejected-screen" id="rejected-screen" style="display: none;">
    <div class="rejected-card">
      <h2>❌ Host declined your request</h2>
      <a href="/vada" class="back-link">Back to Vāda</a>
    </div>
  </div>

  <!-- Main room -->
  <div class="room-screen" id="room-screen" style="display: none;">
    <header class="room-header">
      <h1 class="room-title">Video Vāda</h1>
      <div class="room-actions">
        <button class="header-btn" id="copy-link-btn" title="Copy invite link">🔗</button>
        <button class="header-btn leave" id="leave-btn" title="Leave room">✕</button>
      </div>
    </header>

    <div class="room-main">
      <!-- Video grid -->
      <div class="video-grid" id="video-grid">
        <!-- Videos inserted dynamically -->
      </div>

      <!-- Chat sidebar -->
      <div class="chat-panel" id="chat-panel">
        <div class="chat-header">
          <span>💬 Chat</span>
          <button class="chat-toggle" id="chat-toggle">−</button>
        </div>
        <div class="chat-recipient">
          <select id="chat-recipient">
            <option value="everyone">Everyone</option>
          </select>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
          <input type="text" id="chat-input" placeholder="Type message..." />
          <button id="chat-send">Send</button>
        </div>
      </div>
    </div>

    <!-- Controls bar -->
    <div class="controls-bar">
      <button class="control-btn" id="mute-btn" title="Mute">
        <span class="btn-icon">🎤</span>
        <span class="btn-label">Mute</span>
      </button>
      <button class="control-btn" id="camera-btn" title="Camera">
        <span class="btn-icon">📷</span>
        <span class="btn-label">Camera</span>
      </button>
      <button class="control-btn" id="share-btn" title="Share Screen">
        <span class="btn-icon">🖥️</span>
        <span class="btn-label">Share</span>
      </button>
      <button class="control-btn" id="record-btn" title="Record">
        <span class="btn-icon">⏺</span>
        <span class="btn-label">Record</span>
      </button>
    </div>

    <!-- Host waiting room panel -->
    <div class="waiting-room-panel" id="waiting-room-panel" style="display: none;">
      <h3>Waiting Room</h3>
      <div class="waiting-list" id="waiting-list">
        <p class="empty-waiting">No one waiting</p>
      </div>
    </div>
  </div>
</BaseLayout>
```

**Step 2: Commit structure**

```bash
git add src/pages/vada/v/\[token\].astro
git commit -m "feat: add video room page structure"
```

---

## Task 4: Video Room CSS

**Files:**
- Modify: `src/pages/vada/v/[token].astro`

**Step 1: Add comprehensive styles**

Add after the HTML, before any script:

```html
<style>
  /* Pre-join screen */
  .prejoin-screen, .waiting-screen, .rejected-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .prejoin-card, .waiting-card, .rejected-card {
    background: var(--bg-card);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
  }

  .prejoin-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .device-preview {
    position: relative;
    margin-bottom: 1.5rem;
  }

  .device-preview video, .waiting-card video {
    width: 100%;
    max-width: 300px;
    aspect-ratio: 4/3;
    background: #1a1a1a;
    border-radius: 12px;
    object-fit: cover;
  }

  .device-status {
    font-size: 0.85rem;
    color: var(--muted);
    margin-top: 0.5rem;
  }

  .device-status.ready {
    color: #22c55e;
  }

  .device-status.error {
    color: #ef4444;
  }

  .prejoin-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  #name-input {
    padding: 0.85rem 1rem;
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    background: var(--bg-paper);
    color: var(--text);
    font-size: 1rem;
    text-align: center;
  }

  #name-input:focus {
    outline: none;
    border-color: var(--accent-cool);
  }

  .join-btn {
    padding: 1rem;
    background: linear-gradient(135deg, var(--accent-cool) 0%, var(--accent-warm) 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .join-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .prejoin-note {
    font-size: 0.8rem;
    color: var(--muted);
    margin-top: 1rem;
  }

  /* Waiting screen */
  .waiting-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--glass-border);
    border-top-color: var(--accent-cool);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .waiting-card h2, .rejected-card h2 {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .back-link {
    display: inline-block;
    margin-top: 1rem;
    color: var(--accent-cool);
  }

  /* Main room */
  .room-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--glass-border);
  }

  .room-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1.25rem;
  }

  .room-actions {
    display: flex;
    gap: 0.5rem;
  }

  .header-btn {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--glass-border);
    background: var(--bg-card);
    cursor: pointer;
    font-size: 1.1rem;
  }

  .header-btn.leave:hover {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }

  .room-main {
    flex: 1;
    display: flex;
    padding: 1rem;
    gap: 1rem;
    overflow: hidden;
  }

  /* Video grid */
  .video-grid {
    flex: 1;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    align-content: center;
  }

  .video-grid.grid-2 { grid-template-columns: repeat(2, 1fr); }
  .video-grid.grid-3 { grid-template-columns: repeat(3, 1fr); }
  .video-grid.grid-4 { grid-template-columns: repeat(2, 1fr); }
  .video-grid.grid-5, .video-grid.grid-6 { grid-template-columns: repeat(3, 1fr); }

  .video-tile {
    position: relative;
    background: #1a1a1a;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 4/3;
  }

  .video-tile video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .video-tile.screen-share video {
    object-fit: contain;
  }

  .video-tile .tile-name {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    background: rgba(0,0,0,0.6);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .video-tile .tile-status {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 0.9rem;
  }

  .video-tile.muted::after {
    content: '🔇';
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
  }

  .video-tile.camera-off video {
    display: none;
  }

  .video-tile.camera-off::before {
    content: '';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-cool) 0%, var(--accent-warm) 100%);
  }

  .video-tile .avatar-placeholder {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-cool) 0%, var(--accent-warm) 100%);
    font-size: 2rem;
    color: white;
  }

  .video-tile.camera-off .avatar-placeholder {
    display: flex;
  }

  /* Controls bar */
  .controls-bar {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    border-top: 1px solid var(--glass-border);
    background: var(--bg-paper);
  }

  .control-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    background: var(--bg-card);
    cursor: pointer;
    transition: all 0.2s;
  }

  .control-btn:hover {
    background: var(--bg-paper);
  }

  .control-btn.active {
    background: var(--accent-warm);
    color: white;
    border-color: var(--accent-warm);
  }

  .control-btn.recording {
    background: #dc2626;
    color: white;
    border-color: #dc2626;
    animation: pulse-record 1.5s infinite;
  }

  @keyframes pulse-record {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
  }

  .control-btn .btn-icon {
    font-size: 1.25rem;
  }

  .control-btn .btn-label {
    font-size: 0.7rem;
    margin-top: 0.25rem;
  }

  /* Chat panel */
  .chat-panel {
    width: 280px;
    display: flex;
    flex-direction: column;
    background: var(--bg-card);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    overflow: hidden;
  }

  .chat-panel.collapsed {
    width: auto;
  }

  .chat-panel.collapsed .chat-recipient,
  .chat-panel.collapsed .chat-messages,
  .chat-panel.collapsed .chat-input {
    display: none;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--glass-border);
    font-weight: 500;
  }

  .chat-toggle {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--muted);
  }

  .chat-recipient {
    padding: 0.5rem;
    border-bottom: 1px solid var(--glass-border);
  }

  .chat-recipient select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--glass-border);
    border-radius: 6px;
    background: var(--bg-paper);
    color: var(--text);
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 200px;
    max-height: 400px;
  }

  .chat-message {
    padding: 0.5rem 0.75rem;
    background: var(--bg-paper);
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .chat-message.private {
    background: rgba(99, 102, 241, 0.1);
    border-left: 2px solid #6366f1;
  }

  .chat-message .sender {
    font-weight: 600;
    color: var(--accent-cool);
    font-size: 0.75rem;
  }

  .chat-message.private .sender::after {
    content: ' (private)';
    color: #6366f1;
  }

  .chat-input {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    border-top: 1px solid var(--glass-border);
  }

  .chat-input input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--glass-border);
    border-radius: 6px;
    background: var(--bg-paper);
    color: var(--text);
  }

  .chat-input button {
    padding: 0.5rem 1rem;
    background: var(--accent-cool);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  /* Waiting room panel (host only) */
  .waiting-room-panel {
    position: fixed;
    bottom: 80px;
    right: 1rem;
    width: 300px;
    background: var(--bg-card);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: var(--shadow-soft);
  }

  .waiting-room-panel h3 {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .waiting-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .waiting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: var(--bg-paper);
    border-radius: 8px;
  }

  .waiting-item-name {
    font-weight: 500;
  }

  .waiting-item-actions {
    display: flex;
    gap: 0.5rem;
  }

  .waiting-item-actions button {
    padding: 0.35rem 0.75rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .admit-btn {
    background: #22c55e;
    color: white;
  }

  .reject-btn {
    background: #ef4444;
    color: white;
  }

  .empty-waiting {
    font-size: 0.85rem;
    color: var(--muted);
    text-align: center;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .room-main {
      flex-direction: column;
    }

    .chat-panel {
      width: 100%;
      max-height: 300px;
    }

    .video-grid.grid-2,
    .video-grid.grid-3,
    .video-grid.grid-4,
    .video-grid.grid-5,
    .video-grid.grid-6 {
      grid-template-columns: repeat(2, 1fr);
    }

    .waiting-room-panel {
      left: 1rem;
      right: 1rem;
      width: auto;
    }
  }
</style>
```

**Step 2: Commit CSS**

```bash
git add src/pages/vada/v/\[token\].astro
git commit -m "feat: add video room CSS styles"
```

---

## Task 5: Video Room JavaScript - Initialization & Pre-join

**Files:**
- Modify: `src/pages/vada/v/[token].astro`

**Step 1: Add script with constants and initialization**

Add after the closing `</style>` tag:

```html
<script is:inline define:vars={{ roomToken }}>
  const ROOM_TOKEN = roomToken;
  const MAX_PARTICIPANTS = 6;

  // ICE servers for NAT traversal
  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ];

  // State
  let peer = null;
  let localStream = null;
  let screenStream = null;
  let myName = '';
  let isHost = false;
  let isMuted = false;
  let isCameraOff = false;
  let isScreenSharing = false;
  let isRecording = false;
  let mediaRecorder = null;
  let audioChunks = [];
  let connections = new Map(); // peerId -> { conn, call, stream, name }
  let pollInterval = null;

  // DOM elements
  const prejoinScreen = document.getElementById('prejoin-screen');
  const waitingScreen = document.getElementById('waiting-screen');
  const rejectedScreen = document.getElementById('rejected-screen');
  const roomScreen = document.getElementById('room-screen');
  const localPreview = document.getElementById('local-preview');
  const waitingPreview = document.getElementById('waiting-preview');
  const deviceStatus = document.getElementById('device-status');
  const nameInput = document.getElementById('name-input');
  const joinBtn = document.getElementById('join-btn');
  const waitingName = document.getElementById('waiting-name');
  const videoGrid = document.getElementById('video-grid');
  const waitingRoomPanel = document.getElementById('waiting-room-panel');
  const waitingList = document.getElementById('waiting-list');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatRecipient = document.getElementById('chat-recipient');

  // Pre-join: request camera and mic
  async function initPreview() {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localPreview.srcObject = localStream;
      deviceStatus.textContent = '✓ Camera and microphone ready';
      deviceStatus.classList.add('ready');
      joinBtn.disabled = false;
    } catch (err) {
      console.error('Device access error:', err);
      deviceStatus.textContent = '✗ Could not access camera/microphone';
      deviceStatus.classList.add('error');
    }
  }

  // Enable join when name entered
  nameInput.addEventListener('input', () => {
    joinBtn.disabled = !nameInput.value.trim() || !localStream;
  });

  // Start preview on page load
  initPreview();
</script>
```

**Step 2: Commit initialization**

```bash
git add src/pages/vada/v/\[token\].astro
git commit -m "feat: add video room initialization and pre-join"
```

---

## Task 6: Video Room JavaScript - Room Join Logic

**Files:**
- Modify: `src/pages/vada/v/[token].astro`

**Step 1: Add join button handler and room state checking**

Add to the script, after the initialization code:

```javascript
  // Load PeerJS
  function loadPeerJS() {
    return new Promise((resolve, reject) => {
      if (window.Peer) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Check if room exists and if we're the first (host)
  async function checkRoom() {
    try {
      const response = await fetch(`/api/video-room?token=${ROOM_TOKEN}`);
      if (response.status === 404) {
        return { exists: false };
      }
      const data = await response.json();
      return { exists: true, room: data.room };
    } catch (err) {
      console.error('Check room error:', err);
      return { exists: false };
    }
  }

  // Create room as host
  async function createRoom(peerId, name) {
    const response = await fetch('/api/video-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: ROOM_TOKEN, hostPeerId: peerId, hostName: name })
    });
    return response.json();
  }

  // Join waiting room as guest
  async function joinWaiting(peerId, name) {
    const response = await fetch('/api/video-room', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: ROOM_TOKEN, action: 'join-waiting', peerId, name })
    });
    return response.json();
  }

  // Poll room state
  async function pollRoomState() {
    try {
      const response = await fetch(`/api/video-room?token=${ROOM_TOKEN}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.room;
    } catch (err) {
      return null;
    }
  }

  // Join button click
  joinBtn.addEventListener('click', async () => {
    myName = nameInput.value.trim();
    if (!myName || !localStream) return;

    joinBtn.disabled = true;
    joinBtn.textContent = 'Connecting...';

    await loadPeerJS();

    // Create peer
    const peerId = `video-${ROOM_TOKEN.slice(0, 6)}-${Math.random().toString(36).slice(2, 8)}`;
    peer = new Peer(peerId, { config: { iceServers: ICE_SERVERS } });

    peer.on('open', async () => {
      const { exists, room } = await checkRoom();

      if (!exists) {
        // First person - become host
        isHost = true;
        await createRoom(peer.id, myName);
        enterRoom();
      } else {
        // Room exists - join waiting room
        isHost = false;
        await joinWaiting(peer.id, myName);
        showWaitingScreen();
        startWaitingPoll();
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      alert('Connection error: ' + err.message);
    });

    peer.on('call', handleIncomingCall);
    peer.on('connection', handleDataConnection);
  });
```

**Step 2: Commit join logic**

```bash
git add src/pages/vada/v/\[token\].astro
git commit -m "feat: add video room join logic"
```

---

## Task 7: Video Room JavaScript - Waiting Room & Admission

**Files:**
- Modify: `src/pages/vada/v/[token].astro`

**Step 1: Add waiting room functions**

Add to the script:

```javascript
  // Show waiting screen for guests
  function showWaitingScreen() {
    prejoinScreen.style.display = 'none';
    waitingScreen.style.display = 'flex';
    waitingName.textContent = myName;
    waitingPreview.srcObject = localStream;
  }

  // Start polling for admission
  function startWaitingPoll() {
    pollInterval = setInterval(async () => {
      const room = await pollRoomState();
      if (!room) return;

      // Check if we've been admitted
      const admitted = room.admitted.find(p => p.peerId === peer.id);
      if (admitted) {
        clearInterval(pollInterval);
        enterRoom();
        connectToHost(room.hostPeerId);
        return;
      }

      // Check if we've been rejected (not in waiting anymore and not admitted)
      const inWaiting = room.waiting.find(p => p.peerId === peer.id);
      if (!inWaiting && !admitted) {
        clearInterval(pollInterval);
        showRejected();
      }
    }, 2000);
  }

  // Show rejected screen
  function showRejected() {
    waitingScreen.style.display = 'none';
    rejectedScreen.style.display = 'flex';
    cleanup();
  }

  // Host: update waiting room panel
  async function updateWaitingRoomPanel() {
    if (!isHost) return;

    const room = await pollRoomState();
    if (!room) return;

    if (room.waiting.length === 0) {
      waitingList.innerHTML = '<p class="empty-waiting">No one waiting</p>';
    } else {
      waitingList.innerHTML = room.waiting.map(p => `
        <div class="waiting-item" data-peer-id="${p.peerId}">
          <span class="waiting-item-name">${escapeHtml(p.name)}</span>
          <div class="waiting-item-actions">
            <button class="admit-btn" onclick="admitPeer('${p.peerId}')">✓ Admit</button>
            <button class="reject-btn" onclick="rejectPeer('${p.peerId}')">✗</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Host: admit a peer
  window.admitPeer = async function(peerId) {
    await fetch('/api/video-room', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: ROOM_TOKEN, action: 'admit', peerId })
    });
    updateWaitingRoomPanel();
  };

  // Host: reject a peer
  window.rejectPeer = async function(peerId) {
    await fetch('/api/video-room', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: ROOM_TOKEN, action: 'reject', peerId })
    });
    updateWaitingRoomPanel();
  };

  // Utility: escape HTML
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
```

**Step 2: Commit waiting room**

```bash
git add src/pages/vada/v/\[token\].astro
git commit -m "feat: add waiting room admission logic"
```

---

## Task 8: Video Room JavaScript - WebRTC Connections

**Files:**
- Modify: `src/pages/vada/v/[token].astro`

**Step 1: Add WebRTC connection handlers**

Add to the script:

```javascript
  // Enter the main room
  function enterRoom() {
    prejoinScreen.style.display = 'none';
    waitingScreen.style.display = 'none';
    roomScreen.style.display = 'flex';

    // Add self to grid
    addVideoTile('self', localStream, myName, true);

    // Host: show waiting room panel and start polling
    if (isHost) {
      waitingRoomPanel.style.display = 'block';
      setInterval(updateWaitingRoomPanel, 3000);
      updateWaitingRoomPanel();
    }
  }

  // Connect to host (for admitted guests)
  function connectToHost(hostPeerId) {
    if (connections.has(hostPeerId)) return;

    // Data connection
    const conn = peer.connect(hostPeerId, { metadata: { name: myName } });
    handleDataConnection(conn);

    // Media call
    const call = peer.call(hostPeerId, localStream, { metadata: { name: myName } });
    handleOutgoingCall(call);
  }

  // Handle incoming call
  function handleIncomingCall(call) {
    const callerName = call.metadata?.name || 'Unknown';
    call.answer(localStream);

    call.on('stream', (remoteStream) => {
      const peerId = call.peer;
      if (!connections.has(peerId)) {
        connections.set(peerId, { call, stream: remoteStream, name: callerName });
        addVideoTile(peerId, remoteStream, callerName, false);
        updateChatRecipients();
      }
    });

    call.on('close', () => removePeer(call.peer));
    call.on('error', (err) => {
      console.error('Call error:', err);
      removePeer(call.peer);
    });

    // Monitor ICE state
    monitorIceState(call, call.peer);
  }

  // Handle outgoing call
  function handleOutgoingCall(call) {
    const calleeName = call.metadata?.name || 'Unknown';

    call.on('stream', (remoteStream) => {
      const peerId = call.peer;
      if (!connections.has(peerId)) {
        connections.set(peerId, { call, stream: remoteStream, name: calleeName });
        addVideoTile(peerId, remoteStream, calleeName, false);
        updateChatRecipients();
      }
    });

    call.on('close', () => removePeer(call.peer));
    call.on('error', (err) => {
      console.error('Call error:', err);
      removePeer(call.peer);
    });

    monitorIceState(call, call.peer);
  }

  // Handle data connection (for chat)
  function handleDataConnection(conn) {
    conn.on('open', () => {
      const peerId = conn.peer;
      const existing = connections.get(peerId) || {};
      connections.set(peerId, { ...existing, conn, name: conn.metadata?.name || existing.name });

      // If host, connect back with media
      if (isHost && !existing.call) {
        const call = peer.call(peerId, localStream, { metadata: { name: myName } });
        handleOutgoingCall(call);
      }
    });

    conn.on('data', (data) => {
      if (data.type === 'chat') {
        displayChatMessage(data.sender, data.message, data.isPrivate);
      }
    });

    conn.on('close', () => removePeer(conn.peer));
  }

  // Monitor ICE connection state
  function monitorIceState(call, peerId) {
    const pc = call.peerConnection;
    if (!pc) return;

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log(`ICE state for ${peerId}: ${state}`);
      updateTileStatus(peerId, state);
    };
  }

  // Remove peer
  function removePeer(peerId) {
    const conn = connections.get(peerId);
    if (conn) {
      conn.call?.close();
      conn.conn?.close();
      connections.delete(peerId);
    }
    removeVideoTile(peerId);
    updateChatRecipients();
  }
```

**Step 2: Commit WebRTC**

```bash
git add src/pages/vada/v/\[token\].astro
git commit -m "feat: add WebRTC connection handling"
```

---

## Task 9: Video Room JavaScript - Video Grid

**Files:**
- Modify: `src/pages/vada/v/[token].astro`

**Step 1: Add video grid functions**

Add to the script:

```javascript
  // Add video tile to grid
  function addVideoTile(peerId, stream, name, isSelf) {
    if (document.getElementById(`tile-${peerId}`)) return;

    const tile = document.createElement('div');
    tile.className = 'video-tile';
    tile.id = `tile-${peerId}`;
    if (isSelf) tile.classList.add('self');

    tile.innerHTML = `
      <video autoplay playsinline ${isSelf ? 'muted' : ''}></video>
      <div class="avatar-placeholder">${name.charAt(0).toUpperCase()}</div>
      <span class="tile-name">${escapeHtml(name)}${isSelf ? ' (You)' : ''}</span>
      <span class="tile-status"></span>
    `;

    const video = tile.querySelector('video');
    video.srcObject = stream;

    // Handle autoplay blocking
    if (!isSelf) {
      video.play().catch(err => {
        console.warn('Autoplay blocked:', err);
        showAudioUnlockPrompt();
      });
    }

    videoGrid.appendChild(tile);
    updateGridLayout();
  }

  // Remove video tile
  function removeVideoTile(peerId) {
    const tile = document.getElementById(`tile-${peerId}`);
    if (tile) {
      tile.remove();
      updateGridLayout();
    }
  }

  // Update tile status
  function updateTileStatus(peerId, state) {
    const tile = document.getElementById(`tile-${peerId}`);
    if (!tile) return;

    const statusEl = tile.querySelector('.tile-status');
    const stateIcons = {
      'checking': '🔄',
      'connected': '✅',
      'completed': '✅',
      'disconnected': '⚠️',
      'failed': '❌',
      'closed': '❌'
    };
    statusEl.textContent = stateIcons[state] || '';
  }

  // Update grid layout based on participant count
  function updateGridLayout() {
    const count = videoGrid.children.length;
    videoGrid.className = 'video-grid';
    if (count >= 2) videoGrid.classList.add(`grid-${Math.min(count, 6)}`);
  }

  // Audio unlock prompt
  let audioUnlockShown = false;
  function showAudioUnlockPrompt() {
    if (audioUnlockShown) return;
    audioUnlockShown = true;

    const prompt = document.createElement('div');
    prompt.className = 'audio-unlock-prompt';
    prompt.innerHTML = `<button class="audio-unlock-btn">🔊 Tap to enable audio</button>`;
    prompt.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:1000;';

    document.body.appendChild(prompt);

    prompt.querySelector('button').addEventListener('click', () => {
      document.querySelectorAll('video').forEach(v => v.play().catch(() => {}));
      prompt.remove();
    });
  }
```

**Step 2: Commit video grid**

```bash
git add src/pages/vada/v/\[token\].astro
git commit -m "feat: add video grid management"
```

---

## Task 10: Video Room JavaScript - Controls

**Files:**
- Modify: `src/pages/vada/v/[token].astro`

**Step 1: Add control button handlers**

Add to the script:

```javascript
  // Mute button
  document.getElementById('mute-btn').addEventListener('click', function() {
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
    this.classList.toggle('active', isMuted);
    this.querySelector('.btn-icon').textContent = isMuted ? '🔇' : '🎤';

    const selfTile = document.getElementById('tile-self');
    if (selfTile) selfTile.classList.toggle('muted', isMuted);
  });

  // Camera button
  document.getElementById('camera-btn').addEventListener('click', function() {
    isCameraOff = !isCameraOff;
    localStream.getVideoTracks().forEach(track => track.enabled = !isCameraOff);
    this.classList.toggle('active', isCameraOff);
    this.querySelector('.btn-icon').textContent = isCameraOff ? '📷' : '📷';

    const selfTile = document.getElementById('tile-self');
    if (selfTile) selfTile.classList.toggle('camera-off', isCameraOff);
  });

  // Screen share button
  document.getElementById('share-btn').addEventListener('click', async function() {
    if (!isScreenSharing) {
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

        // Replace video track in all connections
        const videoTrack = screenStream.getVideoTracks()[0];
        connections.forEach(({ call }) => {
          const sender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });

        // Update self tile
        const selfTile = document.getElementById('tile-self');
        if (selfTile) {
          selfTile.querySelector('video').srcObject = screenStream;
          selfTile.classList.add('screen-share');
        }

        isScreenSharing = true;
        this.classList.add('active');

        // Handle screen share end
        videoTrack.onended = () => stopScreenShare();

      } catch (err) {
        console.error('Screen share error:', err);
      }
    } else {
      stopScreenShare();
    }
  });

  function stopScreenShare() {
    if (!isScreenSharing) return;

    // Restore camera track
    const videoTrack = localStream.getVideoTracks()[0];
    connections.forEach(({ call }) => {
      const sender = call.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
    });

    // Update self tile
    const selfTile = document.getElementById('tile-self');
    if (selfTile) {
      selfTile.querySelector('video').srcObject = localStream;
      selfTile.classList.remove('screen-share');
    }

    screenStream?.getTracks().forEach(t => t.stop());
    screenStream = null;
    isScreenSharing = false;
    document.getElementById('share-btn').classList.remove('active');
  }

  // Record button
  document.getElementById('record-btn').addEventListener('click', function() {
    if (!isRecording) {
      startRecording();
      this.classList.add('recording');
      this.querySelector('.btn-label').textContent = 'Stop';
    } else {
      stopRecording();
      this.classList.remove('recording');
      this.querySelector('.btn-label').textContent = 'Record';
    }
  });

  function startRecording() {
    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();

    // Mix local audio
    const localSource = audioContext.createMediaStreamSource(localStream);
    localSource.connect(dest);

    // Mix remote audio
    connections.forEach(({ stream }) => {
      if (stream) {
        const remoteSource = audioContext.createMediaStreamSource(stream);
        remoteSource.connect(dest);
      }
    });

    mediaRecorder = new MediaRecorder(dest.stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = uploadRecording;

    mediaRecorder.start();
    isRecording = true;
  }

  function stopRecording() {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop();
    }
    isRecording = false;
  }

  async function uploadRecording() {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, `video-vada-${ROOM_TOKEN}-${Date.now()}.webm`);

    try {
      await fetch('/api/voice-message', { method: 'POST', body: formData });
      alert('Recording saved!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to save recording');
    }
  }

  // Copy link button
  document.getElementById('copy-link-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Invite link copied!');
  });

  // Leave button
  document.getElementById('leave-btn').addEventListener('click', () => {
    if (confirm('Leave the room?')) {
      cleanup();
      window.location.href = '/vada';
    }
  });

  // Cleanup
  function cleanup() {
    if (pollInterval) clearInterval(pollInterval);
    localStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    connections.forEach(({ call, conn }) => {
      call?.close();
      conn?.close();
    });
    peer?.destroy();

    // Notify server
    if (peer?.id) {
      fetch('/api/video-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: ROOM_TOKEN, action: 'leave', peerId: peer.id })
      }).catch(() => {});
    }
  }

  window.addEventListener('beforeunload', cleanup);
```

**Step 2: Commit controls**

```bash
git add src/pages/vada/v/\[token\].astro
git commit -m "feat: add video room controls"
```

---

## Task 11: Video Room JavaScript - Chat

**Files:**
- Modify: `src/pages/vada/v/[token].astro`

**Step 1: Add chat functionality**

Add to the script:

```javascript
  // Update chat recipient dropdown
  function updateChatRecipients() {
    const options = ['<option value="everyone">Everyone</option>'];
    connections.forEach((conn, peerId) => {
      if (conn.name) {
        options.push(`<option value="${peerId}">${escapeHtml(conn.name)}</option>`);
      }
    });
    chatRecipient.innerHTML = options.join('');
  }

  // Send chat message
  document.getElementById('chat-send').addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    const recipient = chatRecipient.value;
    const isPrivate = recipient !== 'everyone';

    // Display locally
    displayChatMessage(myName + ' (You)', message, isPrivate);

    // Send to recipients
    const data = { type: 'chat', sender: myName, message, isPrivate };

    if (isPrivate) {
      // Send only to selected recipient
      const conn = connections.get(recipient)?.conn;
      if (conn?.open) conn.send(data);
    } else {
      // Send to all
      connections.forEach(({ conn }) => {
        if (conn?.open) conn.send(data);
      });
    }

    chatInput.value = '';
  }

  // Display chat message
  function displayChatMessage(sender, message, isPrivate) {
    const div = document.createElement('div');
    div.className = 'chat-message' + (isPrivate ? ' private' : '');
    div.innerHTML = `<div class="sender">${escapeHtml(sender)}</div><div>${escapeHtml(message)}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Toggle chat panel
  document.getElementById('chat-toggle').addEventListener('click', function() {
    const panel = document.getElementById('chat-panel');
    panel.classList.toggle('collapsed');
    this.textContent = panel.classList.contains('collapsed') ? '+' : '−';
  });
```

**Step 2: Close the script tag**

```javascript
</script>
```

**Step 3: Commit chat**

```bash
git add src/pages/vada/v/\[token\].astro
git commit -m "feat: add video room chat functionality"
```

---

## Task 12: Final Testing & Polish

**Step 1: Test locally**

```bash
npm run dev
```

Open http://localhost:4321/vada

**Step 2: Test flow**
1. Click "Start Private Video Vāda"
2. Enter name, verify camera preview
3. Join as host
4. Copy link, open in incognito
5. Enter name in incognito
6. Verify waiting room appears
7. Admit from host
8. Verify video grid works
9. Test chat (public + private)
10. Test screen share
11. Test recording

**Step 3: Deploy**

```bash
git push
```

**Step 4: Test on production**

Test same flow on deployed site with real devices.

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Video room API (create, get, update room state) |
| 2 | Update landing page with video button |
| 3 | Video room page structure |
| 4 | Video room CSS |
| 5 | JS initialization & pre-join |
| 6 | JS room join logic |
| 7 | JS waiting room & admission |
| 8 | JS WebRTC connections |
| 9 | JS video grid |
| 10 | JS controls (mute, camera, share, record) |
| 11 | JS chat |
| 12 | Testing & deploy |

Total: ~12 commits, each building on the last.
