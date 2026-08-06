# CityPulse AI — Civic Intelligence Platform

A production-grade, AI-powered civic complaint management platform that autonomously understands, deduplicates, prioritizes, routes, and tracks citizen complaints using Google Gemini multimodal AI.

![CityPulse AI](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Supabase%20%7C%20Gemini-blue?style=for-the-badge)

---

## ✨ Features

- **Multimodal AI Triage** — Gemini 1.5 Flash analyzes text, images, audio, and video to classify civic issues
- **Duplicate Detection** — Spatial (500m radius) + semantic clustering to identify duplicate reports
- **Smart Routing** — Auto-routes complaints to the correct department based on AI classification + configurable rules
- **Officer Review Queue** — Assign, override AI decisions, or merge duplicates with full audit trail
- **Hotspot Intelligence** — Geographic clustering shows recurring problem areas with risk scoring
- **Role-Based Access** — Citizen, Officer, Department Admin, Super Admin with proper RLS enforcement
- **Responsive Design** — Mobile-first dark UI optimized for citizen reporting in the field
- **Full Audit Trail** — Every AI decision and human override is logged

## 🏗 Architecture

```
CityPulse-AI/
├── client/          # React + Vite + Tailwind CSS frontend
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── contexts/    # Auth + Toast contexts
│       ├── layouts/     # App, Auth, Admin layouts
│       ├── pages/       # Public, Citizen, Officer, Admin pages
│       ├── routes/      # React Router config + guards
│       └── services/    # Axios API client
├── server/          # Node.js + Express backend
│   └── src/
│       ├── config/      # Supabase client + env validation
│       ├── controllers/ # Request handlers
│       ├── middleware/  # Auth, error handler, rate limiter, upload
│       ├── routes/      # Express route definitions
│       ├── services/    # Gemini AI, deduplication, routing, audit
│       └── validators/  # Zod validation schemas
├── database/
│   ├── schema.sql   # Full Supabase PostgreSQL schema with RLS
│   └── seed.sql     # Seed departments and routing rules
└── shared/          # Shared types and constants
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) Gemini API key

### 1. Clone & Install

```bash
git clone <repo>
cd CityPulse-AI
npm run install:all
```

### 2. Configure Supabase Database

1. Open your Supabase project → SQL Editor
2. Run `database/schema.sql` to create all tables, indexes, and RLS policies
3. Run `database/seed.sql` to seed departments and routing rules
4. Enable the `pgvector` extension in Settings → Database → Extensions (for semantic search)

### 3. Configure Environment

```bash
# Copy and fill in server/.env
cp .env.example server/.env
```

Fill in these values in `server/.env`:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `JWT_SECRET` | Random 64+ character string |
| `GEMINI_API_KEY` | Google AI Studio API key |

> ⚠️ **Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the frontend.**

### 4. Run Development Servers

```bash
# Run both frontend and backend concurrently
npm run dev

# Or separately:
npm run dev:server  # Express on http://localhost:5000
npm run dev:client  # Vite on http://localhost:5173
```

---

## 🔐 Security

- **JWT Authentication** with bcrypt password hashing (12 salt rounds)
- **Supabase RLS** — citizens only see their own data, officers see all complaints
- **Gemini API key** is server-side only — never bundled into frontend code
- **Multer** validates file MIME types and sizes before accepting uploads
- **Zod** validates all input on every API endpoint
- **Rate limiting** — 20 auth attempts/15min, 10 AI calls/min
- **Audit logs** — every AI decision and human override is recorded

---

## 🤖 AI Pipeline

1. Citizen submits complaint with optional text, images, audio, video
2. Backend uploads files to disk, creates complaint record
3. **`runTriage()`** is called:
   - Fetches nearby complaints for deduplication context
   - Sends complaint + media (base64 inline) to Gemini 1.5 Flash
   - Validates AI JSON response against Zod schema
   - Runs spatial deduplication (500m radius, 72h window)
   - Runs routing rules engine to assign department
4. Complaint is updated with AI result + status
5. If `review_required: true` → routed to officer queue
6. Officer can assign, override, or merge via Review Queue

---

## 📡 API Reference

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
PUT  /api/auth/profile
```

### Complaints
```
GET  /api/complaints
POST /api/complaints          # multipart/form-data with files
GET  /api/complaints/:id
PUT  /api/complaints/:id
POST /api/complaints/:id/reanalyze
POST /api/complaints/:id/close
```

### Review (Officer+)
```
GET  /api/review-queue
POST /api/review-queue/:id/assign
POST /api/review-queue/:id/override
POST /api/review-queue/:id/merge
```

### Insights (Officer+)
```
GET /api/insights/summary
GET /api/insights/trends?days=30
GET /api/insights/hotspots
```

### Admin
```
GET   /api/admin/users
PATCH /api/admin/users/:id/toggle-active
GET   /api/admin/complaints
GET   /api/admin/stats
GET   /api/admin/audit-logs
```

---

## 🗺 Frontend Routes

| Route | Role | Page |
|---|---|---|
| `/` | Public | Landing |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/dashboard` | All | Citizen Dashboard |
| `/report` | All | Report Issue |
| `/complaints` | All | My Complaints |
| `/complaints/:id` | All | Complaint Detail |
| `/map` | All | Map View |
| `/review-queue` | Officer+ | Review Queue |
| `/review-queue/:id` | Officer+ | Review Detail |
| `/hotspots` | Officer+ | Hotspot Map |
| `/admin` | Admin | Admin Dashboard |
| `/admin/users` | Admin | User Management |
| `/admin/departments` | Admin | Departments |
| `/admin/routing-rules` | Admin | Routing Rules |

---

## 🗄 Database Schema

Key tables:
- `users` — Citizens, officers, admins with role + auth
- `complaints` — Full complaint with AI result fields + embedding column
- `complaint_updates` — Status timeline visible to citizens
- `uploads` — Media file references
- `departments` — City departments with contact info
- `routing_rules` — Category→department mapping with keyword scoring
- `complaint_relations` — Duplicate/merge links
- `hotspot_insights` — Computed geographic risk clusters
- `audit_logs` — Full audit trail of all actions

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Maps | Leaflet.js + OpenStreetMap |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Authentication | JWT + bcrypt |
| Validation | Zod |
| File Uploads | Multer |
| Database | Supabase PostgreSQL |
| AI | Google GenAI SDK (Gemini 1.5 Flash) |
| Rate Limiting | express-rate-limit |

---

## 📋 Issue Categories

- Roads & Potholes
- Garbage & Sanitation
- Water Leakage
- Sewage Overflow
- Streetlight Failure
- Electrical Hazards
- Illegal Dumping
- Fallen Trees & Debris
- Drainage Blockage
- Public Infrastructure Damage
- Traffic Signal Failure
- Public Safety Hazards
- Flooding & Waterlogging
- Noise or Nuisance
- Unknown (requires review)

---

## 🏛 Role Hierarchy

| Role | Permissions |
|---|---|
| `citizen` | Submit complaints, view own complaints, close own complaints |
| `officer` | View all complaints, review queue, assign, override AI, merge |
| `department_admin` | Officer permissions + manage departments + routing rules |
| `super_admin` | All permissions + manage users + audit logs |

---

## 📄 License

MIT — built for demonstration of AI civic intelligence capabilities.
