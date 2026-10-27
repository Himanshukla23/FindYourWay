from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from schemas.marketplace import MentorProfileSchema, SlotItem

# ─── 24 Curated Industry Mentors Across All Career Domains ────────────

SEEDED_MENTOR_CATALOG: List[Dict[str, Any]] = [
    # ── Featured Mentor: Himanshu ─────────────────────────────────────
    {
        "id": "mentor-himanshu",
        "full_name": "Himanshu",
        "title": "Lead Software Engineer & Career Mentor",
        "organisation": "PathPilot Engineering",
        "email": "shuklaiit23@gmail.com",
        "bio": "Specializing in full-stack architecture, distributed backend services, and interview preparation. Dedicated to guiding students and engineers toward top-tier tech roles.",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        "years_experience": 6,
        "domains": ["Software Engineering", "Cloud & DevOps Architecture"],
        "skills": ["System Design", "Python", "React", "Next.js", "FastAPI", "PostgreSQL"],
        "mentoring_topics": ["Resume Review & Project Critique", "System Design Fundamentals", "Mock Technical Interview", "Full-Stack Career Roadmap"],
        "session_price_inr": 499,
        "rating": 5.0,
        "review_count": 42,
        "is_verified": True,
        "is_demo_profile": False,
        "is_available": True
    },
    # ── 1. Software Engineering ──────────────────────────────────────
    {
        "id": "mentor-1",
        "full_name": "Aarav Sharma",
        "title": "Senior Software Engineer",
        "organisation": "Google",
        "bio": "7+ years architecting large-scale distributed systems and high-throughput microservices. Passionate about helping university students master system design, LeetCode patterns, and crack tier-1 product companies.",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        "years_experience": 7,
        "domains": ["Software Engineering", "Cloud & DevOps Architecture"],
        "skills": ["System Design", "Go", "Kubernetes", "DSA & LeetCode", "PostgreSQL", "Redis"],
        "mentoring_topics": ["System Design Fundamentals", "FAANG Interview Strategy", "Resume Review & Project Critique", "Transitioning from College to Tech"],
        "session_price_inr": 799,
        "rating": 4.95,
        "review_count": 84,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-2",
        "full_name": "Vikramaditya Verma",
        "title": "Staff Backend Architect",
        "organisation": "Uber",
        "bio": "Specialized in high-concurrency geo-distributed trip dispatch engines, Redis cache-aside architectures, and event streaming with Kafka. Mentored 150+ engineers.",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        "years_experience": 9,
        "domains": ["Software Engineering", "Cloud & DevOps Architecture"],
        "skills": ["Kafka", "Distributed Systems", "C++", "Java / Spring Boot", "Microservices"],
        "mentoring_topics": ["High-Scale Backend Architecture", "Mock Systems Interview", "Concurrency & Cache Invalidation", "Senior Engineering Growth"],
        "session_price_inr": 999,
        "rating": 4.98,
        "review_count": 128,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-3",
        "full_name": "Neha Kulkarni",
        "title": "Senior Full-Stack Engineer",
        "organisation": "Meta",
        "bio": "Frontend systems specialist, React Server Components pioneer, and modern TypeScript architecture lead. Passionate about accessible, performant UI/UX.",
        "avatar_url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
        "years_experience": 6,
        "domains": ["Software Engineering", "UI/UX & Product Design"],
        "skills": ["React.js", "Next.js", "TypeScript", "GraphQL", "Web Performance", "Tailwind CSS"],
        "mentoring_topics": ["Full-Stack Portfolio Teardown", "React Deep-Dive & Performance", "Modern Frontend Architecture", "First Job Career Roadmap"],
        "session_price_inr": 749,
        "rating": 4.92,
        "review_count": 76,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-4",
        "full_name": "Siddharth Sen",
        "title": "Principal Core Systems Engineer",
        "organisation": "Zerodha",
        "bio": "Building ultra-low-latency financial trading infrastructure. Expert in memory management, Linux kernel tuning, and rock-solid transactional semantics.",
        "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
        "years_experience": 11,
        "domains": ["Software Engineering"],
        "skills": ["Go", "C++", "PostgreSQL Internals", "Linux Performance", "Low-Latency Systems"],
        "mentoring_topics": ["Fintech Engineering Standards", "Clean Code Without Bloat", "Database Deep Dives", "Navigating Tier-2 Placements"],
        "session_price_inr": 1199,
        "rating": 4.99,
        "review_count": 92,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },

    # ── 2. Data Science & AI ─────────────────────────────────────────
    {
        "id": "mentor-5",
        "full_name": "Dr. Priya Narayanan",
        "title": "Lead AI & ML Researcher",
        "organisation": "Microsoft Research",
        "bio": "Specializing in Generative AI, LLM evaluation, and RAG architectures. Have mentored 120+ students on portfolio-worthy ML projects and paper publications.",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        "years_experience": 8,
        "domains": ["Data Science & AI", "Data Analytics & BI"],
        "skills": ["PyTorch", "Large Language Models", "RAG Pipelines", "Vector Databases", "Python", "Transformers"],
        "mentoring_topics": ["Breaking into AI/ML in 2026", "Portfolio Project Review", "M.S. vs Industry Job Decision", "Research Paper Deep Dives"],
        "session_price_inr": 999,
        "rating": 4.98,
        "review_count": 112,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-6",
        "full_name": "Arjun Singhania",
        "title": "Machine Learning Platform Lead",
        "organisation": "Swiggy",
        "bio": "Leading real-time recommendation engines and ETA prediction neural models. Dedicated to teaching production MLOps, model monitoring, and Feast feature stores.",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
        "years_experience": 6,
        "domains": ["Data Science & AI"],
        "skills": ["MLOps", "Kubeflow", "Scikit-Learn", "Feature Stores", "Python", "Ray"],
        "mentoring_topics": ["Applied Machine Learning in Production", "Recommendation Systems", "ML Coding Interview Prep", "Building an MLOps Portfolio"],
        "session_price_inr": 849,
        "rating": 4.90,
        "review_count": 64,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },

    # ── 3. Cybersecurity & Infosec ───────────────────────────────────
    {
        "id": "mentor-7",
        "full_name": "Rohan Mehta",
        "title": "Staff Security Engineer",
        "organisation": "CrowdStrike",
        "bio": "Red Team operator and cloud security auditor. Guiding aspiring cybersecurity analysts on certifications (OSCP, CEH), CTF contests, and enterprise SOC analyst roles.",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        "years_experience": 8,
        "domains": ["Cybersecurity & Infosec"],
        "skills": ["Penetration Testing", "AWS Security", "Network Protocols", "Wireshark", "Burp Suite", "SOC Triage"],
        "mentoring_topics": ["Cybersecurity Career Roadmap", "Hands-on Lab Building", "Certifications Guidance (OSCP/Sec+)", "Mock Technical Interview"],
        "session_price_inr": 899,
        "rating": 4.88,
        "review_count": 67,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-8",
        "full_name": "Kavita Rao",
        "title": "Application Security Architect",
        "organisation": "Palo Alto Networks",
        "bio": "Specialist in DevSecOps pipelines, automated SAST/DAST tooling, and threat modeling for cloud applications. Passionate about empowering women in cybersecurity.",
        "avatar_url": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80",
        "years_experience": 7,
        "domains": ["Cybersecurity & Infosec", "Cloud & DevOps Architecture"],
        "skills": ["Threat Modeling", "OWASP Top 10", "DevSecOps", "Cloud Security", "Docker Security"],
        "mentoring_topics": ["DevSecOps CI/CD Integration", "AppSec Interview Strategy", "Web Vulnerability Analysis", "Security Certification Strategy"],
        "session_price_inr": 849,
        "rating": 4.94,
        "review_count": 58,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },

    # ── 4. Product Management ────────────────────────────────────────
    {
        "id": "mentor-9",
        "full_name": "Ananya Deshmukh",
        "title": "Senior Product Manager",
        "organisation": "Flipkart",
        "bio": "Ex-founder turned PM. Helping engineers and non-engineers transition into Product Management with practical product teardowns, metrics frameworks, and case studies.",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
        "years_experience": 5,
        "domains": ["Product Management", "Data Analytics & BI"],
        "skills": ["Product Sense", "GTM Strategy", "User Research", "A/B Testing Metrics", "PRD Writing", "RICE Scoring"],
        "mentoring_topics": ["Associate PM (APM) Prep", "Product Teardown Reviews", "Cracking PM Case Interviews", "Career Pivot to Product"],
        "session_price_inr": 849,
        "rating": 4.92,
        "review_count": 73,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-10",
        "full_name": "Karthik Iyer",
        "title": "Director of Product Management",
        "organisation": "Razorpay",
        "bio": "Scaled core checkout systems processing $80B+ TPV. 10+ years mentoring aspiring PMs on product strategy, fintech compliance, and leadership communication.",
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
        "years_experience": 10,
        "domains": ["Product Management"],
        "skills": ["Fintech Product Strategy", "Executive Stakeholder Management", "Platform APIs", "Unit Economics"],
        "mentoring_topics": ["Senior PM Interview Strategy", "Scaling B2B Products", "Writing World-Class PRDs", "Executive Presence"],
        "session_price_inr": 1299,
        "rating": 4.99,
        "review_count": 140,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },

    # ── 5. Cloud & DevOps Architecture ───────────────────────────────
    {
        "id": "mentor-11",
        "full_name": "Devendra Patil",
        "title": "Lead Cloud Infrastructure Engineer",
        "organisation": "Amazon Web Services (AWS)",
        "bio": "AWS Certified Solutions Architect & DevOps Professional. Built multi-region failover platforms and Terraform automation for Fortune 500 enterprises.",
        "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
        "years_experience": 8,
        "domains": ["Cloud & DevOps Architecture"],
        "skills": ["Terraform", "AWS", "Kubernetes (EKS)", "CI/CD Pipelines", "Helm", "Prometheus / Grafana"],
        "mentoring_topics": ["AWS Certification Roadmap", "Building a DevOps GitHub Portfolio", "Kubernetes Production Setup", "SRE Interview Preparation"],
        "session_price_inr": 899,
        "rating": 4.93,
        "review_count": 81,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-12",
        "full_name": "Meera Joshi",
        "title": "Site Reliability Engineer",
        "organisation": "Netflix",
        "bio": "Chaos engineering practitioner, distributed tracing expert, and observability evangelist. Guiding students through incident management and telemetry.",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
        "years_experience": 6,
        "domains": ["Cloud & DevOps Architecture", "Software Engineering"],
        "skills": ["OpenTelemetry", "Chaos Engineering", "Python", "Datadog", "Service Mesh (Istio)"],
        "mentoring_topics": ["Observability & SRE Fundamentals", "Chaos Testing in Cloud", "Incident Postmortems", "Career Guidance for Platform Roles"],
        "session_price_inr": 949,
        "rating": 4.96,
        "review_count": 68,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },

    # ── 6. UI/UX & Product Design ────────────────────────────────────
    {
        "id": "mentor-13",
        "full_name": "Ishaan Chawla",
        "title": "Design Lead",
        "organisation": "CRED",
        "bio": "Known for tactile, neo-brutalist interaction design and micro-interactions. Mentoring designers on craft, Figma design systems, and storytelling portfolios.",
        "avatar_url": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
        "years_experience": 7,
        "domains": ["UI/UX & Product Design"],
        "skills": ["Figma", "Design Systems", "Prototyping", "Micro-Interactions", "User Research", "Motion Design"],
        "mentoring_topics": ["UI/UX Portfolio Teardown", "Building Scalable Design Systems", "Design Interview Prep", "Mastering Motion in UI"],
        "session_price_inr": 899,
        "rating": 4.97,
        "review_count": 94,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-14",
        "full_name": "Zoya Merchant",
        "title": "Senior UX Researcher",
        "organisation": "Airbnb (Alumni)",
        "bio": "Expert in usability testing, cognitive walkthroughs, and qualitative user interviewing. Translates user psychology into high-retention interface flows.",
        "avatar_url": "https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=400&auto=format&fit=crop&q=80",
        "years_experience": 5,
        "domains": ["UI/UX & Product Design"],
        "skills": ["UX Research", "Usability Testing", "Information Architecture", "Heuristic Evaluation", "Persona Mapping"],
        "mentoring_topics": ["Conducting User Research That Matters", "UX Research Case Studies", "Design Career Strategy", "Usability Testing On a Budget"],
        "session_price_inr": 799,
        "rating": 4.91,
        "review_count": 52,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },

    # ── 7. Data Analytics & Business Intelligence ────────────────────
    {
        "id": "mentor-15",
        "full_name": "Manish Agarwal",
        "title": "VP of Analytics",
        "organisation": "JPMorgan Chase",
        "bio": "Bridging SQL data warehouses, predictive financial modeling, and executive storytelling with Tableau & PowerBI. 12+ years in financial analytics.",
        "avatar_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
        "years_experience": 12,
        "domains": ["Data Analytics & BI"],
        "skills": ["Advanced SQL", "Tableau", "Snowflake", "dbt", "Financial Modeling", "Executive Storytelling"],
        "mentoring_topics": ["Breaking into Corporate Analytics", "SQL Interview Mastery", "Executive Dashboard Design", "Building a Business Analytics Portfolio"],
        "session_price_inr": 999,
        "rating": 4.95,
        "review_count": 105,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-16",
        "full_name": "Deepika Banerjee",
        "title": "Senior Business Analyst",
        "organisation": "McKinsey & Company",
        "bio": "Consulting frameworks, business case formulation, market sizing, and data synthesis. Helping engineering and business graduates prepare for analyst recruitment.",
        "avatar_url": "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&auto=format&fit=crop&q=80",
        "years_experience": 6,
        "domains": ["Data Analytics & BI", "Product Management"],
        "skills": ["Business Case Modeling", "Market Sizing", "Excel / Financial Modeling", "Problem Structuring", "Storyboarding"],
        "mentoring_topics": ["Consulting Case Interview Preparation", "Structured Problem Solving", "Guesstimates & Sizing", "Resume Transformation for Consulting"],
        "session_price_inr": 899,
        "rating": 4.89,
        "review_count": 78,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },

    # ── 8. Embedded Systems & Hardware Engineering ───────────────────
    {
        "id": "mentor-17",
        "full_name": "Harish Ranganathan",
        "title": "Senior Hardware & Firmware Engineer",
        "organisation": "NVIDIA",
        "bio": "GPU kernel optimization, embedded RTOS development, and CUDA parallel programming. Dedicated to guiding electrical and electronics engineers into top tech tracks.",
        "avatar_url": "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&auto=format&fit=crop&q=80",
        "years_experience": 9,
        "domains": ["Software Engineering"],
        "skills": ["C / C++", "RTOS", "CUDA", "Embedded Linux", "Microcontrollers (ARM)", "Memory Layout"],
        "mentoring_topics": ["Embedded Systems Career Path", "CUDA Programming Basics", "Firmware Debugging Techniques", "Cracking Semiconductor Interviews"],
        "session_price_inr": 949,
        "rating": 4.94,
        "review_count": 48,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-18",
        "full_name": "Suresh Nambiar",
        "title": "Staff SoC Verification Engineer",
        "organisation": "Qualcomm",
        "bio": "SystemVerilog, UVM verification, and chip design architectures. Guiding aspiring silicon design engineers into mobile SoC and 5G chip development.",
        "avatar_url": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80",
        "years_experience": 10,
        "domains": ["Software Engineering"],
        "skills": ["SystemVerilog", "UVM", "ASIC Design", "VLSI Verification", "Python Scripting"],
        "mentoring_topics": ["VLSI Verification Career Blueprint", "Core Digital Electronics Questions", "Mock Silicon Interview", "M.Tech vs Direct Core Job"],
        "session_price_inr": 999,
        "rating": 4.91,
        "review_count": 39,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },

    # ── 9. Growth Marketing & Technical SEO ──────────────────────────
    {
        "id": "mentor-19",
        "full_name": "Tanvi Kapadia",
        "title": "Director of Growth",
        "organisation": "Zepto",
        "bio": "Scaling consumer acquisition, referral virality loops, and app store ranking engines. Teaching growth analytics and customer retention loops.",
        "avatar_url": "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400&auto=format&fit=crop&q=80",
        "years_experience": 7,
        "domains": ["Product Management", "Data Analytics & BI"],
        "skills": ["Growth Loops", "Retention Funnels", "App Telemetry", "Paid Marketing Optimization", "A/B Testing"],
        "mentoring_topics": ["Breaking into Growth Product Roles", "Retention Analysis Breakdown", "Viral Loops Case Study", "Growth Portfolio Review"],
        "session_price_inr": 849,
        "rating": 4.90,
        "review_count": 62,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    },
    {
        "id": "mentor-20",
        "full_name": "Abhishek Roy",
        "title": "Growth Marketing Strategist",
        "organisation": "GrowthX (Mentor)",
        "bio": "Mentoring early career marketers and startup operators on PLG (product-led growth), technical attribution models, and conversion rate optimization.",
        "avatar_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
        "years_experience": 6,
        "domains": ["Product Management"],
        "skills": ["PLG Strategies", "Mixpanel", "Conversion Rate Optimization", "Customer Acquisition Cost (CAC)", "Email Lifecycle"],
        "mentoring_topics": ["Product-Led Growth Teardown", "Attribution Modeling", "Career in Modern Growth Marketing", "Portfolio Case Review"],
        "session_price_inr": 799,
        "rating": 4.88,
        "review_count": 45,
        "is_verified": True,
        "is_demo_profile": True,
        "is_available": True
    }
]

