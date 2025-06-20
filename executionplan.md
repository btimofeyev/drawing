# Daily Scribble – Comprehensive Product Requirements & System Specification

> **Version:** 1.1  |  **Last Updated:** June 19 2025

---
## Table of Contents
1. [Purpose & Goals](#purpose--goals)
2. [Overview & Architecture](#overview--architecture)
3. [Success Metrics](#success-metrics)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [Authentication Systems](#authentication-systems)
7. [Features & Functionality](#features--functionality)
8. [Non‑Functional Requirements](#non‑functional-requirements)
9. [API Endpoints](#api-endpoints)
10. [Data Flow Patterns](#data-flow-patterns)
11. [Security Analysis](#security-analysis)
12. [Development & Deployment](#development--deployment)
13. [Milestones & Timeline](#milestones--timeline)
14. [Open Questions](#open-questions)

---

## Purpose & Goals

| Item | Description |
|------|-------------|
| **Problem** | Kids and tweens need a safe, inspiring space to practise drawing and share art; existing platforms are adult‑centric or unsafe. |
| **Vision** | A **mobile‑first web app** delivering daily, age‑appropriate prompts, effortless artwork upload and light social feedback, with robust parental oversight. |
| **Launch Objective** | **Ship MVP by mid‑July 2025** to capture summer‑break interest, then iterate toward a richer, gamified community. |

---

## Overview & Architecture

### Core Purpose
* Provide daily drawing challenges for children **6 – 16**.  
* Safe, COPPA‑aligned social sharing.  
* Gamify creativity via achievements, streaks, leaderboards.  
* Parental oversight dashboards.  
* AI‑generated prompts (OpenAI GPT‑4o‑mini).

### High‑Level System Diagram
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Parents │ │ Children │ │ OpenAI │
│ (Magic‑link) │ │ (PIN / Email) │ │ Prompt Gen/API │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│ │ │
▼ ▼ ▼
┌──────────────────────────────────────────────────────────────────┐
│ Next.js 15 PWA (Daily Draw) │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Parent Views │ │ Child Views │ │ API Routes │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────┐
│ Supabase Cloud │
│ Auth   │  Postgres │  Storage │  Functions │
└─────────────────────────────────────────────┘



## Technology Stack

### Frontend
* **Framework**  Next.js 15 (App Router, TypeScript)  
* **UI / Styling**  React 19, Tailwind CSS 
* **Icons**  Lucide React  
* **Forms & Validation**  React‑Hook‑Form + Zod  
* **File Handling**  React Dropzone, browser‑image‑compression  
* **PWA**  `next‑pwa` for offline cache / install banner  

### Backend & Services
* **Database / Auth / Storage**  Supabase (PostgreSQL 15)  
* **Prompt Engine**  Supabase Edge Function → OpenAI GPT‑4o‑mini  
* **Realtime**  Supabase Realtime for likes / feed updates  

---


## Database Schema

> **Note:** Combines base MVP tables with expanded achievement system.

| Core Table | Purpose |
|------------|---------|
| **profiles** | Parent‑linked child profiles for web‑auth flow |
| **parent_accounts** | Parent records (Supabase auth users) |
| **child_profiles** | PIN‑protected child accounts |
| **prompts** | 6 daily prompts (3 difficulties × 2 age groups) |
| **posts** | Artwork submissions with image & thumb URLs |
| **child_likes** | Like pivot table |
| **achievements** / **user_achievements** | Gamification definitions & progress |
| **user_stats** | Aggregated metrics for streaks/levels |


## Authentication Systems

### Parent Authentication (Magic‑Link)
* Supabase Auth → email link → secure, HTTP‑only cookie session.  
* Server‑side middleware guards all `/parent/*` routes.

### Child Authentication (4‑digit PIN)
* PIN hashed with **bcrypt** (12 rounds).  
* Session stored in HTTP‑only cookie (fallback localStorage if cookies disabled), 24 h TTL.   
* Server‑side middleware for `/child‑home/*` routes.

---


## Features & Functionality

### MVP Must‑Haves
| ID | Feature | Detail |
|----|---------|--------|
| **F‑1** | Auth & Profiles | Parent magic‑link; child PIN; avatar & age bracket. |
| **F‑2** | Daily Prompts | 3 (Easy/Med/Hard) per bracket, generated early morning EST, cached. |
| **F‑3** | Upload Drawing | ≤ 5 MB, auto‑compress → Storage; alt‑text required. |
| **F‑4** | Feed & Like | Infinite scroll (20), realtime likes, no comments (MVP). |
| **F‑5** | Basic Moderation | OpenAI image safe‑check; reject flagged images. |
| **F‑6** | Parental Consent (<13) | Parents apporve via dashboard; posting blocked until consent. |




## API Endpoints (Highlights)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/auth/signout` | Parent logout |
| `POST` | `/api/child/upload` | Artwork upload (rate‑limited 3/day) |
| `POST` | `/api/child/like` | Like / unlike (calls `handle_child_like`) |
| `POST` | `/api/generate-prompts` | Manual prompt generation |
| `GET`  | `/api/cron/generate-daily-prompts` | Cron‑protected daily prompt task |



## Data Flow Patterns

1. **Child Upload Workflow** – validation → rate limit → storage upload → DB insert → achievement check.  
2. **Like Action Workflow** – optimistic UI → API → DB function → stat & achievement update.  
3. **Daily Prompt Generation** – cron → auth → OpenAI → DB write.  
4. **Parent Onboarding** – magic link → callback → child‑creation wizard (4 steps).  


## Development & Deployment

### Local Setup
```bash
npm i          # install deps
npm run dev    # http://localhost:3000
Environment vars: see .env.example.

Production Build
bash
Always show details

Copy
npm run build && npm start

Milestones & Timeline
Date (2025)	Deliverable
June 30	Auth, profile, prompt function on staging
July 7	Upload flow, feed, likes
July 11	Moderation + parental consent
July 14	Beta (30 kids)
July 18	Public MVP launch
Aug 2025	v1.1 – comments, achievements, web‑push

