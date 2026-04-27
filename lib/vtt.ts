export interface VTTStats {
  cueCount: number
  firstTimestampSecs: number
  lastTimestampSecs: number
  durationMinutes: number
  wordCount: number
  speakers: string[]
  errors: string[]
  warnings: string[]
}

function parseTimestampToSeconds(ts: string): number {
  const clean = ts.trim().split(' ')[0].split('.')[0] // drop milliseconds + cue settings
  const parts = clean.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

export function parseVTTStats(vtt: string): VTTStats {
  const errors: string[] = []
  const warnings: string[] = []

  const hasArrow = vtt.includes(' --> ')
  if (!vtt.trimStart().startsWith('WEBVTT') && !hasArrow) {
    errors.push('Not a valid VTT file — no WEBVTT header or timestamp arrows found')
    return { cueCount: 0, firstTimestampSecs: 0, lastTimestampSecs: 0, durationMinutes: 0, wordCount: 0, speakers: [], errors, warnings }
  }

  const lines = vtt.split('\n')
  let cueCount = 0
  let firstSecs = -1
  let lastSecs = 0
  let wordCount = 0
  const speakerSet = new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.includes(' --> ')) continue

    cueCount++
    const arrowIdx = line.indexOf(' --> ')
    const startRaw = line.slice(0, arrowIdx)
    const endRaw = line.slice(arrowIdx + 5)
    const startSecs = parseTimestampToSeconds(startRaw)
    const endSecs = parseTimestampToSeconds(endRaw)

    if (firstSecs === -1) firstSecs = startSecs
    if (endSecs > lastSecs) lastSecs = endSecs

    // Collect text lines for this cue
    let j = i + 1
    while (j < lines.length && lines[j].trim() !== '' && !lines[j].includes('-->')) {
      const raw = lines[j].trim()
      // Speaker: <v Name>
      const vTag = raw.match(/^<v ([^>]+)>/)
      if (vTag) speakerSet.add(vTag[1].trim())
      // Speaker: "Name:" prefix (all-caps or title-case, not a timestamp)
      const prefix = raw.match(/^([A-Z][^:]{1,30}):\s/)
      if (prefix && !/^\d{2}:/.test(raw)) speakerSet.add(prefix[1].trim())

      const plain = raw.replace(/<[^>]+>/g, '').trim()
      if (plain) {
        // Chinese characters are not space-separated — count chars instead
        if (/[一-龥]/.test(plain)) {
          wordCount += plain.replace(/\s/g, '').length
        } else {
          wordCount += plain.split(/\s+/).filter(Boolean).length
        }
      }
      j++
    }
  }

  if (cueCount === 0) {
    errors.push('Zero cues found — not a valid VTT')
    return { cueCount: 0, firstTimestampSecs: 0, lastTimestampSecs: 0, durationMinutes: 0, wordCount: 0, speakers: [], errors, warnings }
  }

  const durationSecs = lastSecs - Math.max(0, firstSecs)
  const durationMinutes = Math.max(1, Math.round(durationSecs / 60))

  if (cueCount < 50 && durationMinutes > 30) {
    warnings.push(`Only ${cueCount} cues for ~${durationMinutes} min duration — transcript may be incomplete`)
  }
  if (durationMinutes > 180) {
    warnings.push(`Duration is ~${durationMinutes} min (>3 hours) — verify this is correct`)
  }

  return {
    cueCount,
    firstTimestampSecs: Math.max(0, firstSecs),
    lastTimestampSecs: lastSecs,
    durationMinutes,
    wordCount,
    speakers: Array.from(speakerSet),
    errors,
    warnings,
  }
}

/** Convert WebVTT to plain "MM:SS text" lines, same output as the inline parseVTT in VideoDigestApp */
export function parseVTTToPlain(vtt: string): string {
  const lines = vtt.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length && !lines[i].includes('-->')) i++

  while (i < lines.length) {
    const line = lines[i].trim()
    if (line.includes('-->')) {
      const startRaw = line.split('-->')[0].trim().split(' ')[0]
      const totalSecs = parseTimestampToSeconds(startRaw)
      const mm = String(Math.floor(totalSecs / 60)).padStart(2, '0')
      const ss = String(totalSecs % 60).padStart(2, '0')

      i++
      const textLines: string[] = []
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
        const t = lines[i].trim()
        if (t && !/^\d+$/.test(t)) textLines.push(t.replace(/<[^>]+>/g, ''))
        i++
      }
      if (textLines.length > 0) result.push(`${mm}:${ss} ${textLines.join(' ')}`)
    } else {
      i++
    }
  }
  return result.join('\n')
}

export function isVTT(text: string): boolean {
  return text.trimStart().startsWith('WEBVTT') || text.includes(' --> ')
}

/** Strip .vtt extension and normalise punctuation for use as a title. */
export function cleanFilename(name: string): string {
  return name
    .replace(/\.vtt$/i, '')
    .replace(/[_\-]+/g, ' ')
    .trim()
}