class MarketplaceService:
    # In-memory booking store for state tracking and double-booking prevention
    _booked_slot_ids: set = set()

    @classmethod
    def get_mentors(
        cls,
        search: Optional[str] = None,
        domain: Optional[str] = None,
        max_price: Optional[int] = None,
        min_rating: Optional[float] = None,
        sort_by: Optional[str] = "rating"
    ) -> Dict[str, Any]:
        """
        Retrieves, searches, filters, and sorts mentors from the catalog.
        """
        mentors = list(SEEDED_MENTOR_CATALOG)

        # 1. Search Query
        if search and search.strip():
            query = search.strip().lower()
            mentors = [
                m for m in mentors
                if query in m["full_name"].lower()
                or query in m["organisation"].lower()
                or query in m["title"].lower()
                or any(query in s.lower() for s in m["skills"])
            ]

        # 2. Domain Filter
        if domain and domain.lower() != "all":
            d_lower = domain.lower()
            mentors = [
                m for m in mentors
                if any(d_lower in d.lower() for d in m["domains"])
            ]

        # 3. Price Filter
        if max_price is not None:
            mentors = [m for m in mentors if m["session_price_inr"] <= max_price]

        # 4. Rating Filter
        if min_rating is not None:
            mentors = [m for m in mentors if m["rating"] >= min_rating]

        # 5. Sorting
        if sort_by == "price_asc":
            mentors.sort(key=lambda m: m["session_price_inr"])
        elif sort_by == "price_desc":
            mentors.sort(key=lambda m: m["session_price_inr"], reverse=True)
        elif sort_by == "experience":
            mentors.sort(key=lambda m: m["years_experience"], reverse=True)
        else: # Default rating descending
            mentors.sort(key=lambda m: (m["rating"], m["review_count"]), reverse=True)

        # Collect unique domains
        all_domains = sorted(list(set(d for m in SEEDED_MENTOR_CATALOG for d in m["domains"])))

        return {
            "total": len(mentors),
            "domains": all_domains,
            "mentors": [MentorProfileSchema.model_validate(m) for m in mentors]
        }

    @classmethod
    def get_mentor_by_id(cls, mentor_id: str) -> Optional[MentorProfileSchema]:
        for m in SEEDED_MENTOR_CATALOG:
            if m["id"] == mentor_id:
                return MentorProfileSchema.model_validate(m)
        return None

    @classmethod
    def generate_slots_for_mentor(cls, mentor_id: str) -> List[SlotItem]:
        """
        Generates realistic 30-minute bookable slots for the upcoming 14 days,
        marking previously booked slots as unavailable to prevent double booking.
        """
        mentor = cls.get_mentor_by_id(mentor_id)
        if not mentor:
            return []

        now = datetime.now(timezone.utc)
        slots: List[SlotItem] = []

        # Standard evening weekday schedule (6 PM, 7:30 PM, 8:30 PM) & weekend morning/afternoon
        slot_hours = [18, 19, 20]  # 6 PM, 7:30 PM, 8:30 PM IST approximate

        for day_offset in range(1, 15):
            day_date = now + timedelta(days=day_offset)
            is_weekend = day_date.weekday() in [5, 6] # Saturday, Sunday

            hours_to_generate = [11, 15, 17] if is_weekend else [18, 19, 20]

            for h in hours_to_generate:
                slot_start = day_date.replace(hour=h, minute=0, second=0, microsecond=0)
                slot_end = slot_start + timedelta(minutes=30)
                slot_id = f"{mentor_id}-slot-{slot_start.strftime('%Y%m%d%H%M')}"

                # Human-friendly label
                day_name = "Tomorrow" if day_offset == 1 else slot_start.strftime("%A, %b %d")
                time_str = slot_start.strftime("%I:%M %p IST")
                label = f"{day_name}, {time_str}"

                is_already_booked = slot_id in cls._booked_slot_ids

                slots.append(
                    SlotItem(
                        id=slot_id,
                        mentor_id=mentor_id,
                        start_time=slot_start.isoformat(),
                        end_time=slot_end.isoformat(),
                        label=label,
                        display_label=label,
                        duration_mins=30,
                        is_booked=is_already_booked
                    )
                )

        return slots

    @classmethod
    def mark_slot_as_booked(cls, slot_id: str):
        cls._booked_slot_ids.add(slot_id)

    @classmethod
    def release_booked_slot(cls, slot_id: str):
        cls._booked_slot_ids.discard(slot_id)

    @classmethod
    def is_slot_booked(cls, slot_id: str) -> bool:
        return slot_id in cls._booked_slot_ids
