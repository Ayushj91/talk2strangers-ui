# talk2strangers — frontend (MVP preview)

Anonymous chat rooms + 1-on-1 random stranger matching. Frontend only — every realtime
behaviour (stranger replies, room chatter, matching, media acceptance) is simulated with
mock data and timers so you can demo the full product before wiring the backend.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · lucide-react**

## What's implemented (mapped to the PRD)

| PRD feature | Where |
|---|---|
| Landing page + live ticker + invisible algorithm explainer | `app/page.tsx` |
| Topic + mood rooms, live counts, quiet-room indicator | `app/rooms/page.tsx` |
| Group chat: handles, join/leave, member chatter, reactions, report, media | `app/rooms/[roomId]/page.tsx` |
| 1-on-1: mood tag → matching screen (waiting ticker) → chat | `app/chat/page.tsx` |
| Typing indicators, delivery ticks (✓ / ✓✓) | `components/ChatKit.tsx` |
| Graceful Next (pre-queued, <2s overlay) | `app/chat/page.tsx` → `next()` |
| One-tap report + instant disconnect | `report()` |
| Stranger-left notice + "Find someone new" | `stage === "left"` |
| Nudge question after silence (22s in demo; PRD says 90s) | `resetSilence()` |
| Emoji reactions (6 emojis) on any bubble | `EmojiBar` |
| **First-time media consent** — your first photo is hidden until they accept; their first photo arrives blurred with Reveal/Decline | `MediaBlock` + `mediaTrustIn/Out` refs |
| Link blocking before delivery | `send()` regex check |
| /game: Would You Rather, Truth or Dare, 20 Questions | `GameCard` |
| Connection card mutual exchange at chat end | `stage === "card"` |
| Persisted connections + premium "persistent thread" upsell | `app/connections/page.tsx` (localStorage) |
| Per-session anonymous handles (`wandering_fox_91`) | `lib/data.ts` → `makeHandle()` |

## Wiring the backend later

All mock behaviour is isolated:

- **`lib/data.ts`** — replace canned content with API responses.
- **Bot brain** (`botSay`, `botRespondTo` in `app/chat/page.tsx`) — replace with Socket.IO
  events: `message`, `typing`, `partner_left`, `match_found`, `media_request`, `media_accept`.
- **Room simulation** (the `loop()` effect in `app/rooms/[roomId]/page.tsx`) — replace with a
  Socket.IO namespace subscription per room.
- **Matching screen** — replace the fixed 2.6s timer with your Redis queue's `match_found` event.
- **Connection cards** — swap localStorage for your Supabase `ConnectionCard` table.
- Message shape lives in one place: `Msg` in `components/ChatKit.tsx`.

## Design system

- You are **violet** (`#8B7CFF`), the stranger is **coral** (`#FF7A66`) — the two hues only
  blend where two people connect (logo "2", CTAs, the connection card thread).
- Fonts: Bricolage Grotesque (display) · Manrope (body) · JetBrains Mono (handles/meta).
- Tokens in `tailwind.config.ts`; surfaces (`.glass`, `.glass-strong`, `.thread`) in `app/globals.css`.
- Respects `prefers-reduced-motion`.
# talk2strangers-ui
