import json
from typing import Dict, Any, List
from services.ai_provider import AIProviderService
from schemas.roadmap import (
    RoadmapRequest,
    RoadmapData,
    MilestoneTask,
    CapstoneProject
)

class RoadmapService:
    @classmethod
    async def generate_roadmap(cls, req: RoadmapRequest) -> Dict[str, Any]:
        role_title = req.roleTitle
        hours_per_week = req.hoursPerWeek
        graduation_year = req.graduationYear
        skills_context = (
            f"The student already has some foundational familiarity with: {', '.join(req.existingSkills)}. "
            "Accelerate past introductory basics and focus on high-leverage industry practices."
            if req.existingSkills else "Calibrate from first principles to industry-ready capstone."
        )

        prompt = f"""
You are an engineering hiring director & tech career mentor designing an elite, production-grade technical roadmap for a college student targeting: "{role_title}".
Weekly dedication: {hours_per_week} hours/week.
Target graduation / placement batch: {graduation_year}.
Context: {skills_context}

Create a realistic 5-milestone roadmap taking them from core fundamentals to a portfolio-grade capstone project ready for technical interviews.

Respond strictly with valid JSON without markdown wrapping:
{{
  "role": "{role_title}",
  "estimatedWeeks": 8,
  "difficulty": "Intermediate",
  "prerequisites": ["Basic Programming Logic", "Git & GitHub"],
  "tasks": [
    {{
      "id": "task-1",
      "phase": "Phase 1: Foundations & Core Architecture",
      "title": "Clear milestone title",
      "desc": "Detailed explanation of industry best practices, patterns, and what to study",
      "deliverable": "Specific tangible hands-on artifact to build (e.g., benchmark report, minimal proof-of-concept)",
      "hours": {int(round(hours_per_week * 0.8))},
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "resources": ["Official Documentation", "Recommended Open Source Reference"]
    }},
    {{
      "id": "task-2",
      "phase": "Phase 1: Foundations & Core Architecture",
      "title": "Clear milestone title",
      "desc": "Detailed explanation of industry best practices, patterns, and what to study",
      "deliverable": "Specific tangible hands-on artifact to build",
      "hours": {hours_per_week},
      "skills": ["Skill 4", "Skill 5"],
      "resources": ["Architecture Patterns Guide", "Interactive Sandbox"]
    }},
    {{
      "id": "task-3",
      "phase": "Phase 2: Deep Dive & Systems Integration",
      "title": "Clear milestone title",
      "desc": "Detailed explanation of complex real-world mechanics (databases, APIs, telemetry)",
      "deliverable": "Integrated sub-module with test coverage",
      "hours": {int(round(hours_per_week * 1.1))},
      "skills": ["Skill 6", "Skill 7"],
      "resources": ["Production Best Practices Repo", "Performance Profiling Docs"]
    }},
    {{
      "id": "task-4",
      "phase": "Phase 2: Deep Dive & Systems Integration",
      "title": "Clear milestone title",
      "desc": "Scalability, security, CI/CD, or cross-functional execution details",
      "deliverable": "Automated deployment pipeline or telemetry dashboard",
      "hours": {int(round(hours_per_week * 1.2))},
      "skills": ["Skill 8", "Skill 9"],
      "resources": ["Security Standards Checklist", "CI/CD Pipeline Template"]
    }},
    {{
      "id": "task-5",
      "phase": "Phase 3: Production Capstone & Interview Portfolio",
      "title": "Production Capstone Project",
      "desc": "End-to-end deployed portfolio application demonstrating enterprise readiness",
      "deliverable": "Public GitHub repository with comprehensive README, live deployed URL, and architecture diagram",
      "hours": {int(round(hours_per_week * 1.6))},
      "skills": ["End-to-End Architecture", "Production Deployment", "Portfolio Presentation"],
      "resources": ["System Design Primer", "Portfolio Case Study Template"]
    }}
  ],
  "capstoneProject": {{
    "title": "Flagship Portfolio Capstone for {role_title}",
    "description": "Comprehensive project that proves competency to senior engineering interviewers.",
    "deliverables": [
      "Live deployed application with custom domain or cloud URL",
      "Modular clean code with automated test coverage",
      "Technical writeup detailing architecture decisions and performance tradeoffs"
    ],
    "recommendedStack": ["Modern Web/Backend Stack", "PostgreSQL / Supabase", "Docker / Cloud Platform"]
  }}
}}
"""

        ai_res = await AIProviderService.execute_prompt(
            prompt=prompt,
            system_instruction="You are an elite technical mentor designing syllabus roadmaps. Always respond strictly in valid JSON.",
            response_json=True
        )

        if ai_res.get("content"):
            try:
                parsed = json.loads(ai_res["content"])
                data = RoadmapData.model_validate(parsed)
                return {
                    "data": data,
                    "provider_used": ai_res["provider_used"],
                    "model": ai_res["model"]
                }
            except Exception as e:
                print(f"[RoadmapService] Validation warning: {e}")

        # Deterministic Fallback
        is_product = any(k in role_title.lower() for k in ["product", "apm", "manager"])
        if is_product:
            tasks = [
                MilestoneTask(
                    id="task-1",
                    phase="Phase 1: Foundations & Discovery",
                    title="Customer Discovery & Problem Framing",
                    desc="Conduct 10+ structured user discovery interviews, identify core user frictions, and map user journey drop-offs.",
                    deliverable="Customer Discovery Synthesis Deck with categorized user personas and problem validation matrix.",
                    hours=14,
                    skills=["User Research", "Customer Discovery", "Persona Mapping"],
                    resources=["The Mom Test Guide", "Qualitative Synthesis Frameworks"]
                ),
                MilestoneTask(
                    id="task-2",
                    phase="Phase 1: Foundations & Discovery",
                    title="High-Fidelity PRD Specs & RICE Prioritization",
                    desc="Draft comprehensive Product Requirement Documents with edge-case handling, acceptance criteria, and RICE scoring.",
                    deliverable="Complete PRD specification with user stories and engineering acceptance criteria.",
                    hours=16,
                    skills=["PRD Writing", "RICE Scoring", "Acceptance Criteria"],
                    resources=["Modern PRD Templates", "Feature Prioritization Matrix"]
                ),
                MilestoneTask(
                    id="task-3",
                    phase="Phase 2: Quantitative Telemetry & Execution",
                    title="Product Metrics & Analytics (SQL + Mixpanel)",
                    desc="Define north-star metrics, build funnel conversion dashboards, and analyze cohort retention with SQL queries.",
                    deliverable="Interactive telemetry dashboard tracking core user funnels and milestone activations.",
                    hours=18,
                    skills=["Product Analytics", "SQL Telemetry", "Funnel Optimization"],
                    resources=["SQL for Product Managers", "Cohort Analysis Blueprint"]
                ),
                MilestoneTask(
                    id="task-4",
                    phase="Phase 2: Quantitative Telemetry & Execution",
                    title="GTM Strategy & Agile Sprint Synchronization",
                    desc="Coordinate sprint planning with engineering teams, refine backlogs, and write public product launch changelogs.",
                    deliverable="Sprint Backlog Board and GTM Launch Communication Playbook.",
                    hours=18,
                    skills=["Sprint Planning", "GTM Launch", "Jira / Linear"],
                    resources=["GTM Strategy Checklist", "Agile Product Management Handbook"]
                ),
                MilestoneTask(
                    id="task-5",
                    phase="Phase 3: Capstone Product Teardown",
                    title="Capstone: End-to-End AI Product Teardown & Interactive Prototype",
                    desc="Publish an in-depth product teardown and prototype with user traction data and executive pitch deck.",
                    deliverable="Live interactive product prototype and executive strategy case study.",
                    hours=24,
                    skills=["Product Teardown", "Executive Pitch", "Product Portfolio"],
                    resources=["Lenny’s Product Case Studies", "Executive Presentation Deck Guide"]
                )
            ]
            capstone = CapstoneProject(
                title=f"Flagship Product Teardown & Prototype for {role_title}",
                description="Comprehensive product strategy artifact demonstrating end-to-end product leadership.",
                deliverables=[
                    "Interactive Figma or live web prototype demonstrating core feature flow",
                    "High-fidelity PRD with quantifiable business metrics and rollout schedule",
                    "Executive presentation slide deck prepared for hiring panel review"
                ],
                recommendedStack=["Figma", "Mixpanel / PostHog", "Next.js", "SQL"]
            )
        else:
            tasks = [
                MilestoneTask(
                    id="task-1",
                    phase="Phase 1: Foundations & Architecture",
                    title="Core Domain Fundamentals & Best Practices",
                    desc=f"Master modern idioms, design patterns, and industry toolchains essential for {role_title}.",
                    deliverable="Configured development environment, linting rules, and foundational reference repo.",
                    hours=12,
                    skills=["Domain Fundamentals", "Clean Architecture", "Version Control"],
                    resources=["Official Language Documentation", "Design Patterns Handbook"]
                ),
                MilestoneTask(
                    id="task-2",
                    phase="Phase 1: Foundations & Architecture",
                    title="System Design & State Flow Management",
                    desc="Architect scalable data flows, robust error-handling patterns, and high-concurrency protocols.",
                    deliverable="Functional micro-module adhering to strict separation of concerns.",
                    hours=16,
                    skills=["State Design", "Error Handling", "Modular Systems"],
                    resources=["System Design Primer", "Pattern Sandbox"]
                ),
                MilestoneTask(
                    id="task-3",
                    phase="Phase 2: Deep Implementation & Telemetry",
                    title="Relational Database Schema & API Contracts",
                    desc="Design normalized schemas with PostgreSQL/Supabase, define strictly typed API endpoints, and establish Row Level Security.",
                    deliverable="Tested database migration scripts with verified API contract tests.",
                    hours=18,
                    skills=["PostgreSQL", "API Contract Design", "Row Level Security"],
                    resources=["PostgreSQL Schema Best Practices", "REST API Contract Standards"]
                ),
                MilestoneTask(
                    id="task-4",
                    phase="Phase 2: Deep Implementation & Telemetry",
                    title="Production Observability & Automated CI/CD",
                    desc="Implement structured telemetry, automated GitHub Actions test pipelines, and containerization with Docker.",
                    deliverable="Green CI/CD deployment pipeline with automated preview environments.",
                    hours=20,
                    skills=["Docker", "GitHub Actions", "Telemetry & Logging"],
                    resources=["Docker Multi-stage Builds", "CI/CD Workflow Blueprints"]
                ),
                MilestoneTask(
                    id="task-5",
                    phase="Phase 3: Production Capstone & Interview Portfolio",
                    title="Capstone: End-to-End Flagship Application",
                    desc=f"Build and launch a production-ready application showcasing verified expertise in {role_title}.",
                    deliverable="Live web deployment with verified metrics, comprehensive README, and architecture teardown.",
                    hours=28,
                    skills=["Production Deployment", "Portfolio Architecture", "Interview Storytelling"],
                    resources=["System Architecture Case Studies", "Tech Portfolio Checklist"]
                )
            ]
            capstone = CapstoneProject(
                title=f"Production Portfolio Capstone for {role_title}",
                description="Comprehensive, deployable application that demonstrates end-to-end technical maturity.",
                deliverables=[
                    "Live deployed URL accessible to recruiters and hiring managers",
                    "Production test suite with unit and integration tests",
                    "Comprehensive architectural README with tradeoffs analysis and system diagram"
                ],
                recommendedStack=["TypeScript / Next.js", "Python / FastAPI", "PostgreSQL / Supabase", "Docker"]
            )

        fallback_data = RoadmapData(
            role=role_title,
            estimatedWeeks=8,
            difficulty="Intermediate",
            prerequisites=["Foundational Computer Science Concepts", "Modern Git Workflow"],
            tasks=tasks,
            capstoneProject=capstone
        )

        return {
            "data": fallback_data,
            "provider_used": ai_res.get("provider_used", "demo"),
            "model": ai_res.get("model", "calibrated-rules")
        }
