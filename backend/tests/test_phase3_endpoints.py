import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

sys.stdout.reconfigure(line_buffering=True, errors='replace')

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_and_health():
    print("Testing GET / and GET /health...")
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "operational"
    assert len(data["endpoints"]) >= 7
    print(f"  [PASS] Root returned {len(data['endpoints'])} operational endpoints.")

    r2 = client.get("/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "healthy"
    print("  [PASS] Root and Health tests passed.")

def test_parse_resume_text():
    print("\nTesting POST /api/ai/parse-resume (text payload)...")
    sample_resume = """
    Aarav Kumar
    Email: aarav@example.com | GitHub: github.com/aaravkumar

    PROFESSIONAL SUMMARY
    Passionate Backend and Full Stack Software Engineer with expertise in C++, TypeScript, Node.js, and Redis caching. Solved 500+ LeetCode problems.

    EXPERIENCE
    Backend Developer Intern | CloudScale Systems (June 2025 - August 2025)
    - Built high-throughput caching layer with Redis and Node.js microservices.
    - Containerized development workflows using Docker.

    PROJECTS
    Distributed Task Queue Engine
    - Developed an asynchronous job processor using Redis, TypeScript, and PostgreSQL.

    SKILLS
    Languages & Tools: C++, TypeScript, JavaScript, Python, PostgreSQL, Redis, Docker, Git.

    EDUCATION
    B.Tech in Computer Science and Engineering | 2022 - 2026 | GPA: 8.9/10
    """
    
    r = client.post("/api/ai/parse-resume", json={"text": sample_resume})
    assert r.status_code == 200, f"Failed: {r.text}"
    body = r.json()
    assert body["success"] is True
    res_data = body["data"]
    assert "summary" in res_data
    assert len(res_data["skills"]) > 0
    assert len(res_data["recommendedRoles"]) > 0
    print(f"  [PASS] Resume parsed successfully. Recommended role: {res_data['recommendedRoles'][0]['title']} (Provider: {body['providerUsed']})")

def test_career_recommendations():
    print("\nTesting POST /api/ai/career-recommendations...")
    payload = {
        "skills": ["C++", "TypeScript", "Node.js", "Redis", "Docker", "PostgreSQL"],
        "summary": "Full stack and backend engineering student with competitive programming background",
        "degree": "B.Tech",
        "branch": "Computer Science",
        "targetGoal": "full_time_placement",
        "preferredDomains": ["Software Engineering", "Cloud & DevOps"]
    }
    r = client.post("/api/ai/career-recommendations", json=payload)
    assert r.status_code == 200, f"Failed: {r.text}"
    body = r.json()
    assert body["success"] is True
    recs = body["data"]["recommendations"]
    assert len(recs) >= 3
    print(f"  [PASS] Career recommendations generated ({len(recs)} domains). Top match: {recs[0]['matchedRole']} ({recs[0]['suitabilityScore']}%)")

def test_job_profiles():
    print("\nTesting POST /api/ai/job-profiles...")
    payload = {
        "domain": "software_engineering",
        "skills": ["TypeScript", "Node.js", "PostgreSQL", "React"],
        "degree": "B.Tech",
        "branch": "Computer Science"
    }
    r = client.post("/api/ai/job-profiles", json=payload)
    assert r.status_code == 200, f"Failed: {r.text}"
    body = r.json()
    assert body["success"] is True
    profiles = body["data"]["profiles"]
    assert len(profiles) > 0
    print(f"  [PASS] Job profiles retrieved ({len(profiles)} roles). Primary: {profiles[0]['title']}")

def test_roadmap_generator():
    print("\nTesting POST /api/ai/roadmap...")
    payload = {
        "roleTitle": "Full Stack Software Engineer",
        "hoursPerWeek": 15,
        "graduationYear": "2026",
        "existingSkills": ["React", "JavaScript", "SQL"]
    }
    r = client.post("/api/ai/roadmap", json=payload)
    assert r.status_code == 200, f"Failed: {r.text}"
    body = r.json()
    assert body["success"] is True
    data = body["data"]
    assert len(data["tasks"]) == 5
    assert data["capstoneProject"]["title"] != ""
    print(f"  [PASS] Roadmap generated with {len(data['tasks'])} milestone tasks and Capstone: '{data['capstoneProject']['title']}'")

def test_follow_up_questions_and_refine():
    print("\nTesting POST /api/ai/follow-up and /refine...")
    r_q = client.post("/api/ai/follow-up", json={
        "role": "Full Stack Software Engineer",
        "skills": ["TypeScript", "Node.js", "Redis"],
        "summary": "Engineering student targeting top tier placement"
    })
    assert r_q.status_code == 200, f"Failed: {r_q.text}"
    q_body = r_q.json()
    assert q_body["success"] is True
    questions = q_body["data"]["questions"]
    assert len(questions) >= 3
    print(f"  [PASS] Generated {len(questions)} role-specific follow-up questions.")

    # Refine test
    r_refine = client.post("/api/ai/follow-up/refine", json={
        "originalRole": "Full Stack Software Engineer",
        "skills": ["TypeScript", "Node.js", "Redis"],
        "answers": {
            questions[0]["id"]: questions[0]["options"][0] if questions[0]["options"] else "Scale architecture"
        }
    })
    assert r_refine.status_code == 200, f"Failed: {r_refine.text}"
    refine_body = r_refine.json()
    assert refine_body["success"] is True
    print(f"  [PASS] Career refined: {refine_body['data']['refinedRole']} with {refine_body['data']['calibratedMatch']}% calibrated match.")

def test_mentor_match():
    print("\nTesting POST /api/ai/mentor-match...")
    payload = {
        "targetRole": "Backend Software Engineer",
        "skillGaps": ["System Design", "Cloud Observability"],
        "consultationGoal": "Technical Mock Interview & Resume Critique",
        "budgetMax": 1500
    }
    r = client.post("/api/ai/mentor-match", json=payload)
    assert r.status_code == 200, f"Failed: {r.text}"
    body = r.json()
    assert body["success"] is True
    mentors = body["data"]["matchedMentors"]
    assert len(mentors) >= 2
    print(f"  [PASS] Matched {len(mentors)} mentors. Top mentor: {mentors[0]['name']} ({mentors[0]['role']} at {mentors[0]['company']})")

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING PATHPILOT PHASE 3 PYTHON BACKEND TEST SUITE")
    print("=" * 60)
    test_root_and_health()
    test_parse_resume_text()
    test_career_recommendations()
    test_job_profiles()
    test_roadmap_generator()
    test_follow_up_questions_and_refine()
    test_mentor_match()
    print("\n" + "=" * 60)
    print("ALL PHASE 3 BACKEND TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)
