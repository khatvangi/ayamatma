# Video Vāda Design

**Date:** 2026-01-14
**Status:** Approved

## Overview

Private, invitation-only video rooms for philosophical debate (vāda). Host controls access via waiting room.

## Requirements

- Secret link access (16-char token)
- Waiting room with host admit/reject
- Video grid layout (up to 6 participants)
- Camera on by default, toggleable
- Screen sharing
- Chat (public + private messages)
- Recording to R2
- Reliable connections (TURN servers, ICE indicators)

## User Flow

1. Host clicks "Start Private Video Vāda" → gets `/vada/v/[TOKEN]`
2. Host shares link with invitees
3. Guest opens link → enters name → waits in lobby with camera preview
4. Host sees "Ravi is waiting" → clicks Admit
5. Ravi joins video grid
6. Participants can chat, share screen, record
7. Room state cleaned up when all leave

## URL Structure

```
/vada                    → landing page (add new button)
/vada/room/[CODE]        → existing public audio rooms (unchanged)
/vada/v/[TOKEN]          → NEW private video rooms
```

## Room State (R2)

```json
{
  "hostPeerId": "abc123",
  "hostName": "Kiran",
  "created": "2026-01-14T...",
  "waiting": [
    { "peerId": "def456", "name": "Ravi" }
  ],
  "admitted": [
    { "peerId": "jkl012", "name": "Priya" }
  ]
}
```

Stored at: `video-rooms/[TOKEN].json`

## API Endpoints

### POST /api/video-room
Create room, set host.

**Request:**
```json
{ "token": "a7x3k9m2p4q8r1s5", "hostPeerId": "abc123", "hostName": "Kiran" }
```

### GET /api/video-room?token=...
Get room state (waiting list, admitted list).

### PUT /api/video-room
Admit/reject/update state.

**Request:**
```json
{ "token": "...", "action": "admit", "peerId": "def456" }
```

## UI Layout

```
┌─────────────────────────────────────────────┐
│  Vāda Room          [🔗 Copy Link]  [Leave] │
├─────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │  Video  │  │  Video  │  │  Video  │      │
│  │  Name ✅│  │  Name ✅│  │  Name 🔄│      │
│  └─────────┘  └─────────┘  └─────────┘      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │  Video  │  │  Video  │  │  (empty)│      │
│  │  You 🎤 │  │  Name ✅│  │         │      │
│  └─────────┘  └─────────┘  └─────────┘      │
├─────────────────────────────────────────────┤
│  [🎤 Mute] [📷 Camera] [🖥️ Share] [⏺ Record]│
├─────────────────────────────────────────────┤
│  Waiting Room (host only):                  │
│  │ Ravi is waiting    [✓ Admit] [✗]     │   │
└─────────────────────────────────────────────┘
```

**Chat panel (collapsible):**
- Dropdown: Everyone / specific person (private)
- PeerJS data channel (no server storage)
- Ephemeral messages

## Grid Responsiveness

- 1 person: full width
- 2 people: side by side
- 3-4 people: 2x2
- 5-6 people: 3x2

## Connection Reliability

1. **TURN servers** — openrelay.metered.ca (same as audio rooms)
2. **Autoplay handling** — explicit .play() + "Tap to enable" prompt
3. **ICE state indicators** — visible per-participant status
4. **Pre-join device check** — camera preview + mic level before joining
5. **Graceful degradation** — avatar fallback if video fails

## File Structure

```
src/pages/
├── vada.astro                    # UPDATE: add video button
└── vada/
    ├── room/[code].astro         # KEEP: audio rooms
    └── v/[token].astro           # NEW: video room

src/pages/api/
├── voice-message.ts              # KEEP
├── room-peers.ts                 # KEEP
└── video-room.ts                 # NEW: waiting room state
```

## Controls

- 🎤 Mute/Unmute mic
- 📷 Camera on/off
- 🖥️ Screen share (replaces your tile)
- ⏺ Record (saves to R2)
- 💬 Chat toggle

## Security

- Token is 16 chars, URL-safe random string
- Only host can admit/reject
- No room discovery — must have exact link
- Room state auto-expires (cleanup after 24h of inactivity)
