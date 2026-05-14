import type { DiscordIntelManifest, DiscordRawMessage, ParsedJsonlResult } from './types'

export function parseJsonlText(text: string): ParsedJsonlResult {
  const lines = text.split('\n').filter(line => line.trim() !== '')

  if (lines.length === 0) {
    throw new Error('Empty JSONL file — no content to parse.')
  }

  let manifest: DiscordIntelManifest
  try {
    const parsed: unknown = JSON.parse(lines[0])
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as Record<string, unknown>).type !== 'manifest'
    ) {
      throw new Error(
        `First line must be a manifest object. Got type: ${
          (parsed as Record<string, unknown>)?.type ?? 'unknown'
        }`
      )
    }
    manifest = parsed as DiscordIntelManifest
  } catch (err) {
    throw new Error(
      `Failed to parse manifest (line 1): ${err instanceof Error ? err.message : String(err)}`
    )
  }

  const messages: DiscordRawMessage[] = []
  const errors: Array<{ line: number; error: string }> = []

  for (let i = 1; i < lines.length; i++) {
    try {
      const parsed: unknown = JSON.parse(lines[i])
      messages.push(parsed as DiscordRawMessage)
    } catch (err) {
      errors.push({
        line: i + 1,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return { manifest, messages, errors }
}
