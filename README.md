# AI Civic Intelligence Platform

AI Civic Intelligence Platform is an AI-powered civic complaint management system that helps citizens report public issues using text, images, videos, voice notes, and GPS location. The platform automatically classifies complaints, detects duplicates, routes issues to the correct department or officer, prioritizes urgent cases, and provides transparent status tracking for both citizens and administrators.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Submission Requirements](#submission-requirements)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## Overview

Cities receive thousands of complaints every day through apps, WhatsApp, email, social media, phone calls, and government portals. These complaints are often scattered, duplicated, manually reviewed, poorly prioritized, and sent to the wrong department.

This project solves that problem by using AI to turn raw citizen reports into actionable civic intelligence.

## Problem Statement

Traditional civic complaint systems are fragmented and manual, which leads to duplicate reports, slow processing, wrong department assignment, and poor transparency. Citizens often do not know what happened to their complaint after submission, while authorities struggle to prioritize urgent issues and identify recurring hotspots.

## Proposed Solution

The proposed solution is an AI-powered Civic Intelligence Platform that unifies complaint intake across multiple formats and automatically analyzes each report using multimodal AI. It identifies the issue type, detects duplicates, estimates urgency, routes the complaint to the correct department or officer, and gives citizens real-time status updates. The platform also provides administrators with dashboards, trend analytics, and hotspot insights to improve decision-making and resource allocation.

## Features

- Citizen registration and login.
- Role-based access for Citizen, Officer, Department Admin, and Super Admin.
- Multimodal complaint submission with text, image, video, audio, and GPS location.
- AI-based issue classification and duplicate detection.
- Automatic routing to the correct department/officer.
- Complaint prioritization based on severity and urgency.
- Citizen-facing complaint status tracking.
- Admin dashboard for complaint monitoring and analytics.
- Officer review queue and reassignment workflow.
- Secure backend AI integration with Gemini.
- Responsive UI for mobile and desktop.

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Zod
- Multer

### Database
- PostgreSQL

### AI
- Google Gemini API
- `@google/genai` SDK

## Architecture

The system is built as a full-stack application with:
- A React frontend for users, officers, and admins.
- An Express backend for APIs, authentication, routing, and file uploads.
- A PostgreSQL database for persistent storage.
- A server-side Gemini integration for multimodal AI analysis.

## Folder Structure

```txt
src/
  client/
    assets/
    components/
    hooks/
    layouts/
    pages/
    routes/
    services/
    styles/
    utils/
  server/
    config/
    controllers/
    db/
    middleware/
    models/
    routes/
    services/
    validators/
    utils/
    uploads/
  shared/
    schemas/
    constants/
    types/
```

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database
- Google Gemini API key

### Steps
```bash
git clone https://github.com/your-username/ai-civic-intelligence-platform.git
cd ai-civic-intelligence-platform
npm install
```

## Environment Variables

Create a `.env` file in the backend and add the following:

```bash
PORT=5000
NODE_ENV=development
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=25
FRONTEND_URL=http://localhost:5173
```

## Database Setup

Run the PostgreSQL schema before starting the backend. Make sure your tables for users, complaints, departments, routing rules, uploads, assignments, and audit logs are created successfully.

If using migrations or SQL scripts, run them in this order:
1. Create base tables.
2. Seed departments and officers.
3. Enable row level security.
4. Add routing rules.

## Running the Project

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

## Usage

1. Register or log in as a citizen, officer, or admin.
2. Citizens submit complaints with text, photos, videos, voice notes, and location.
3. The AI analyzes and classifies the complaint.
4. The complaint is routed to the correct department or officer.
5. Officers review and update cases.
6. Admins monitor all complaints, assignments, and hotspot trends.

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Complaints
- `GET /api/complaints`
- `POST /api/complaints`
- `GET /api/complaints/:id`
- `PUT /api/complaints/:id`
- `POST /api/complaints/:id/reanalyze`
- `POST /api/complaints/:id/close`

### Review
- `GET /api/review-queue`
- `POST /api/review-queue/:id/assign`
- `POST /api/review-queue/:id/override`
- `POST /api/review-queue/:id/merge`

### Departments
- `GET /api/departments`
- `POST /api/departments`
- `PUT /api/departments/:id`
- `DELETE /api/departments/:id`

### Uploads
- `POST /api/uploads`
- `GET /api/uploads/:id`
- `DELETE /api/uploads/:id`

### Insights
- `GET /api/insights/summary`
- `GET /api/insights/trends`
- `GET /api/insights/hotspots`

### Admin
- `GET /api/admin/users`
- `GET /api/admin/complaints`
- `GET /api/admin/stats`
- `GET /api/admin/audit-logs`

## Deployment

### Frontend
Deploy the frontend on Vercel and set:
```bash
VITE_API_BASE_URL=https://your-backend-url
```

### Backend
Deploy the backend on Render and set:
```bash
FRONTEND_URL=https://your-vercel-app.vercel.app
DATABASE_URL=your_production_db_url
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
```

## Screenshots

Add screenshots here:
- Home page.
- Complaint submission form.
- AI result panel.
- Officer review queue.
- Admin dashboard.

## Submission Requirements

- Problem Statement.
- Solution Description.
- GitHub Repository.
- Deployed Application Link.
- Demo Video.

## Future Improvements

- Live map-based complaint clustering.
- SMS/WhatsApp complaint submission.
- Better multilingual support.
- Predictive maintenance analytics.
- Automated citizen notifications.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss the proposed changes.

## License

This project is licensed under the MIT License.
