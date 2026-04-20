# Writers Pub

**A premium writing ecosystem with AI-driven critique and structured community feedback.**

<!-- Badges: CI status, version, stars, issues, etc. -->
<!-- [![Build Status](https://github.com/TODO_USER/writers-pub/actions/workflows/ci.yml/badge.svg)](https://github.com/TODO_USER/writers-pub/actions) -->
<!-- [![Version](https://img.shields.io/github/v/release/TODO_USER/writers-pub)](https://github.com/TODO_USER/writers-pub/releases) -->
<!-- [![Last Commit](https://img.shields.io/github/last-commit/TODO_USER/writers-pub)](https://github.com/TODO_USER/writers-pub/graphs/commit-activity) -->

## Overview / Description

**Writers Pub** is a state-of-the-art platform designed to bridge the gap between creative writing and professional publishing. It provides writers with a sophisticated "Studio" for drafting, a community-driven "Agora" for feedback, and an AI-powered "Marketplace" to find the perfect home for their work. By combining human intuition with advanced Large Language Models, Writers Pub ensures every story reaches its full potential.

The project addresses the fundamental isolation of the writing process and the often opaque nature of literary submissions. It provides tools for deep structural analysis, real-time collaboration, and data-driven matchmaking between authors and publishers. Whether you are a novelist refining a first draft or an editor looking for the next breakout star, Writers Pub provides the infrastructure to succeed.

Target users include aspiring and professional writers, literary editors, and magazine publishers. The platform's unique value lies in its **Intelligence Layer**, which provides instant, actionable critique and calculates high-precision match scores for submission opportunities based on genre, tone, and pacing.

Key features include the [AI Critique Engine](#features), [pgvector-powered Matchmaking](#features), and a [Real-time Feedback System](#features).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture / Project Structure](#architecture--project-structure)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Project](#running-the-project)
    - [Build / Production](#build--production)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Usage & Examples](#usage--examples)
- [Screenshots / Demo](#screenshots--demo)
- [API Documentation](#api-documentation)
- [State Management / Data Flow](#state-management--data-flow)
- [Testing](#testing)
- [Roadmap / Future Work](#roadmap--future-work)
- [Known Issues & Limitations](#known-issues--limitations)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Performance & Security Notes](#performance--security-notes)
- [Project Status](#project-status)
- [Contact / Support](#contact--support)

---

## Features

### ✍️ The Scribe Studio
- **Rich Text Editor**: Powered by TipTap/ProseMirror with full support for JSONB content snapshots.
- **Auto-save & Versioning**: High-performance upsert logic with a `draft_versions` table for revision history and diffing.
- **Analytics**: Track writing sessions, word counts, and daily streaks to maintain productivity.

### 🧠 Intelligence Layer (AI)
- **AI Critique Engine**: Integrated with **Gemini 2.5 Pro** to provide scores for Plot, Pacing, and Characterization alongside actionable suggestions.
- **Smart Matchmaking**: Uses **pgvector** and `text-embedding-004` to calculate similarity scores between drafts and publisher opportunities.
- **Content Integrity**: Automated moderation via the Gemini Safety API and plagiarism detection via Copyleaks.

### 🤝 The Agora (Feedback Ecosystem)
- **Inline Annotations**: Threaded comments anchored to specific character offsets in the text.
- **Structured Reviews**: Quantitative scoring across multiple literary dimensions.
- **Discovery Feed**: An AI-sorted feed of public drafts based on user preferences and similarity search.

### 🚀 Submission Pipeline
- **Marketplace**: Browse magazine listings and contests with calculated "Match Scores".
- **Tracking**: A full status-tracking pipeline from `submitted` to `accepted`.
- **Editor Dashboard**: A dedicated interface for publishers to triage submissions sorted by AI-predicted fit.

---

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations)
- **Components**: Lucide React, Custom UI Components
- **Editor**: TipTap / ProseMirror

### Backend
- **Framework**: [Express 5.x](https://expressjs.com/)
- **Runtime**: Node.js 22.x
- **Language**: TypeScript
- **Database**: PostgreSQL 16 (with `pgvector` extension)
- **Caching/Real-time**: Redis 7, Socket.IO
- **Validation**: Zod

### AI & Infrastructure
- **LLM**: Google Gemini 2.5 Pro
- **Embeddings**: text-embedding-004
- **Auth**: JWT (with refresh token rotation), OAuth 2.0 (Google/GitHub)

---

## Architecture / Project Structure

The project is structured as a full-stack monorepo with dedicated directories for the frontend (`web`) and backend (`server`).

```txt
writers-pub/
├── server/                 # Express API Server
│   ├── src/
│   │   ├── config/         # Database, Redis, and Environment config
│   │   ├── controllers/    # Request handlers
│   │   ├── db/             # Migrations, seed data, and schema
│   │   ├── middleware/     # Auth, RBAC, and validation
│   │   ├── routes/         # API Route definitions
│   │   ├── services/       # Core business logic (AI, TrustScore, etc.)
│   │   ├── socket/         # WebSocket event handlers
│   │   └── types/          # TypeScript contracts
│   └── tsconfig.json
├── web/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App Router (Pages & Layouts)
│   │   ├── components/     # Reusable UI components
│   │   └── lib/            # API clients and utilities
│   └── next.config.ts
└── README.md
```

- **Pattern**: The backend follows a **Service-Controller** pattern to decouple business logic (Services) from HTTP concerns (Controllers).
- **Data Flow**: The frontend communicates with the backend via a RESTful API and receives real-time updates via WebSockets for events like feedback received or AI critique readiness.

---

## Getting Started

Follow these steps to run the project locally.

### 8.1. Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **PostgreSQL**: `v16` (Ensure the `pgvector` extension is installed: `CREATE EXTENSION vector;`)
- **Redis**: `v7.0` or higher

### 8.2. Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TODO_USER/writers-pub.git
   cd writers-pub
   ```

2. Install dependencies for both parts:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install web dependencies
   cd ../web
   npm install
   ```

### 8.3. Running the Project

1. **Start the Backend API**:
   ```bash
   cd server
   # Run migrations and seed data
   npm run migrate
   npm run seed
   # Start development server
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd web
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8.4. Build / Production

**Backend**:
```bash
cd server
npm run build
npm start
```

**Frontend**:
```bash
cd web
npm run build
npm start
```
The frontend can be deployed to Vercel, while the backend is optimized for Node.js environments (Docker, Railway, AWS, etc.).

---

## Configuration & Environment Variables

Create a `.env` file in the `server/` and `web/` directories.

### Backend (`server/.env`)
| Variable | Description | Example Value | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | API Port | `5000` | No |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` | **Yes** |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | **Yes** |
| `JWT_SECRET` | Secret for access tokens | `your_secret_string` | **Yes** |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `your_refresh_secret` | **Yes** |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` | **Yes** |
| `FRONTEND_URL` | URL of the frontend | `http://localhost:3000` | No |

### Frontend (`web/.env`)
| Variable | Description | Example Value | Required |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL of the Backend API | `http://localhost:5000/api` | **Yes** |

---

## Usage & Examples

### 🖋️ Writing in the Studio
1. Navigate to the **Studio** tab.
2. Create a new draft. The editor will auto-save your changes.
3. Click "AI Critique" to receive instant feedback on your pacing and plot.

### 🔍 Discovery & Feedback
1. Browse the **Agora** feed to read public drafts.
2. Select text to leave **Inline Comments**.
3. Submit a full review to help fellow writers earn **TrustScore**.

### 💼 Submitting to Opportunities
1. Go to the **Marketplace**.
2. View opportunities sorted by your **Match Score**.
3. Connect your draft and submit to the publication tracking pipeline.

---

## Screenshots / Demo

> [!NOTE]
> The screenshots below are placeholders. Please replace the paths with actual files from your `assets/` or `screenshots/` directory.

### Homepage
![Homepage Screenshot](assets/screenshots/homepage.png)
*The landing page showcasing the platform's vision and primary navigation.*

### The Writing Studio
![Studio Screenshot](assets/screenshots/studio.png)
*The TipTap-powered editor with the AI Critique sidebar active.*

### Marketplace & Matchmaking
![Marketplace Screenshot](assets/screenshots/marketplace.png)
*Browse publishing opportunities with AI-calculated match percentages.*

---

## API Documentation

The API is hosted at `/api`. Detailed endpoints:

| Method | Path | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Log in and receive JWT tokens | No |
| `GET` | `/drafts` | List all drafts for the authenticated user | JWT |
| `POST` | `/drafts/:id/critique` | Trigger a Gemini AI critique job | JWT |
| `GET` | `/explore` | Discovery feed with AI similarity sorting | No |
| `POST` | `/submissions` | Submit a draft to an opportunity | JWT |

### Example Request (Trigger AI Critique)
```bash
curl -X POST http://localhost:5000/api/drafts/DRAFT_ID/critique \
     -H "Authorization: Bearer YOUR_TOKEN"
```

---

## State Management / Data Flow

- **Backend**: Uses a stateless JWT approach. Real-time state (notifications, updates) is managed via **Socket.IO** rooms.
- **Frontend**: Primarily utilizes **Next.js Server Actions** for data mutations and **React Server Components** for fetching. Client-side state for the editor and UI interactions is managed via React `useState` and `useContext` where shared state is required.
- **Persistence**: PostgreSQL acts as the primary source of truth, while **Redis** handles session-specific state and rate limiting metrics.

---

## Testing

Writers Pub emphasizes reliability through automated verification:

- **Unit Testing**: [TODO: Add testing framework like Vitest if applicable].
- **API Testing**: Manual verification scripts and logs found in `server/*.log`.
- **Linting**: 
  ```bash
  cd web && npm run lint
  ```

---

## Roadmap / Future Work

- [x] Core Studio functionality and JSONB persistence.
- [x] AI Critique Engine integration (Gemini).
- [x] pgvector implementation for draft similarity.
- [/] Real-time collaboration (multi-user editing).
- [ ] Mobile application (React Native).
- [ ] Integration with more publishing platforms (Substack, Medium).
- [ ] Global writers' leaderboard and Seasonal Contests.

---

## Known Issues & Limitations

- **AI Latency**: Gemini critique jobs run in background workers and can take 5-10 seconds to process.
- **pgvector Setup**: Local development requires a specific PostgreSQL image or manual extension enabling.
- **Editor Diffs**: Draft versioning is currently snapshot-based; a true operational transformation (OT) for collaborative editing is in progress.

---

## Troubleshooting & FAQ

**Q: I get a "vector" extension error in PostgreSQL.**
- **Cause**: The `pgvector` extension is not enabled.
- **Fix**: Run `CREATE EXTENSION vector;` in your PostgreSQL database.

**Q: The AI Critique always returns an error.**
- **Cause**: Missing or invalid `GEMINI_API_KEY`.
- **Fix**: Ensure your API key is correctly set in `server/.env`.

**Q: Port 5000 is already in use.**
- **Fix**: Change the `PORT` variable in `server/.env` to something else (e.g., `5001`).

---

## Performance & Security Notes

- **Security**: 
    - JWT tokens are rotated periodically to prevent session hijacking.
    - RBAC ensures that only `editors` can access the triage dashboard.
    - Rate limiting is strictly enforced via Redis to prevent AI service abuse.
- **Performance**:
    - JSONB is used for flexible draft schemas without sacrificing search speed (via GIN indexes).
    - Redis pub/sub keeps notification delivery overhead minimal.

---

