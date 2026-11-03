/**
 * TypeScript Data Contracts for Job Board & Intelligence Engine (Architecture Spec 2.0)
 */

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type JobStatus = 'active' | 'closed' | 'new';
export type JobCategory = 
  | 'Product' 
  | 'Software Engineering' 
  | 'Design' 
  | 'Data & Analytics' 
  | 'Cloud & DevOps'
  | 'AI & Machine Learning';

export type ApplicationStage = 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';

export interface JobHiringContact {
  name?: string;
  role?: string;
  linkedin?: string;
  email?: string;
}

export interface JobListing {
  id: string;
  hash_id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  country: string; // 'India', 'Global', 'USA', etc.
  work_mode: WorkMode;
  exp_min: number; // 0 for freshers
  exp_max: number;
  salary_display?: string; // e.g. "₹8–14 LPA" or "$90,000–$120,000"
  skills: string[];
  role_category: JobCategory;
  tier: number; // 1: Big Tech, 2: Unicorn/Top Startup, 3: Seed/Early Startup
  apply_url: string;
  source: string; // 'Greenhouse', 'Lever', 'Remotive', 'Curated'
  status: JobStatus;
  jd_summary?: string;
  jd_full?: string;
  hiring_contact?: JobHiringContact | null;
  verified_at: string;
  posted_at: string;
  created_at?: string;
  
  // Client-side/dynamic state
  is_saved?: boolean;
  application_status?: ApplicationStage;
  match_score?: number; // 0-100% computed from resume
}

export interface JobFilterState {
  searchQuery: string;
  region: 'All' | 'India' | 'Global' | 'Remote';
  roleCategory: string; // 'All' | JobCategory
  experienceRange: string; // 'All' | '0-1' | '1-3' | '3+'
  workMode: 'All' | WorkMode;
  sortBy: 'newest' | 'verified' | 'salary' | 'match';
}

export interface JobMatchAnalysis {
  job_id: string;
  job_title: string;
  company: string;
  match_score: number; // 0-100
  matching_skills: string[];
  missing_skills: string[];
  strengths: string[];
  tailoring_tips: string[];
  recommendation_level: 'High Fit' | 'Moderate Fit' | 'Reach Role';
}

export interface UserSavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job?: JobListing;
}

export interface UserAppliedJob {
  id: string;
  user_id: string;
  job_id: string;
  status: ApplicationStage;
  notes: string;
  applied_at: string;
  updated_at: string;
  job?: JobListing;
}

export interface JobListResponse {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  jobs: JobListing[];
  last_verified: string;
}

export interface TailoredBullet {
  original_theme: string;
  tailored_star: string;
  metrics_impact: string;
  targeted_keywords: string[];
}

export interface JobTailorRequest {
  job_id: string;
  user_email?: string;
  resume_text?: string;
  student_skills?: string[];
  target_role?: string;
}

export interface JobTailorResponse {
  job_id: string;
  company: string;
  role_title: string;
  tailored_bullets: TailoredBullet[];
  recruiter_outreach_dm: string;
  ats_keywords_to_include: string[];
  cover_pitch: string;
}


