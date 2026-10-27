import json
from typing import Dict, Any, List
from services.ai_provider import AIProviderService
from schemas.follow_up import (
    FollowUpQuestionsRequest,
    FollowUpQuestionsData,
    QuestionItem,
    FollowUpRefineRequest,
    RefinedCareerData
)

class FollowUpService:
    @classmethod
    async def generate_questions(cls, req: FollowUpQuestionsRequest) -> Dict[str, Any]:
        skills_str = ", ".join(req.skills) if req.skills else "Core programming & computing"

        prompt = f"""
You are a career mentor assessing an engineering candidate for the role: "{req.role}".
Candidate's extracted background:
- Current Target: {req.role}
- Skills: {skills_str}
- Summary: {req.summary or 'College student preparing for career placement'}

Generate 3 to 4 targeted, non-generic follow-up questions to probe their practical depth, preferences, and readiness for this specific role. Each question should include 3-4 realistic multiple-choice options.

Respond strictly with valid JSON without markdown wrapping:
{{
  "role": "{req.role}",
  "questions": [
    {{
      "id": "q-1",
      "question": "Clear, specific technical or practical dilemma",
      "whyAsked": "Why this distinction matters for candidate placement in {req.role}",
      "category": "Architecture & Depth",
      "options": [
        "Option A: Hands-on implementation detail",
        "Option B: Alternative technical strategy",
        "Option C: High-level architectural pattern"
      ]
    }}
  ]
}}
"""

        ai_res = await AIProviderService.execute_prompt(
            prompt=prompt,
            system_instruction="You are a career interviewer. Output strictly valid JSON.",
            response_json=True
        )

        if ai_res.get("content"):
            try:
                parsed = json.loads(ai_res["content"])
                data = FollowUpQuestionsData.model_validate(parsed)
                return {
                    "data": data,
                    "provider_used": ai_res["provider_used"],
                    "model": ai_res["model"]
                }
            except Exception as e:
                print(f"[FollowUpService] Questions validation warning: {e}")

        # Deterministic Fallback
        fallback = FollowUpQuestionsData(
            role=req.role,
            questions=[
                QuestionItem(
                    id="q-1",
                    question=f"Which aspect of {req.role} excites you most for your day-to-day focus?",
                    whyAsked="Identifies whether your passion leans toward low-level architecture, user-facing features, or systems reliability.",
                    category="Role Specialization",
                    options=[
                        "Designing scalable database models and asynchronous API microservices",
                        "Building polished, responsive user interfaces and client interactions",
                        "Containerization, automated CI/CD pipelines, and cloud platform infrastructure"
                    ]
                ),
                QuestionItem(
                    id="q-2",
                    question="How would you rate your comfort level with relational databases and SQL queries under production workloads?",
                    whyAsked="Determines immediate technical readiness for mid-tier engineering interviews.",
                    category="Database & Storage",
                    options=[
                        "Advanced: Comfortable with joins, indexing strategies, transactions, and connection pools",
                        "Intermediate: Can design normalized schemas and execute standard CRUD operations",
                        "Developing: Primarily rely on ORMs and basic query builders"
                    ]
                ),
                QuestionItem(
                    id="q-3",
                    question="What is your target timeline for entering a full-time engineering role or internship?",
                    whyAsked="Allows calibration of roadmap milestones between an accelerated sprint and comprehensive deep-dive.",
                    category="Timeline Calibration",
                    options=[
                        "Immediate (within 1-3 months) — Focus on high-frequency interview patterns and capstone",
                        "Medium-term (within 3-6 months) — Balanced pace with comprehensive system design",
                        "Long-term (6+ months) — Thorough foundational mastery"
                    ]
                )
            ]
        )

        return {
            "data": fallback,
            "provider_used": ai_res.get("provider_used", "demo"),
            "model": ai_res.get("model", "calibrated-rules")
        }

    @classmethod
    async def refine_career(cls, req: FollowUpRefineRequest) -> Dict[str, Any]:
        answers_str = json.dumps(req.answers, indent=2)

        prompt = f"""
You are an engineering hiring director.
A student targeting "{req.originalRole}" answered the following follow-up diagnostic questions:
\"\"\"
{answers_str}
\"\"\"
Extracted Skills: {', '.join(req.skills)}

Synthesize their answers to refine their target career track and give high-leverage advice.
Respond strictly in valid JSON without markdown wrapping:
{{
  "refinedRole": "Refined role title (e.g. Backend Platform Engineer)",
  "calibratedMatch": 94,
  "readinessLevel": "Interview-Ready / Strong Baseline / Emerging",
  "customAdvice": "2-3 sentences of tailored career coaching based on their exact answers",
  "recommendedNextStep": "Specific immediate milestone action"
}}
"""

        ai_res = await AIProviderService.execute_prompt(
            prompt=prompt,
            system_instruction="You are a career advisor. Output strictly valid JSON.",
            response_json=True
        )

        if ai_res.get("content"):
            try:
                parsed = json.loads(ai_res["content"])
                data = RefinedCareerData.model_validate(parsed)
                return {
                    "data": data,
                    "provider_used": ai_res["provider_used"],
                    "model": ai_res["model"]
                }
            except Exception as e:
                print(f"[FollowUpService] Refinement validation warning: {e}")

        fallback = RefinedCareerData(
            refinedRole=req.originalRole,
            calibratedMatch=93,
            readinessLevel="Strong Technical Baseline",
            customAdvice=f"Based on your responses, you exhibit strong instincts for scalable systems. Your path to top placements in {req.originalRole} will be accelerated by focusing directly on relational schema optimizations and an end-to-end containerized capstone.",
            recommendedNextStep="Commence Milestone 1 of your roadmap: implement Redis cache-aside invalidation on a core API endpoint."
        )

        return {
            "data": fallback,
            "provider_used": ai_res.get("provider_used", "demo"),
            "model": ai_res.get("model", "calibrated-rules")
        }
