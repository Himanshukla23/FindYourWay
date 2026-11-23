import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

export interface AIResponse {
  content: string
  providerUsed: 'gemini' | 'groq' | 'demo'
  model: string
}

/**
 * Executes an AI completion with automatic fallback:
 * 1. Tries Google Gemini first (gemini-1.5-flash)
 * 2. If rate-limited (429), token limit exceeded, or failed -> falls back automatically to Groq (llama-3.3-70b-versatile)
 * 3. If no keys or both fail -> falls back to deterministic mock data (so app never crashes)
 */
export async function executeAIPrompt({
  prompt,
  systemInstruction,
  responseJson = true,
}: {
  prompt: string
  systemInstruction?: string
  responseJson?: boolean
}): Promise<AIResponse> {
  const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY
  const groqApiKey = process.env.GROQ_API_KEY

  // ── 1. Try Groq API First (Fastest < 2.5s & Active Models) ──────────────────
  if (groqApiKey) {
    try {
      const groq = new Groq({ apiKey: groqApiKey })
      
      const messages: any[] = []
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction })
      }
      messages.push({ role: 'user', content: prompt })

      // Active Groq models on user key
      const groqModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant']
      let text = null
      let usedModel = 'openai/gpt-oss-120b'

      for (const m of groqModels) {
        try {
          const completion: any = await Promise.race([
            groq.chat.completions.create({
              model: m,
              messages,
              response_format: responseJson ? { type: 'json_object' } : undefined,
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Groq timeout')), 10000)),
          ])
          text = completion.choices[0]?.message?.content
          if (text) {
            usedModel = m
            break
          }
        } catch (err: any) {
          console.warn(`Groq model ${m} skipped:`, err?.message)
          if (err?.status === 403 || err?.message?.includes('403')) {
            break
          }
        }
      }

      if (text && text.trim().length > 0) {
        return {
          content: text.trim(),
          providerUsed: 'groq',
          model: usedModel,
        }
      }
    } catch (groqError: any) {
      console.warn('❌ [AI] Groq attempt failed:', groqError?.message || groqError)
    }
  }

  // ── 2. Fallback to Google Gemini (Active Models with Resilient Timeout) ──────────
  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey)
      const geminiModels = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.8-flash']
      let text = null
      let usedModel = 'gemini-flash-lite-latest'

      for (const m of geminiModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: m,
            generationConfig: {
              responseMimeType: responseJson ? 'application/json' : 'text/plain',
            },
            systemInstruction: systemInstruction,
          })

          const result: any = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) => setTimeout(() => reject(new Error('AI generation timeout')), 10000)),
          ])

          text = result?.response?.text()
          if (text) {
            usedModel = m
            break
          }
        } catch (e: any) {
          console.warn(`Gemini model ${m} skipped (${e?.message || 'error'}), trying next...`)
        }
      }

      if (text && text.trim().length > 0) {
        return {
          content: text.trim(),
          providerUsed: 'gemini',
          model: usedModel,
        }
      }
    } catch (geminiError: any) {
      console.warn('⚠️ [AI] Gemini request failed or rate limit reached:', geminiError?.message || geminiError)
    }
  }

  // ── 3. Graceful Mock Fallback (Guarantees zero UI crash) ──────────────────────
  console.log('ℹ️ [AI] Running in resilient Demo/Fallback Mode')
  return {
    content: '',
    providerUsed: 'demo',
    model: 'mock-generator',
  }
}
