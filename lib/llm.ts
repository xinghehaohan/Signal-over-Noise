import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import type { AnalyzeRequest, AnalysisResult } from './types'

const MODEL = 'gpt-5.4-nano'

let _systemPrompt: string | null = null
function getSystemPrompt(): string {
  if (_systemPrompt) return _systemPrompt
  try {
    _systemPrompt = fs.readFileSync(path.join(process.cwd(), 'prompt.me'), 'utf-8')
  } catch {
    _systemPrompt = `You are a personal video-triage analyst. Given the user's investment profile and a video transcript, return a JSON object with: score (1-10), tier ("must-listen"|"scannable"|"skip"), reasoning (2-4 sentences), summary (3-5 sentences), keyTakeaways (array of strings), timestamps (array of {start,end,topic,worthIt,why}). Return ONLY the JSON object.`
  }
  return _systemPrompt
}

function buildUserMessage(req: AnalyzeRequest): string {
  return `USER FOCUS PROFILE
─────────────────
Thesis: ${req.profile.thesis}
Current holdings: ${req.profile.holdings}
Topic interests: ${req.profile.interests}
Topics to ignore/deprioritize: ${req.profile.ignore}

VIDEO METADATA
─────────────
Title: ${req.title}
Channel: ${req.channel}
Duration: ${req.duration} minutes
Category: ${req.category || 'general'}

TRANSCRIPT (with timestamps)
─────────────
${req.transcript}

Return the JSON object now.`
}

function parseResult(text: string): AnalysisResult {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '')
    .trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/)
    if (!m) throw new Error('Could not parse model response as JSON.')
    parsed = JSON.parse(m[0])
  }

  if (typeof parsed.score !== 'number') throw new Error('Response missing score field.')
  parsed.score = Math.max(1, Math.min(10, Math.round(parsed.score as number)))
  if (!Array.isArray(parsed.timestamps)) parsed.timestamps = []
  if (!Array.isArray(parsed.keyTakeaways)) parsed.keyTakeaways = []
  return parsed as unknown as AnalysisResult
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function analyzeVideo(req: AnalyzeRequest): Promise<AnalysisResult> {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 2000,
    messages: [
      { role: 'system', content: getSystemPrompt() },
      { role: 'user', content: buildUserMessage(req) },
    ],
  })
  const text = response.choices[0]?.message?.content ?? ''
  return parseResult(text)
}
