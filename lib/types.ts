export interface TimestampSegment {
  start: string
  end: string
  topic: string
  worthIt: boolean
  why: string
}

export interface FullReport {
  summary: string
  keyTakeaways: string[]
  timestamps: TimestampSegment[]
}

export interface Video {
  id: string
  date: string
  title: string
  channel: string
  duration: number
  category: string
  score: number
  reasoning: string
  fullReport: FullReport
  url: string
  addedAt: number
}

export interface FocusProfile {
  thesis: string
  holdings: string
  interests: string
  ignore: string
}

export interface AnalysisResult {
  score: number
  tier?: string
  reasoning: string
  summary: string
  keyTakeaways: string[]
  timestamps: TimestampSegment[]
}

export interface AnalyzeRequest {
  title: string
  channel: string
  duration: number
  category: string
  transcript: string
  profile: FocusProfile
}
