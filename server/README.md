# Writers' Pub Backend

Production-ready Express + PostgreSQL backend for the Writers' Pub frontend.

## Tech Stack
- Node.js + TypeScript
- Express 5
- PostgreSQL (JSONB + optional pgvector)
- Redis (rate limits + cache/queue support)
- Socket.IO (real-time notifications)
- JWT auth with refresh token rotation

## Folder Structure
```txt
server/
  src/
    config/          # env, db pool, redis
    controllers/     # HTTP controllers
    db/
      migrations/    # SQL schema and evolutions
      seed.ts        # realistic demo data
      migrate.ts
    middleware/      # auth, RBAC, validation, errors, rate limits
    routes/          # API route modules
    services/        # business logic
    socket/          # websocket server + events
    types/           # shared TS contracts
    index.ts         # app bootstrap
```

## Database Schema
Defined in:
- `src/db/migrations/001_initial_schema.sql`
- `src/db/migrations/002_add_plagiarism_fields.sql`

Core tables:
- `users`
- `drafts`
- `draft_versions`
- `feedback`
- `inline_comments`
- `opportunities`
- `submissions`
- `notifications`
- `achievements`
- `user_achievements`
- `writing_sessions`
- `ai_embeddings`

Key relationships:
- `drafts.author_id -> users.id`
- `feedback.draft_id -> drafts.id`, `feedback.reviewer_id -> users.id`
- `submissions.draft_id -> drafts.id`, `submissions.opportunity_id -> opportunities.id`, `submissions.submitter_id -> users.id`
- `notifications.user_id -> users.id`

Indexing highlights:
- User auth/ranking: `users(email)`, `users(role)`, `users(trust_score desc)`
- Draft discovery: `drafts(author_id)`, `drafts(status)`, `drafts(visibility)`, `drafts(genre)`, `drafts(created_at desc)`
- Submission pipeline: `submissions(submitter_id)`, `submissions(opportunity_id)`, `submissions(status)`
- Notifications inbox: `notifications(user_id, is_read, created_at desc)`

## API Endpoints
All routes are under `/api`.

### Auth
- `POST /auth/register` (alias: `POST /auth/signup`)
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Users / Profile
- `GET /users/leaderboard`
- `GET /users/me/stats`
- `GET /users/me/profile`
- `GET /users/me/history`
- `GET /users/me/reviews`
- `PATCH /users/me`
- `GET /users/:id/profile`

### Drafts
- `GET /drafts`
- `POST /drafts`
- `GET /drafts/stats`
- `GET /drafts/:id`
- `PUT /drafts/:id`
- `DELETE /drafts/:id`
- `POST /drafts/:id/share`
- `POST /drafts/:id/critique`
- `GET /drafts/:id/critique`
- `GET /drafts/:id/history`

### Feedback
- `POST /feedback`
- `GET /feedback/draft/:draftId`
- `GET /feedback/user/:userId`
- `PATCH /feedback/:id/rate`
- `POST /feedback/inline`
- `GET /feedback/inline/:draftId`

### Discovery
- `GET /explore`
- `GET /explore/trending`
- `GET /discover` (alias of `/explore`)

### Opportunities
- `GET /opportunities`
- `GET /opportunities/featured`
- `GET /opportunities/stats`
- `GET /opportunities/matches/:draftId`
- `GET /opportunities/:id`
- `POST /opportunities`

### Submissions
- `POST /submissions`
- `GET /submissions`
- `GET /submissions/me`
- `GET /submissions/counts`
- `GET /submissions/editor/queue`
- `GET /submissions/editor/dashboard`
- `PATCH /submissions/:id/status`
- `PATCH /submissions/:id/feedback`

### Notifications & Achievements
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `GET /achievements`

### Analytics
- `GET /analytics/writing`
- `POST /analytics/session`
- `PATCH /analytics/session/:id`

## Frontend Compatibility Notes
- `GET /submissions/me` is supported for submissions page.
- `GET /opportunities` returns `data: { opportunities: [...] }` for marketplace page.
- `GET /drafts` keeps array-style `data` for studio; with `?limit=...` and no filters it also supports wrapped format used by submit flow.
- Error responses include both `error` and `message`.

## Real-Time Events
Socket path: `/ws`

Emitted events:
- `feedback:received` and `user.feedback_received`
- `submission:update` and `user.submission_update`
- `ai:ready` and `user.ai_ready`

## Setup
1. Install dependencies:
```bash
cd server
npm install
```
2. Configure `.env` (or use defaults for local dev):
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/writers_pub
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=
```
3. Run migrations and seed:
```bash
npm run migrate
npm run seed
```
4. Start API:
```bash
npm run dev
```

## Example Requests / Responses

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "writer@example.com",
  "password": "StrongPass123",
  "displayName": "A. Writer",
  "name": "A. Writer",
  "role": "writer"
}
```
```json
{
  "success": true,
  "user": { "id": "...", "email": "writer@example.com", "display_name": "A. Writer", "role": "writer" },
  "token": "...",
  "data": {
    "user": { "id": "...", "email": "writer@example.com", "display_name": "A. Writer", "role": "writer" },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

### Create Draft
```http
POST /api/drafts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "The Obsidian Inkwell",
  "genre": "Fantasy",
  "content": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Opening line..." }] }] }
}
```

### Submit Feedback
```http
POST /api/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "draft_id": "uuid",
  "scores": { "plot": 8, "characters": 9, "writing_style": 8.5 },
  "written_feedback": "Strong atmosphere and voice."
}
```

### Submit to Opportunity
```http
POST /api/submissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "draft_id": "uuid",
  "opportunity_id": "uuid"
}
```

### Update Submission Status (Editor)
```http
PATCH /api/submissions/:id/status
Authorization: Bearer <editor-token>
Content-Type: application/json

{ "status": "shortlisted" }
```

## Validation & Security
- Zod-based request validation
- JWT authentication middleware
- Role-based access control (`writer`, `editor`, `reader`, `admin`)
- Password hashing via bcrypt (`saltRounds=12`)
- Rate limiting with Redis fallback-safe behavior

## Build Verification
```bash
npm run build
```
This currently passes.
