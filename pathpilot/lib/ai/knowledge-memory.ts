import { createClient } from '@supabase/supabase-js'

export interface ProfileBenchmark {
  domain: string
  skills: string[]
  keyProjects: string[]
  experienceYears: number
  matchedRole: string
  rationale: string
}

// In-memory + persistent memory bank of historical student career mappings
const MEMORY_BANK: ProfileBenchmark[] = [
  {
    domain: 'Software Engineering',
    skills: ['C++', 'Java', 'Python', 'React', 'Node.js', 'Express', 'Redis', 'Docker', 'PostgreSQL', 'DSA', 'LeetCode'],
    keyProjects: ['Sandboxed code runner', 'Voice interview bot', 'Full stack web application', 'Microservices', 'Temporary photo sharing'],
    experienceYears: 0,
    matchedRole: 'Full Stack Software Engineer',
    rationale: 'Heavy code contribution, competitive programming ratings (LeetCode, CodeChef), and backend systems (Redis, BullMQ, Docker).'
  },
  {
    domain: 'Product Management',
    skills: ['PRD Writing', 'RICE Framework', 'Customer Discovery', 'User Interviews', 'GTM Phasing', 'Whimsical', 'Product Teardown'],
    keyProjects: ['AI Transparency Layer', 'RAG Evaluation & Auditing', 'Grounding interface', 'Fellowship Capstone'],
    experienceYears: 1,
    matchedRole: 'Technical AI Product Manager / APM',
    rationale: 'Focus on user validation, stakeholder management, product requirements, and cross-functional team leadership.'
  },
  {
    domain: 'Data Science & Machine Learning',
    skills: ['Python', 'Pandas', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Vector DB', 'FastAPI', 'ChromaDB'],
    keyProjects: ['Embeddings clustering', 'Predictive modeling', 'Financial recommendation engine', 'LLM fine-tuning'],
    experienceYears: 0,
    matchedRole: 'Junior Machine Learning Engineer',
    rationale: 'Strong mathematical modeling, statistical analysis, vector search, and model operationalization.'
  },
  {
    domain: 'Cybersecurity',
    skills: ['Wireshark', 'Burp Suite', 'Linux', 'Network Security', 'Penetration Testing', 'Kali Linux', 'SOC Analysis'],
    keyProjects: ['Vulnerability assessment', 'Packet inspection lab', 'CTF challenges'],
    experienceYears: 0,
    matchedRole: 'Junior Security / SOC Analyst',
    rationale: 'Hands-on network protocol dissection, vulnerability detection, and red/blue team security labs.'
  }
]

/**
 * Searches historical peer profile benchmarks to provide few-shot RAG context to the LLM.
 * This teaches the AI to accurately differentiate between a Software Engineer, a Product Manager, and a Data Scientist.
 */
export function retrieveSimilarBenchmarks(extractedText: string): ProfileBenchmark[] {
  const lower = extractedText.toLowerCase()

  // Calculate simple lexical similarity score against benchmark patterns
  return MEMORY_BANK.map(b => {
    let score = 0
    b.skills.forEach(s => {
      if (lower.includes(s.toLowerCase())) score += 2
    })
    b.keyProjects.forEach(p => {
      if (lower.includes(p.toLowerCase())) score += 3
    })
    return { benchmark: b, score }
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 2)
  .map(item => item.benchmark)
}

/**
 * Persists an analyzed resume outcome to Supabase or the local knowledge bank
 * so future analyses continually learn and reference past confirmed patterns.
 */
export async function recordAnalysisKnowledge(analysis: {
  skills: string[]
  domain: string
  role: string
  summary: string
}) {
  try {
    MEMORY_BANK.push({
      domain: analysis.domain,
      skills: analysis.skills,
      keyProjects: [],
      experienceYears: 0,
      matchedRole: analysis.role,
      rationale: analysis.summary
    })
  } catch (e) {
    console.warn('Could not record analysis to memory bank:', e)
  }
}
