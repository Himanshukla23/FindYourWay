# FindYourWay / PathPilot AI 🚀

An AI-driven career pathing, roadmap generator, and study planner application powered by Next.js, FastAPI, Supabase, Google Gemini, and Groq.

---

## 📁 Repository Structure

```
.
├── backend/          # FastAPI Python backend (AI Roadmap engines, Gemini/Groq, Google APIs)
├── pathpilot/        # Next.js 15+ frontend (React, Tailwind CSS, Lucide icons, Supabase Auth)
├── docs/             # Documentation and design specs
├── .gitignore        # Root gitignore rules protecting secrets & build artifacts
└── run_backend.ps1   # PowerShell helper script to launch backend locally
```

---

## 🛠️ Quick Start & Setup

### 1. Backend (FastAPI)

```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys (Gemini, Groq, Supabase, Google OAuth)

# Run the backend server
uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)

```bash
cd pathpilot

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase keys and backend URL (http://localhost:8000)

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Guide

### Frontend Deployment (Vercel)
1. Import the repository into **Vercel**.
2. Set the **Root Directory** to `pathpilot`.
3. Add the environment variables specified in [`pathpilot/.env.example`](file:///c:/Users/himan/OneDrive/Desktop/Findyourway/pathpilot/.env.example).
4. Deploy!

### Backend Deployment (Render / Railway / Fly.io)
1. Connect this repository to your hosting provider (e.g., Render or Railway).
2. Set the **Root Directory** to `backend`.
3. Set the build command: `pip install -r requirements.txt`.
4. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Add the environment variables from [`backend/.env.example`](file:///c:/Users/himan/OneDrive/Desktop/Findyourway/backend/.env.example).

---

## 🔒 Security Notice
Do not commit actual `.env` files, API keys, or confidential credentials. Ensure all secrets are set via your deployment provider's secret/environment configuration.
