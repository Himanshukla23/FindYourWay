# PathPilot AI — Phase 3 Python Backend

High-performance Python FastAPI backend service powering the **Phase 3 AI Intelligence Layer** of PathPilot AI.

---

## Features & Services Implemented

1. **AI Service 1 — Resume Parser & Diagnostic** (`POST /api/ai/parse-resume`)
   - Accepts PDF, DOCX file uploads or raw text/form data.
   - Extracts structured entities: education, technical & non-technical skills, projects, experience, certifications, links, and inferred interests.
   - Generates strengths, skill gaps, and 3-tier recommended role matches (Primary, Adjacent, Growth).

2. **AI Service 2 — Career Domain Recommender** (`POST /api/ai/career-recommendations`)
   - Evaluates student background, degree, branch, target goal, and extracted skills.
   - Outputs ranked career domains with suitability scores, evidence, critical gaps, and suggested first actions.

3. **AI Service 3 — Job Profile Recommender** (`POST /api/ai/job-profiles`)
   - Returns curated entry-to-junior level job profiles for any selected career domain.
   - Includes salary ranges (entry vs mid level), core skills, demand level, and "day-in-the-life" summary.

4. **AI Service 4 — Roadmap Generator** (`POST /api/ai/roadmap`)
   - Generates an actionable, personalized 5-milestone roadmap based on target role, hours/week, and graduation year.
   - Produces milestone deliverables, weekly hours, learning resources, and a flagship portfolio capstone project.

5. **AI Service 5 — Follow-Up Career Questions & Refinement**
   - `POST /api/ai/follow-up`: Generates 3-4 role-specific diagnostic dilemma questions.
   - `POST /api/ai/follow-up/refine`: Synthesizes candidate answers to refine their matched career track and next steps.

6. **AI Service 6 — Mentor Matcher** (`POST /api/ai/mentor-match`)
   - Matches candidate target roles, skill gaps, and consultation goals against industry mentors (e.g. Google, Microsoft, CrowdStrike, Flipkart).
   - Generates suitability scores, match rationale, and session topic agendas.

---

## Phase 4 — Mentor Marketplace & Booking Services

1. **Mentor Directory & Seeding** (`GET /api/mentors`, `GET /api/mentors/{id}`)
   - 20+ realistic industry mentors covering Software Dev, AI/ML, Cloud/DevOps, Cybersecurity, Product Management, UI/UX Design, and Data Analytics.
   - Comprehensive filtering by search query, domain, maximum price, minimum rating, and sorting.

2. **Availability & Slot Generation Engine** (`GET /api/mentors/{id}/slots`)
   - Dynamic 30-minute bookable slot generation across 14 upcoming days.
   - Live booking state tracking that disables booked slots and strictly enforces double-booking prevention.

3. **Booking & Demo Checkout Flow** (`POST /api/bookings`)
   - Creates bookings with unique ID, auto-generates Google Meet video links, and marks slots booked.
   - Fully functional Demo Checkout clearly labelled with `is_demo_booking: true` and status `DEMO_CONFIRMED`.

4. **Consultations & Calendar Sync** (`GET /api/bookings`, `GET /api/bookings/{id}/calendar.ics`)
   - "My Consultations" listing and detailed session inspection.
   - RFC 5545 `.ics` iCalendar download for 1-click import into Google Calendar, Outlook, and Apple Calendar.

5. **Cancellation Workflow** (`POST /api/bookings/{id}/cancel`)
   - Cancels consultation and automatically releases the reserved slot back to the mentor's public schedule.

6. **Razorpay Payments** (`POST /api/bookings/razorpay/create-order`, `POST /api/bookings/razorpay/verify-payment`)
   - Real server-side order generation and HMAC-SHA256 signature verification when credentials are provided.

---

## Phase 5 — Persistence, Storage & Progress Tracking Services

1. **Resume Storage & Magic Bytes Validation** (`POST /api/storage/resumes`, `GET /api/storage/resumes`, `DELETE /api/storage/resumes/{id}`)
   - Validates file headers (`%PDF-`, `PK\x03\x04`), enforces 5 MB limit, and provides soft-delete mechanics.

2. **Roadmap Progress & Task Telemetry** (`POST /api/progress/roadmap`, `GET /api/progress/roadmap/{id}`, `PATCH /api/progress/tasks/{id}`)
   - Auto-saves task statuses (`not_started`, `in_progress`, `completed`), project links, and notes.
   - Calculates authoritative server-side completion percentages.

3. **Bookmarks & Saved Items** (`POST /api/saved-items`, `DELETE /api/saved-items/{type}/{id}`, `GET /api/saved-items`)
   - Save and unsave target job profiles and mentor cards with duplicate prevention.

4. **AI Analysis History** (`POST /api/history/analyses`, `GET /api/history/analyses`)
   - Persists all past AI resume evaluations for comparative progress tracking.

5. **Onboarding & Profile State** (`GET /api/students/profile`, `POST /api/students/onboarding`)
   - Stores 4-step onboarding answers and student academic profile.

---

## AI Multi-Provider Fallback Architecture

1. **Ultra-Fast AI Inference**: Groq Llama/GPT-OSS (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`) for sub-second responses.
2. **Google Gemini Integration**: Configured for Gemini models with automatic timeout handling.
3. **Calibrated Deterministic Engine**: Safe fallback mode guaranteeing zero UI crashes if all external networks are offline.

---

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python main.py
```
Or via PowerShell:
```powershell
./run_backend.ps1
```

The server will be live at:
- **API Base:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/health`

### 3. Run Automated Tests
```bash
# Phase 3 AI services test suite
python -u tests/test_phase3_endpoints.py

# Phase 4 Marketplace and Bookings test suite
python -u tests/test_phase4_endpoints.py

# Phase 5 Persistence and Storage test suite
python -u tests/test_phase5_endpoints.py

# Phase 6 Full End-to-End System Integration test suite
python -u tests/test_phase6_e2e.py
```
All endpoints and user journeys are verified with 100% test coverage.

---

## Running the Complete System (Frontend + Backend)

1. **Start the Python FastAPI Backend:**
   ```powershell
   ./run_backend.ps1
   # Or: python backend/main.py
   ```
   Backend runs at `http://localhost:8000`.

2. **Start the Next.js Frontend:**
   ```bash
   cd pathpilot
   npm run dev
   ```
   Frontend runs at `http://localhost:3000`. Next.js proxies backend requests transparently via `/api/py/` to `http://localhost:8000/api/` with automatic offline demo resilience.

