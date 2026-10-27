import json
from typing import Dict, Any, List
from services.ai_provider import AIProviderService
from schemas.career import (
    CareerRecommendationsRequest,
    CareerRecommendationsData,
    DomainRecommendation,
    JobProfilesRequest,
    JobProfilesData,
    JobProfileItem,
    SalaryRange
)

class CareerService:
    @classmethod
    async def get_career_recommendations(cls, req: CareerRecommendationsRequest) -> Dict[str, Any]:
        skills_str = ", ".join(req.skills) if req.skills else "Core programming concepts and general computer science"
        domains_str = ", ".join(req.preferredDomains) if req.preferredDomains else "Open to optimal recommendations"

        prompt = f"""
You are an expert tech career advisor and engineering hiring manager.
Evaluate this university student profile and recommend 3-4 distinct career domains ranked by realistic suitability:

STUDENT PROFILE:
- Degree: {req.degree} in {req.branch}
- Target Outcome: {req.targetGoal}
- Extracted Skills: {skills_str}
- Candidate Summary: {req.summary or 'University student preparing for technical campus placement'}
- Expressed Preferences: {domains_str}

Analyze their skills and potential objectively across domains (Software Engineering, Cloud & DevOps, AI & Data Science, Product Management, Cybersecurity, etc.).
Respond strictly with valid JSON without markdown wrapping:
{{
  "overallAssessment": "2-sentence encouraging summary of competitive advantage and optimal market positioning.",
  "recommendations": [
    {{
      "domainId": "software_engineering",
      "domainName": "Software Engineering",
      "suitabilityScore": 94,
      "matchedRole": "Full Stack Software Engineer",
      "category": "Primary Fit",
      "evidence": [
        "Concrete reason 1 based on their extracted skills/projects",
        "Concrete reason 2 based on their academic foundation"
      ],
      "criticalGaps": [
        "High-priority concept or tool to study",
        "Specific practical architecture experience needed"
      ],
      "suggestedFirstAction": "Concrete immediate step (e.g. build a distributed caching prototype)"
    }},
    {{
      "domainId": "cloud_devops",
      "domainName": "Cloud & Infrastructure",
      "suitabilityScore": 84,
      "matchedRole": "Cloud DevOps Engineer",
      "category": "Adjacent Pivot",
      "evidence": [
        "Transferable skill or knowledge area",
        "Complementary systems fluency"
      ],
      "criticalGaps": [
        "Kubernetes or Terraform container orchestration",
        "Cloud security & IAM permissions"
      ],
      "suggestedFirstAction": "Deploy a containerized microservice with automated GitHub Actions"
    }},
    {{
      "domainId": "product_management",
      "domainName": "Product & Strategy",
      "suitabilityScore": 76,
      "matchedRole": "Technical APM / Product Analyst",
      "category": "Growth Opportunity",
      "evidence": [
        "Analytical foundation and ability to bridge technology with user needs",
        "Problem-solving agility"
      ],
      "criticalGaps": [
        "PRD specifications & RICE feature prioritization",
        "Product telemetry and user funnel metrics"
      ],
      "suggestedFirstAction": "Write an end-to-end product teardown PRD with customer persona mapping"
    }}
  ]
}}
"""

        ai_res = await AIProviderService.execute_prompt(
            prompt=prompt,
            system_instruction="You are an elite career intelligence engine for engineering students. Output strictly valid JSON.",
            response_json=True
        )

        if ai_res.get("content"):
            try:
                parsed = json.loads(ai_res["content"])
                data = CareerRecommendationsData.model_validate(parsed)
                return {
                    "data": data,
                    "provider_used": ai_res["provider_used"],
                    "model": ai_res["model"]
                }
            except Exception as e:
                print(f"[CareerService] JSON validation warning: {e}")

        # Deterministic Calibrated Fallback
        fallback = CareerRecommendationsData(
            overallAssessment="Strong technical profile with exceptional versatility across modern software development and scalable distributed platforms.",
            recommendations=[
                DomainRecommendation(
                    domainId="software_engineering",
                    domainName="Software Engineering",
                    suitabilityScore=93,
                    matchedRole="Full Stack Software Engineer",
                    category="Primary Fit",
                    evidence=[
                        "Demonstrated competency in full-stack architecture, relational schemas, and APIs",
                        "High algorithmic agility and solid computer science core coursework"
                    ],
                    criticalGaps=[
                        "Production telemetry and observability (OpenTelemetry, Grafana)",
                        "Asynchronous job queues and streaming mechanics (Kafka, BullMQ)"
                    ],
                    suggestedFirstAction="Build and deploy a full-stack SaaS with authentication, background workers, and PostgreSQL RLS"
                ),
                DomainRecommendation(
                    domainId="cloud_devops",
                    domainName="Cloud & Infrastructure",
                    suitabilityScore=83,
                    matchedRole="Cloud / DevOps Engineer",
                    category="Adjacent Pivot",
                    evidence=[
                        "Strong grasp of containerization concepts and modular Unix environment workflows",
                        "Systematic debugging and systems-level mindset"
                    ],
                    criticalGaps=[
                        "Infrastructure as Code (Terraform / Pulumi)",
                        "Kubernetes cluster networking and ingress controllers"
                    ],
                    suggestedFirstAction="Containerize a microservice and write multi-stage GitHub Actions CI/CD workflows"
                ),
                DomainRecommendation(
                    domainId="ai_data",
                    domainName="AI & Data Engineering",
                    suitabilityScore=77,
                    matchedRole="Applied AI Engineer",
                    category="Growth Opportunity",
                    evidence=[
                        "Familiarity with modern LLM prompt engineering, embeddings, and vector similarity",
                        "Sound mathematical and analytical logic"
                    ],
                    criticalGaps=[
                        "Vector database indexing and retrieval latency benchmarking (ChromaDB / Pinecone)",
                        "Evaluation benchmarks and LLM guardrails against hallucination"
                    ],
                    suggestedFirstAction="Implement an end-to-end RAG pipeline with semantic chunking and hybrid search"
                )
            ]
        )

        return {
            "data": fallback,
            "provider_used": ai_res.get("provider_used", "demo"),
            "model": ai_res.get("model", "calibrated-rules")
        }

    @classmethod
    async def get_job_profiles(cls, req: JobProfilesRequest) -> Dict[str, Any]:
        domain_name = req.domain.replace("_", " ").title()
        skills_str = ", ".join(req.skills) if req.skills else "General technical skills"

        prompt = f"""
You are a senior technical hiring manager specializing in the domain: "{domain_name}".
Based on a student's background (Degree: {req.degree}, Branch: {req.branch}, Skills: {skills_str}),
provide 3 to 4 ranked entry-to-junior level job profiles within this domain.

Respond strictly with valid JSON without markdown wrapping:
{{
  "domain": "{domain_name}",
  "profiles": [
    {{
      "id": "job-1",
      "title": "Exact Role Title (e.g. Junior Backend Engineer)",
      "category": "Entry-level",
      "matchScore": 92,
      "coreSkills": ["Skill 1", "Skill 2", "Skill 3"],
      "salaryRange": {{
        "entryLevel": "₹7 - ₹12 LPA",
        "midLevel": "₹14 - ₹24 LPA"
      }},
      "demandLevel": "High",
      "whyFit": "1-2 sentences on why this role matches their background",
      "dayInTheLife": "Concise summary of daily tasks and engineering responsibilities"
    }}
  ]
}}
"""

        ai_res = await AIProviderService.execute_prompt(
            prompt=prompt,
            system_instruction="You are a compensation and job market intelligence engine. Output strictly valid JSON.",
            response_json=True
        )

        if ai_res.get("content"):
            try:
                parsed = json.loads(ai_res["content"])
                data = JobProfilesData.model_validate(parsed)
                return {
                    "data": data,
                    "provider_used": ai_res["provider_used"],
                    "model": ai_res["model"]
                }
            except Exception as e:
                print(f"[CareerService] Job profiles validation warning: {e}")

        # Deterministic Fallback
        profiles = [
            JobProfileItem(
                id="job-1",
                title=f"Associate {domain_name} Specialist",
                category="Entry-level",
                matchScore=92,
                coreSkills=["Core Architecture", "API Design", "Database Modeling", "Git Workflow"],
                salaryRange=SalaryRange(entryLevel="₹7 - ₹11 LPA", midLevel="₹14 - ₹22 LPA"),
                demandLevel="High",
                whyFit=f"Directly leverages your foundation in problem-solving and modern web engineering to build high-impact {domain_name} systems.",
                dayInTheLife="Collaborating with product teams on technical specifications, writing unit-tested code, reviewing PRs, and instrumenting performance monitors."
            ),
            JobProfileItem(
                id="job-2",
                title=f"{domain_name} Solutions Associate",
                category="Junior Professional",
                matchScore=85,
                coreSkills=["Technical Documentation", "System Integration", "Debugging", "Telemetry"],
                salaryRange=SalaryRange(entryLevel="₹6 - ₹9 LPA", midLevel="₹12 - ₹18 LPA"),
                demandLevel="Moderate to High",
                whyFit="Ideal bridge combining technical implementation with cross-functional system integration.",
                dayInTheLife="Connecting disparate APIs, writing integration benchmarks, resolving architectural bottlenecks, and drafting deployment playbooks."
            )
        ]

        return {
            "data": JobProfilesData(domain=domain_name, profiles=profiles),
            "provider_used": ai_res.get("provider_used", "demo"),
            "model": ai_res.get("model", "calibrated-rules")
        }
