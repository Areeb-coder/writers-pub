# Frontend -> Backend Mapping (Writers' Pub)

This maps current frontend pages in `web/src/app` to backend contracts implemented in `server`.

## 1) Studio (`/studio`)
Frontend actions:
- Load drafts list
- Search drafts
- Load writing stats
- Open draft details

API support:
- `GET /api/drafts?search=...`
- `GET /api/drafts/stats`
- `GET /api/drafts/:id`
- `POST /api/drafts`, `PUT /api/drafts/:id`, `DELETE /api/drafts/:id`
- `POST /api/drafts/:id/share`
- `GET /api/drafts/:id/history`

## 2) Studio Editor (`/studio/[id]`)
Frontend actions:
- Open one draft
- Trigger AI re-analysis
- Auto-save draft updates

API support:
- `GET /api/drafts/:id`
- `PUT /api/drafts/:id` (auto-save compatible)
- `POST /api/drafts/:id/critique`
- `GET /api/drafts/:id/critique`

## 3) Agora (`/agora`)
Frontend actions:
- Fetch discovery feed
- Filter by genre
- Sort (`recent`, `most_discussed`, `highest_rated`, `ai_picks`)
- Load trending topics
- Load reviewer leaderboard

API support:
- `GET /api/explore?sort=...&genre=...&search=...`
- `GET /api/explore/trending`
- `GET /api/users/leaderboard`

## 4) Marketplace (`/marketplace`)
Frontend actions:
- Fetch opportunities list
- Filter by genre and paid-only
- Search opportunities
- Fetch featured opportunity
- Fetch marketplace stats

API support:
- `GET /api/opportunities?search=...&genre=...&isPaid=true|false`
- `GET /api/opportunities/featured`
- `GET /api/opportunities/stats`

## 5) Submit to Opportunity (`/marketplace/submit/[id]`)
Frontend actions:
- Load one opportunity
- Load user's drafts
- Submit draft to opportunity
- Handle over-word-limit drafts

API support:
- `GET /api/opportunities/:id`
- `GET /api/drafts?limit=50` (wrapped response support)
- `POST /api/submissions`
  - Ownership, duplicate, deadline, active-status, and word-limit checks

## 6) Submissions (`/submissions`)
Frontend actions:
- Load personal submission timeline
- Load status counters

API support:
- `GET /api/submissions/me`
- `GET /api/submissions/counts`
- `PATCH /api/submissions/:id/status` (editor actions)
- `PATCH /api/submissions/:id/feedback` (editor feedback)

## 7) Profile (`/profile`)
Frontend currently uses static placeholders, but backend support is fully implemented for dynamic wiring:
- `GET /api/users/me/profile`
- `GET /api/users/me/stats`
- `GET /api/users/me/history`
- `GET /api/users/me/reviews`
- `PATCH /api/users/me`

## 8) Notifications + Realtime
System events supported:
- Feedback received
- Submission status changed
- AI critique ready

API/WebSocket support:
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- Socket events:
  - `feedback:received` + `user.feedback_received`
  - `submission:update` + `user.submission_update`
  - `ai:ready` + `user.ai_ready`

## 9) Editor Dashboard (API-ready)
Backend supports editor review workflows:
- `GET /api/submissions/editor/queue`
- `GET /api/submissions/editor/dashboard`
- `PATCH /api/submissions/:id/status`
- `PATCH /api/submissions/:id/feedback`

## 10) Extra Discovery Alias
- `GET /api/discover` mirrors `/api/explore` for compatibility.
