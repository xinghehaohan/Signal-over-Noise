export function cleanServerName(value: string | null | undefined): string | null {
  if (!value) return null
  const first = value.split('\n')[0].trim()
  return first || null
}

export function cleanChannelName(value: string | null | undefined): string | null {
  if (!value) return null
  const parts = value.split('\n')
  if (parts.length > 1) {
    const last = parts[parts.length - 1].trim()
    return last || null
  }
  // No newline — strip a leading "ServerName:" prefix if present
  const colonIdx = value.indexOf(':')
  if (colonIdx !== -1) {
    const after = value.slice(colonIdx + 1).trim()
    return after || null
  }
  return value.trim() || null
}
