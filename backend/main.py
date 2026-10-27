import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import resume, career, roadmap, follow_up, mentor, marketplace_router, bookings_router, persistence_router

app = FastAPI(
    title="PathPilot AI - Core Backend Service",
    description="Python FastAPI backend powering Phase 3 (AI Intelligence Layer), Phase 4 (Mentor Marketplace & Booking), and Phase 5 (Persistence, Storage & Progress Tracking).",
    version="1.2.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for UI / UX integration (Node.js / Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Phase 3 AI Routers
app.include_router(resume.router)
app.include_router(career.router)
app.include_router(roadmap.router)
app.include_router(follow_up.router)
app.include_router(mentor.router)

# Include Phase 4 Mentor Marketplace & Booking Routers
app.include_router(marketplace_router.router)
app.include_router(bookings_router.router)

# Include Phase 5 Persistence, Storage & Progress Tracking Routers
app.include_router(persistence_router.router)

@app.get("/")
async def root():
    return {
        "service": "PathPilot AI Backend",
        "phase": "Phase 3 (AI Intelligence), Phase 4 (Marketplace) & Phase 5 (Persistence & Storage)",
        "status": "operational",
        "endpoints": [
            "POST /api/ai/parse-resume",
            "POST /api/ai/career-recommendations",
            "POST /api/ai/job-profiles",
            "POST /api/ai/roadmap",
            "POST /api/ai/follow-up",
            "POST /api/ai/follow-up/refine",
            "POST /api/ai/mentor-match",
            "GET  /api/mentors",
            "GET  /api/mentors/{id}",
            "GET  /api/mentors/{id}/slots",
            "POST /api/bookings",
            "GET  /api/bookings",
            "GET  /api/bookings/{id}",
            "POST /api/bookings/{id}/cancel",
            "GET  /api/bookings/{id}/calendar.ics",
            "POST /api/bookings/razorpay/create-order",
            "POST /api/bookings/razorpay/verify-payment",
            "POST /api/storage/resumes",
            "GET  /api/storage/resumes",
            "DELETE /api/storage/resumes/{id}",
            "POST /api/progress/roadmap",
            "GET  /api/progress/roadmap/{id}",
            "PATCH /api/progress/tasks/{id}",
            "GET  /api/progress/roadmaps",
            "POST /api/saved-items",
            "DELETE /api/saved-items/{type}/{id}",
            "GET  /api/saved-items",
            "POST /api/history/analyses",
            "GET  /api/history/analyses",
            "GET  /api/students/profile",
            "POST /api/students/onboarding"
        ],
        "documentation": "/docs"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GOOGLE_GEMINI_API_KEY),
        "groq_configured": bool(settings.GROQ_API_KEY)
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
