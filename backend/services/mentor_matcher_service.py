import json
from typing import Dict, Any, List
from services.ai_provider import AIProviderService
from schemas.mentor import (
    MentorMatchRequest,
    MentorMatchData,
    MentorMatchItem
)

# Seeded mentor pool for matching
SEEDED_MENTORS = [
    {
        "id": "mentor-1",
        "name": "Aarav Sharma",
        "role": "Senior Software Engineer",
        "company": "Google",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        "domains": ["Software Engineering", "Cloud & DevOps Architecture"],
        "skills": ["System Design", "React / Next.js", "Go", "Kubernetes", "DSA & LeetCode", "PostgreSQL", "Redis"],
        "fee": 799,
        "slot": "Tomorrow, 6:00 PM"
    },
    {
        "id": "mentor-2",
        "name": "Priya Narayanan",
        "role": "Lead AI & ML Researcher",
        "company": "Microsoft Research",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        "domains": ["Data Science & AI", "Data Analytics & BI"],
        "skills": ["PyTorch", "Large Language Models (LLMs)", "RAG Pipelines", "Vector Databases", "Python"],
        "fee": 999,
        "slot": "Thursday, 7:30 PM"
    },
    {
        "id": "mentor-3",
        "name": "Rohan Mehta",
        "role": "Staff Security Engineer",
        "company": "CrowdStrike",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        "domains": ["Cybersecurity & Infosec"],
        "skills": ["Penetration Testing", "AWS Security", "Network Protocols", "Wireshark", "Burp Suite"],
        "fee": 899,
        "slot": "Saturday, 11:00 AM"
    },
    {
        "id": "mentor-4",
        "name": "Ananya Deshmukh",
        "role": "Senior Product Manager",
        "company": "Flipkart",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
        "domains": ["Product Management", "Data Analytics & BI"],
        "skills": ["Product Sense", "GTM Strategy", "User Research", "A/B Testing Metrics", "PRD Writing", "RICE Scoring"],
        "fee": 849,
        "slot": "Friday, 5:00 PM"
    }
]

class MentorMatcherService:
    @classmethod
    async def match_mentors(cls, req: MentorMatchRequest) -> Dict[str, Any]:
        target_role = req.targetRole
        gaps_str = ", ".join(req.skillGaps) if req.skillGaps else "General interview readiness"
        goal = req.consultationGoal

        mentors_str = json.dumps(SEEDED_MENTORS, indent=2)

        prompt = f"""
You are an intelligent technical talent mentor matcher.
Evaluate a student and rank the most suitable mentors from this pool:
STUDENT PROFILE:
- Target Role: {target_role}
- Identified Skill Gaps: {gaps_str}
- Consultation Goal: {goal}
- Max Budget: ₹{req.budgetMax or 2000}

MENTOR POOL:
\"\"\"
{mentors_str}
\"\"\"

Rank the top 2-3 mentors for this student.
Respond strictly in valid JSON without markdown wrapping matching this schema:
{{
  "targetRole": "{target_role}",
  "consultationGoal": "{goal}",
  "matchedMentors": [
    {{
      "mentorId": "mentor-1",
      "name": "Mentor Name",
      "role": "Current Title",
      "company": "Company",
      "avatarUrl": "URL",
      "matchScore": 95,
      "matchReasons": [
        "Concrete reason 1 relating to student gaps and target role",
        "Concrete reason 2 relating to consultation goal"
      ],
      "recommendedTopic": "Specific agenda topic for their 1-on-1 session",
      "sessionFee": 799,
      "availableSlot": "Slot description"
    }}
  ]
}}
"""

        ai_res = await AIProviderService.execute_prompt(
            prompt=prompt,
            system_instruction="You are an expert career mentor matching engine. Output strictly valid JSON.",
            response_json=True
        )

        if ai_res.get("content"):
            try:
                parsed = json.loads(ai_res["content"])
                data = MentorMatchData.model_validate(parsed)
                return {
                    "data": data,
                    "provider_used": ai_res["provider_used"],
                    "model": ai_res["model"]
                }
            except Exception as e:
                print(f"[MentorMatcherService] Validation warning: {e}")

        # Deterministic Fallback
        is_pm = any(k in target_role.lower() for k in ["product", "apm", "manager"])
        is_security = any(k in target_role.lower() for k in ["security", "cyber", "infosec"])
        is_ai = any(k in target_role.lower() for k in ["data", "ml", "ai"])

        if is_pm:
            primary = SEEDED_MENTORS[3]  # Ananya
            secondary = SEEDED_MENTORS[0] # Aarav
        elif is_security:
            primary = SEEDED_MENTORS[2]  # Rohan
            secondary = SEEDED_MENTORS[0]
        elif is_ai:
            primary = SEEDED_MENTORS[1]  # Priya
            secondary = SEEDED_MENTORS[0]
        else:
            primary = SEEDED_MENTORS[0]  # Aarav
            secondary = SEEDED_MENTORS[1]

        matched = [
            MentorMatchItem(
                mentorId=primary["id"],
                name=primary["name"],
                role=primary["role"],
                company=primary["company"],
                avatarUrl=primary["avatar_url"],
                matchScore=96,
                matchReasons=[
                    f"Direct domain alignment as {primary['role']} at {primary['company']}",
                    f"Specialized guidance tailored to {goal} and bridging your gaps in {gaps_str}"
                ],
                recommendedTopic=f"1-on-1 Technical Roadmap & {goal} Strategy",
                sessionFee=primary["fee"],
                availableSlot=primary["slot"]
            ),
            MentorMatchItem(
                mentorId=secondary["id"],
                name=secondary["name"],
                role=secondary["role"],
                company=secondary["company"],
                avatarUrl=secondary["avatar_url"],
                matchScore=87,
                matchReasons=[
                    f"Strong complementary expertise in modern architecture and systems interview strategy",
                    "Extensive track record guiding university students into top-tier tech placements"
                ],
                recommendedTopic="Cross-Functional Architecture & Portfolio Teardown",
                sessionFee=secondary["fee"],
                availableSlot=secondary["slot"]
            )
        ]

        fallback_data = MentorMatchData(
            targetRole=target_role,
            consultationGoal=goal,
            matchedMentors=matched
        )

        return {
            "data": fallback_data,
            "provider_used": ai_res.get("provider_used", "demo"),
            "model": ai_res.get("model", "calibrated-rules")
        }
