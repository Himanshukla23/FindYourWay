"""
AI Resume-to-Job Fit Score & Intelligence Engine (Architecture Spec 2.0)
Calculates skill overlap, detects missing critical skills, and provides tailoring advice.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from services.ai_provider import AIProviderService
from schemas.job_schemas import JobMatchResult, JobResponse

logger = logging.getLogger("job_match_service")
logger.setLevel(logging.INFO)

class JobMatchService:
    @classmethod
    def calculate_heuristic_fit(
        cls,
        job: JobResponse,
        student_skills: List[str],
        resume_text: str = ""
    ) -> JobMatchResult:
        """
        Sub-millisecond heuristic matcher used as instant baseline or offline fallback.
        """
        job_skills = set(s.strip().lower() for s in job.skills)
        user_skills_set = set(s.strip().lower() for s in student_skills)

        # Also search for job skills in resume_text
        lower_resume = resume_text.lower() if resume_text else ""
        for s in job_skills:
            if s in lower_resume:
                user_skills_set.add(s)

        matched = list(job_skills.intersection(user_skills_set))
        missing = list(job_skills.difference(user_skills_set))

        # Base score calculation
        if len(job_skills) > 0:
            score = int((len(matched) / len(job_skills)) * 80) + 15
        else:
            score = 70

        # Title alignment bonus
        if any(tok in lower_resume for tok in job.title.lower().split() if len(tok) > 3):
            score += 10

        score = max(25, min(95, score))

        if score >= 75:
            rec = "High Fit"
        elif score >= 50:
            rec = "Moderate Fit"
        else:
            rec = "Reach Role"

        strengths = [
            f"Strong overlap in core skills: {', '.join(matched[:3])}" if matched else "Relevant engineering foundation",
            f"Experience aligned with {job.role_category} track"
        ]

        tailoring_tips = [
            f"Highlight real-world projects featuring {missing[0]}" if missing else "Include measurable business metrics (e.g. % speedup, user scale)",
            f"Emphasize experience relevant to {job.company}'s product domain"
        ]

        return JobMatchResult(
            job_id=job.id,
            job_title=job.title,
            company=job.company,
            match_score=score,
            matching_skills=matched,
            missing_skills=missing,
            strengths=strengths,
            tailoring_tips=tailoring_tips,
            recommendation_level=rec
        )

    @classmethod
    async def match_resume_to_job(
        cls,
        job: JobResponse,
        resume_text: Optional[str] = None,
        student_skills: Optional[List[str]] = None
    ) -> JobMatchResult:
        """
        Deep AI analysis using Gemini / Groq with deterministic heuristic failover.
        """
        skills = student_skills or []
        text = (resume_text or "").strip()

        # Instant fallback if no resume context provided
        if not text and not skills:
            return cls.calculate_heuristic_fit(job, ["Problem Solving", "Git"])

        prompt = f"""
Analyze the candidate's resume and skill profile against this specific job opening.

JOB OPENING:
- Title: {job.title}
- Company: {job.company}
- Role Track: {job.role_category}
- Experience: {job.exp_min}-{job.exp_max} years
- Required Skills: {', '.join(job.skills)}
- Job Description Summary: {job.jd_summary or job.title}

CANDIDATE PROFILE:
- Extracted Skills: {', '.join(skills)}
- Resume Snippet / Bio: {text[:2000]}

Respond with a strictly formatted JSON object matching this schema:
{{
  "match_score": <integer from 20 to 98>,
  "matching_skills": ["<skill1>", "<skill2>"],
  "missing_skills": ["<skill1>", "<skill2>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "tailoring_tips": ["<concrete actionable resume bullet advice 1>", "<advice 2>"],
  "recommendation_level": "High Fit" | "Moderate Fit" | "Reach Role"
}}
"""
        try:
            import asyncio
            ai_res = await asyncio.wait_for(
                AIProviderService.execute_prompt(
                    prompt=prompt,
                    system_instruction="You are an expert technical recruiter and resume analyst. Respond strictly in JSON.",
                    response_json=True
                ),
                timeout=2.0
            )
            raw_content = ai_res.get("content", "{}")
            parsed = json.loads(raw_content)

            score = int(parsed.get("match_score", 70))
            score = max(10, min(99, score))

            rec = parsed.get("recommendation_level", "Moderate Fit")
            if rec not in ["High Fit", "Moderate Fit", "Reach Role"]:
                rec = "High Fit" if score >= 75 else ("Moderate Fit" if score >= 50 else "Reach Role")

            return JobMatchResult(
                job_id=job.id,
                job_title=job.title,
                company=job.company,
                match_score=score,
                matching_skills=parsed.get("matching_skills", job.skills[:2]),
                missing_skills=parsed.get("missing_skills", []),
                strengths=parsed.get("strengths", ["Solid technical foundation"]),
                tailoring_tips=parsed.get("tailoring_tips", ["Add quantified impact to previous projects"]),
                recommendation_level=rec
            )
        except Exception as e:
            logger.info(f"AI Match failed, using heuristic engine: {e}")
            return cls.calculate_heuristic_fit(job, skills, text)
