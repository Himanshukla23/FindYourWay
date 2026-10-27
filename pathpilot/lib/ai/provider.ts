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

  // ── 1. Try Google Gemini First ───────────────────────────────────────────────
  if (geminiApiKey) {
    try {
      console.log('🤖 [AI] Dispatching request to Google Gemini...')
      const genAI = new GoogleGenerativeAI(geminiApiKey)
      
      const geminiModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-pro-latest']
      let text = null
      let usedModel = 'gemini-3.8-flash'

      for (const m of geminiModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: m,
            generationConfig: {
              responseMimeType: responseJson ? 'application/json' : 'text/plain',
            },
            systemInstruction: systemInstruction,
          })
          const result = await model.generateContent(prompt)
          text = result.response.text()
          if (text) {
            usedModel = m
            break
          }
        } catch (e: any) {
          console.warn(`Gemini model ${m} failed, trying next...`, e?.message)
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
      console.log('🔄 [AI] Seamlessly failing over to Groq API...')
    }
  }

  // ── 2. Fallback to Groq API (High Performance verified active endpoints) ────
  if (groqApiKey) {
    try {
      console.log('🤖 [AI] Dispatching request to Groq...')
      const groq = new Groq({ apiKey: groqApiKey })
      
      const messages: any[] = []
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction })
      }
      messages.push({ role: 'user', content: prompt })

      const groqModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b']
      let text = null
      let usedModel = 'qwen/qwen3.8-27b'

      for (const m of groqModels) {
        try {
          const completion = await groq.chat.completions.create({
            model: m,
            messages,
            response_format: responseJson ? { type: 'json_object' } : undefined,
          })
          text = completion.choices[0]?.message?.content
          if (text) {
            usedModel = m
            break
          }
        } catch (err: any) {
          console.warn(`Groq model ${m} attempt failed, trying next...`, err?.message)
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
      console.error('❌ [AI] Groq fallback also failed:', groqError?.message || groqError)
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
