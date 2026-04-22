# <img src="https://raw.githubusercontent.com/yourusername/dsaandchill/main/frontend/public/favicon.svg" width="32" height="32" /> DSA&Chill

> **Your AI-powered DSA learning system. Sync. Analyze. Crack placements.**

<!-- BANNER IMAGE — replace with your actual screenshot -->
<p align="center">
  <img src="https://placehold.co/1200x500/09090f/22c55e?text=DSA%26Chill+%E2%80%94+AI-Powered+DSA+Learning+System&font=montserrat" alt="DSA&Chill Banner" width="100%" style="border-radius:12px;" />
</p>

<p align="center">
  <!-- Stack badges -->
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-FF0055?style=for-the-badge&logo=framer&logoColor=white" />
  <br/>
  <!-- Meta badges -->
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge&logo=github" />
  <img src="https://img.shields.io/badge/Status-Active-22c55e?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Made%20by-Harsh%20Gupta-FF6B6B?style=for-the-badge" />
</p>

---

## 📋 Table of Contents

- [The Problem & Our Solution](#-the-real-world-problem--our-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture--workflow)
- [Tech Stack](#-tech-stack)
- [Local Setup](#-local-setup--installation)
- [Environment Variables](#-environment-variables)
- [Folder Structure](#-folder-structure)
- [Screenshots](#-screenshots)
- [Future Roadmap](#-future-roadmap)
- [Author](#-author)

---

## 🎯 The Real-World Problem & Our Solution

### The Problem

College DSA preparation is **broken**. Students grind LeetCode in isolation, instructors have zero visibility into who's struggling, and nobody knows which topics are dragging down placement outcomes — until it's too late.

| Pain Point | Reality Today |
|---|---|
| 📊 No visibility for teachers | Instructors assign problems but have no idea if students actually solve them |
| 🔄 Manual progress tracking | Students maintain spreadsheets or rely on memory — both fail under exam pressure |
| 🤖 Generic advice | "Practice more DP" is not coaching — real coaching is specific, data-driven, and timely |
| 🔒 Security flaws | Class-code sharing means anyone can join anyone's class |
| 🏝️ Student isolation | No leaderboard, no peer benchmarking, no accountability mechanism |

### Our Solution: DSA&Chill

**DSA&Chill** is a **production-grade, full-stack AI learning system** that bridges the gap between students grinding LeetCode and teachers tracking outcomes — in real time.

- 🔄 **Auto-sync** LeetCode stats via the unofficial GraphQL API — no manual entry ever
- 🧠 **Gemini 2.5 Flash AI** generates personalized, data-driven coaching insights automatically
- 👩‍🏫 **Teacher panel** with class roster management, topic heatmaps, and student deep-dives
- 🏆 **Leaderboard** with tier system to drive accountability and healthy competition
- 📋 **Custom problem sheets** — teachers assign curated lists, students create personal practice sets
- ✅ **LeetCode-verified progress** — problems are marked done only after verifying actual submission
- 💬 **DSA Buddy chatbot** — context-aware AI assistant with role-specific coaching (student vs teacher)

> Built as a **college project** with the soul of a **production SaaS product** — designed for real users, real workflows, and real placement outcomes.

---

## ✨ Key Features

### 👨‍🎓 Student Panel

| Feature | Description |
|---|---|
| **LeetCode Auto-Sync** | One-click sync pulls total solved, difficulty breakdown, topic stats, acceptance rate, global rank, and last 20 accepted submissions via LeetCode's GraphQL API |
| **Personalized AI Insights** | Gemini 2.5 Flash auto-generates 6–8 placement-focused coaching insights (strength, weakness, interview prep, daily task, pattern to study) — updates automatically on each sync |
| **Activity Heatmap** | GitHub-style 18-week contribution calendar with streak tracking, day labels, month markers, and color intensity levels |
| **Skill Radar Chart** | Recharts radar showing top 6 topic strengths — visual at a glance |
| **Topic Breakdown** | Horizontally scrollable bar chart showing **all** solved topics, not capped — with top-3 highlighting |
| **Tier System** | Rookie → Grinder → Coder → Expert → Legend progression with animated progress ring |
| **Class Sheets** | View published problem sheets from instructor with due dates, difficulty tags, teacher notes — track completion with LeetCode-verified checkmarks |
| **Personal Sheets** | Build private practice lists — drag-to-reorder problems, auto-fill title from LeetCode URL slug |
| **LeetCode Verification** | "Verify" button checks actual LeetCode submission history (last 100 AC) before marking a problem done — no cheating |
| **Leaderboard** | Class-wide rankings with podium, metric tabs (Total / Hard / Medium / Acc%), tier badges, and "You" highlight |
| **DSA Buddy Chatbot** | Role-aware AI chatbot with student-specific greeting, quick suggestions (DP explanations, interview tips, pattern guides), markdown rendering |

### 👩‍🏫 Teacher Panel

| Feature | Description |
|---|---|
| **Class Roster Management** | Add students by email — auto-enroll if registered, queue as pending invite if not yet signed up. No shareable codes, no security risk |
| **Class Overview Dashboard** | Avg solved, avg acceptance, top student, total enrolled — all animated stat cards |
| **Topic Heatmap** | Scrollable grid showing ALL class topics with avg-per-student color coding, mini progress bars, rank badges, and "needs work" summary |
| **AI Class Insights** | Gemini analyzes class data — flags at-risk students by name, identifies topic gaps, gives placement-readiness assessment |
| **Student Deep-Dive** | Click any student row → full profile with submission trend, skill radar, topic breakdown, heatmap, and AI coaching for that student |
| **Sheet Builder** | Create problem sheets with draggable ordering, LeetCode URL auto-fill, difficulty selector, per-problem teacher notes, draft/published toggle, due dates |
| **Sheet Editor** | Edit existing sheets in-place with dirty-state tracking — save button only activates when changes are made |
| **Leaderboard** | Same leaderboard as student view — useful for identifying top performers and laggards simultaneously |
| **DSA Buddy Chatbot** | Teacher-specific greeting, teacher-specific suggestions (class planning, lecture topics, student interventions) |

### 🎨 UI/UX & Design

- **Dark / Light Mode** — Tailwind `class` strategy with CSS variable system; default dark, instant toggle with animated sun/moon icon, persisted via Zustand
- **⌘K Command Palette** — Keyboard-navigable command center with role-aware commands, tag badges, fuzzy search, Enter to execute, Escape to dismiss
- **Framer Motion** — Page transitions, staggered list reveals, spring physics on cards, layout animations on sidebar collapse, animated counters
- **Responsive Layout** — Mobile sidebar overlay with backdrop blur, touch-friendly 44px tap targets, iOS safe-area padding
- **Collapsible Sidebar** — Animated collapse/expand with icon-only mode, active route indicator with `layoutId` animation
- **Skeleton Loaders** — Shimmer skeletons on every data section — no blank states, no layout shift
- **Custom Scrollbars** — Thin styled scrollbars matching the brand color palette
- **Toast Notifications** — `react-hot-toast` with dark/light theme-aware styling
- **Premium Typography** — Syne (display), DM Sans (body), JetBrains Mono (code) — Google Fonts with antialiasing
- **CSS Variable Design System** — Full light/dark token set for backgrounds, text, borders, semantic colors (easy/medium/hard)

---

## 🏗️ System Architecture & Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        STUDENT BROWSER                          │
│   React + Zustand + Framer Motion + Recharts + TailwindCSS      │
└───────────────────────────┬─────────────────────────────────────┘
                            │  REST API (JWT Bearer Token)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS BACKEND                          │
│                                                                  │
│   /api/auth      → Register · Login · Google OAuth (ID Token)   │
│   /api/leetcode  → Sync · Stats · Verify Problem                │
│   /api/sheets    → Class Sheets · Personal Sheets · Progress    │
│   /api/analytics → Class Data · Leaderboard · Topic Stats       │
│   /api/students  → Invite · Enroll · Remove · Pending           │
│   /api/ai        → Insight (JSON) · Chat (Conversational)       │
└──────┬──────────────────────┬────────────────────────────┬──────┘
       │                      │                            │
       ▼                      ▼                            ▼
┌─────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│   MongoDB   │   │  LeetCode GraphQL   │   │  Gemini 2.5 Flash   │
│  (Mongoose) │   │  (Unofficial API)   │   │   (Google AI SDK)   │
│             │   │                     │   │                     │
│ • User      │   │ • Profile stats     │   │ • 6-8 Insights JSON │
│ • Progress  │   │ • Topic tag counts  │   │ • Chat responses    │
│ • Sheet     │   │ • Recent AC subs    │   │ • responseMimeType  │
└─────────────┘   │ • Problem verify    │   │   application/json  │
                  └─────────────────────┘   └─────────────────────┘
```

### End-to-End Sync Flow

```
Student clicks "Sync LC"
        │
        ▼
Backend: 3 parallel GraphQL queries to leetcode.com
  → getUserProfile   (solved counts, ranking, acceptance)
  → getRecentAcSubs  (last 20 accepted submissions)
  → getUserTagCounts (topic-wise problem counts)
        │
        ▼
Results merged → Progress.leetcode upserted in MongoDB
        │
        ▼
Frontend receives updated stats via CustomEvent
        │
        ├─→ Recharts re-renders (radial, bar, area, radar)
        ├─→ Heatmap rebuilds from new submission timestamps
        └─→ GeminiInsight detects signature change → auto-refetches insights
```

### AI Insight Auto-Refresh Logic

```
Data signature = `${totalSolved}-${hardSolved}-${topicCount}`

On mount:   Check localStorage cache (8h TTL + signature match)
            → Cache hit & fresh  : render immediately (0 API calls)
            → Cache miss / stale : fetch Gemini, write cache

On sync:    'leetcode-synced' event → force re-fetch (signature changed)
On refresh: Manual button → force re-fetch (ignore cache)

Result: Insights always reflect current data, API calls minimised.
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React.js** | 18.3 | UI framework with hooks |
| **Vite** | 5.3 | Build tool & dev server |
| **TailwindCSS** | 3.4 | Utility-first CSS with `darkMode: 'class'` |
| **Framer Motion** | 11 | Animations, transitions, layout animations |
| **Recharts** | 2.12 | Radial, bar, area, radar, pie charts |
| **Zustand** | 4.5 | Lightweight global state (auth + theme + command) |
| **React Router DOM** | 6.24 | Client-side routing with nested layouts |
| **Axios** | 1.7 | HTTP client with JWT interceptors |
| **React Hot Toast** | 2.4 | Toast notifications |
| **Lucide React** | 0.400 | Icon library |
| **date-fns** | 3.6 | Date formatting utilities |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ | Runtime (ESM modules) |
| **Express.js** | 4.19 | REST API framework |
| **Mongoose** | 8.4 | MongoDB ODM with schema validation |
| **JSON Web Token** | 9.0 | Stateless auth tokens |
| **bcryptjs** | 2.4 | Password hashing (12 rounds) |
| **google-auth-library** | 9.11 | Google OAuth ID token verification |
| **@google/generative-ai** | 0.15 | Gemini 2.5 Flash SDK |
| **axios** | 1.7 | LeetCode GraphQL fetcher |
| **nanoid** | 3.3 | Unique class code generation |
| **cors** | 2.8 | Cross-origin resource sharing |
| **dotenv** | 16.4 | Environment variable management |

### Database & Services

| Service | Usage |
|---|---|
| **MongoDB Atlas** | Cloud-hosted MongoDB — Users, Progress, Sheets |
| **Google Gemini 2.5 Flash** | AI insights + DSA Buddy chatbot |
| **Google OAuth 2.0** | One-tap sign-in (ID Token flow — no redirect) |
| **LeetCode GraphQL** | Unofficial API for stats, topics, submissions |
| **Netlify** | Frontend deployment (SPA with `_redirects`) |

---

## 🚀 Local Setup & Installation

### Prerequisites

```bash
node --version   # v18+ required (v20 recommended)
npm --version    # v9+
```

You will also need:
- A **MongoDB Atlas** connection string (free tier works)
- A **Google Gemini API key** from [aistudio.google.com](https://aistudio.google.com/app/apikey) (free)
- A **Google OAuth Client ID** from [console.cloud.google.com](https://console.cloud.google.com) (optional — email login works without it)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/harshgupta751/SolveTracker.git
cd SolveTracker
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
# then fill in the values — see Environment Variables section below
```

Seed the database with demo data:

```bash
node seed.js
```

Start the backend dev server:

```bash
npm run dev
# Server running on http://localhost:5000
```

---

### Step 3 — Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env
# Add your VITE_GOOGLE_CLIENT_ID
```

Start the frontend dev server:

```bash
npm run dev
# App running on http://localhost:5173
```

---

### Step 4 — Open the App

| URL | Description |
|---|---|
| `http://localhost:5173` | React frontend |
| `http://localhost:5000/api/health` | Backend health check |

**Demo accounts (created by seed.js):**

| Role | Email | Password |
|---|---|---|
| Teacher | `teacher@dsademo.com` | `demo1234` |
| Student (Legend) | `arjun@dsademo.com` | `demo1234` |
| Student (Expert) | `sneha@dsademo.com` | `demo1234` |
| Student (Rookie) | `dev@dsademo.com` | `demo1234` |

> All 7 demo students are pre-enrolled in the teacher's class with realistic LeetCode stats, sheet progress, and submission history.

---

## 🔐 Environment Variables

### `backend/.env`

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/SolveTracker

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRES_IN=7d

# Google OAuth (for "Sign in with Google" button)
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_secret

# AI — Gemini (get free key at aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### `frontend/.env`

```env
# Google OAuth Client ID (same value as backend GOOGLE_CLIENT_ID)
# Must be prefixed with VITE_ to be accessible in the browser
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

> **Security note:** Never commit `.env` files. Both are already in `.gitignore`.

---

## 📁 Folder Structure

```
SolveTracker/
│
├── backend/                          # Node.js + Express API
│   ├── middleware/
│   │   └── auth.js                   # JWT verifyToken + requireRole guards
│   ├── models/
│   │   ├── User.js                   # User schema (student + teacher fields)
│   │   ├── Sheet.js                  # Problem sheet schema (class + personal)
│   │   └── Progress.js               # LeetCode stats + sheet completion
│   ├── routes/
│   │   ├── auth.js                   # Register · Login · Google OAuth · /me
│   │   ├── leetcode.js               # Sync · Stats · Verify-problem
│   │   ├── sheets.js                 # Class sheets · Personal sheets · Toggle
│   │   ├── analytics.js              # Class data · Leaderboard · Topic stats
│   │   ├── students.js               # Invite · Enroll · Remove · Pending
│   │   └── ai.js                     # Insight (JSON) · Chat (conversational)
│   ├── utils/
│   │   └── leetcode.js               # GraphQL fetcher + verifyProblemSolved
│   ├── seed.js                       # Demo data seeder
│   ├── server.js                     # Express bootstrap + route mount
│   └── .env                          # Environment variables (not committed)
│
└── frontend/                         # React + Vite
    ├── public/
    │   ├── favicon.svg
    │   └── _redirects                # Netlify SPA routing fix
    └── src/
        ├── api/
        │   └── index.js              # Axios instance + all API methods
        ├── components/
        │   ├── ai/
        │   │   └── ClaudeInsight.jsx  # Auto-fetch Gemini insights (student + teacher)
        │   ├── auth/
        │   │   └── GoogleButton.jsx   # Google Identity Services button
        │   ├── charts/
        │   │   ├── ClassHeatmap.jsx   # Teacher topic heatmap (scrollable grid)
        │   │   ├── DifficultyDonut.jsx
        │   │   ├── ProgressLine.jsx   # Area chart (submission trend)
        │   │   ├── SolvedRadar.jsx    # Radial bar (difficulty split)
        │   │   ├── StreakCalendar.jsx  # GitHub-style 18-week heatmap
        │   │   └── TopicBreakdown.jsx # Horizontally scrollable bar chart
        │   ├── layout/
        │   │   ├── AppLayout.jsx      # Root layout with sidebar + navbar + footer
        │   │   ├── Footer.jsx         # Branded footer with Harsh Gupta credit
        │   │   ├── Navbar.jsx         # Top bar with sync, ⌘K, theme toggle
        │   │   ├── Sidebar.jsx        # Collapsible sidebar with role-based nav
        │   │   └── ThemeToggle.jsx    # Animated dark/light toggle
        │   ├── shared/
        │   │   ├── AnimatedCounter.jsx # Eased number count-up on scroll-into-view
        │   │   ├── ConfirmDialog.jsx   # Reusable modal with danger variant
        │   │   ├── DifficultyBadge.jsx # Easy / Medium / Hard pill badge
        │   │   └── LoadingPulse.jsx    # Shimmer skeleton components
        │   ├── Chatbot.jsx             # Floating DSA Buddy AI chatbot
        │   └── CommandPalette.jsx      # ⌘K keyboard command palette
        ├── hooks/
        │   ├── useAnalytics.js         # useClassAnalytics + useLeaderboard
        │   ├── useLeetcode.js          # useLeetcodeStats (student + teacher view)
        │   └── useSheets.js            # useSheets with toggle + verify + progress
        ├── lib/
        │   └── utils.js                # cn() · formatNumber · relativeTime · etc.
        ├── pages/
        │   ├── Landing.jsx             # Public marketing page
        │   ├── Login.jsx               # Email + Google sign-in
        │   ├── Register.jsx            # Role selector + email + Google sign-up
        │   ├── Leaderboard.jsx         # Shared leaderboard (student + teacher)
        │   ├── student/
        │   │   ├── Dashboard.jsx       # Main student home with all analytics
        │   │   ├── MySheets.jsx        # Class + personal sheets with verify flow
        │   │   ├── Progress.jsx        # Full progress deep-dive page
        │   │   └── CreatePersonalSheet.jsx  # Modal sheet builder
        │   └── teacher/
        │       ├── Dashboard.jsx       # Teacher overview + student roster + sheets
        │       ├── CreateSheet.jsx     # Drag-and-drop sheet creator
        │       ├── SheetEditor.jsx     # Edit existing sheet with dirty tracking
        │       ├── StudentView.jsx     # Individual student deep-dive
        │       └── ManageStudents.jsx  # Invite · pending · enrolled · remove
        ├── store/
        │   ├── authStore.js            # Zustand: user · token · role · actions
        │   ├── commandStore.js         # Zustand: command palette open/close
        │   └── themeStore.js           # Zustand: dark/light + localStorage persist
        ├── App.jsx                     # Route definitions + guards
        ├── main.jsx                    # React root + CommandPalette + Toaster
        └── index.css                   # Tailwind directives + CSS variable system
```

---

## 📸 Screenshots


### 🌙 Student Dashboard — Dark Mode
<p align="center">
  <img src="https://placehold.co/1100x620/09090f/22c55e?text=Student+Dashboard+%E2%80%94+Dark+Mode&font=montserrat" alt="Student Dashboard Dark" width="100%" style="border-radius:10px;" />
</p>

### ☀️ Student Dashboard — Light Mode
<p align="center">
  <img src="https://placehold.co/1100x620/fafbff/16a34a?text=Student+Dashboard+%E2%80%94+Light+Mode&font=montserrat" alt="Student Dashboard Light" width="100%" style="border-radius:10px;" />
</p>

### 📋 My Sheets — LeetCode Verify Flow
<p align="center">
  <img src="https://placehold.co/1100x620/09090f/4285f4?text=My+Sheets+%E2%80%94+Verify+Flow&font=montserrat" alt="My Sheets Verify" width="100%" style="border-radius:10px;" />
</p>

### 🤖 AI Insights Panel
<p align="center">
  <img src="https://placehold.co/1100x620/09090f/22c55e?text=AI+Insights+%E2%80%94+Gemini+Coaching&font=montserrat" alt="AI Insights" width="100%" style="border-radius:10px;" />
</p>

### 👩‍🏫 Teacher Dashboard — Class Overview
<p align="center">
  <img src="https://placehold.co/1100x620/09090f/818cf8?text=Teacher+Dashboard+%E2%80%94+Class+Overview&font=montserrat" alt="Teacher Dashboard" width="100%" style="border-radius:10px;" />
</p>

### 👥 Manage Students — Invite Flow
<p align="center">
  <img src="https://placehold.co/1100x620/09090f/22c55e?text=Manage+Students+%E2%80%94+Invite+Flow&font=montserrat" alt="Manage Students" width="100%" style="border-radius:10px;" />
</p>

### 🏆 Leaderboard — Podium & Rankings
<p align="center">
  <img src="https://placehold.co/1100x620/09090f/f59e0b?text=Leaderboard+%E2%80%94+Podium+%26+Rankings&font=montserrat" alt="Leaderboard" width="100%" style="border-radius:10px;" />
</p>

### 💬 DSA Buddy Chatbot
<p align="center">
  <img src="https://placehold.co/500x600/111118/4285f4?text=DSA+Buddy+%E2%80%94+AI+Chatbot&font=montserrat" alt="DSA Buddy Chatbot" width="45%" style="border-radius:10px;" />
</p>

---

## 🗺️ Future Roadmap

| Priority | Feature | Description |
|---|---|---|
| 🔴 High | **Email Notifications** | Notify students when a new sheet is published or a due date is approaching |
| 🔴 High | **Mobile App (React Native)** | Extend to iOS and Android with the same backend |
| 🟡 Medium | **Codeforces Integration** | Sync competitive programming stats alongside LeetCode |
| 🟡 Medium | **GeeksforGeeks & HackerRank Sync** | Multi-platform problem tracking |
| 🟡 Medium | **AI Problem Recommendations** | Gemini recommends specific LeetCode problems based on weaknesses |
| 🟡 Medium | **Discussion Threads on Sheets** | Students can discuss problems with the class directly on the platform |
| 🟢 Low | **Contest Tracker** | Upcoming LeetCode / Codeforces contest calendar with reminders |
| 🟢 Low | **Institutional Admin Panel** | Department-level view for HODs / placement cells |
| 🟢 Low | **Resume Skill Badge Export** | Auto-generate verifiable skill badges for GitHub / LinkedIn from solve history |
| 🟢 Low | **Dark Mode Themes** | Multiple accent colors beyond the current green palette |
| 🟢 Low | **Offline PWA Support** | Service worker caching for offline access to last-synced data |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve SolveTracker:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the existing code style — ESM imports, functional components, Tailwind utility classes with CSS variables for theming.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<p align="center">
  <b>Harsh Gupta</b><br/>
  Full-Stack Developer · DSA Enthusiast · Open Source Contributor
  <br/><br/>
  <a href="https://github.com/harshgupta751">
    <img src="https://img.shields.io/badge/GitHub-harshgupta751-181717?style=for-the-badge&logo=github" />
  </a>
  &nbsp;
  <a href="https://linkedin.com/in/harshachieve100">
    <img src="https://img.shields.io/badge/LinkedIn-Harsh_Gupta-0077B5?style=for-the-badge&logo=linkedin" />
  </a>
  &nbsp;
  <a href="mailto:harshachieve300@gmail.com">
    <img src="https://img.shields.io/badge/Email-harshachieve300@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>
</p>

---

<p align="center">
  <b>Built with ⚡ for the grind · SolveTracker © 2026</b>
  <br/>
  <sub>If this project helped you, consider giving it a ⭐ on GitHub!</sub>
</p>