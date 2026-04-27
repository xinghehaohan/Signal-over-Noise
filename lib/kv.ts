import type { Video, FocusProfile } from './types'

const KV_KEYS = {
  videos: 'dgs:videos:v1',
  profile: 'dgs:profile:v1',
}

// In-memory fallback — used when KV env vars are absent (local dev without KV)
const mem: Record<string, unknown> = {}

async function kvGet<T>(key: string): Promise<T | null> {
  if (!process.env.KV_REST_API_URL) {
    return (mem[key] as T) ?? null
  }
  const { kv } = await import('@vercel/kv')
  return kv.get<T>(key)
}

async function kvSet(key: string, value: unknown): Promise<void> {
  if (!process.env.KV_REST_API_URL) {
    mem[key] = value
    return
  }
  const { kv } = await import('@vercel/kv')
  await kv.set(key, value)
}

export async function getVideos(): Promise<Video[]> {
  const data = await kvGet<Video[]>(KV_KEYS.videos)
  return data ?? []
}

export async function setVideos(videos: Video[]): Promise<void> {
  await kvSet(KV_KEYS.videos, videos)
}

export async function getProfile(): Promise<FocusProfile | null> {
  return kvGet<FocusProfile>(KV_KEYS.profile)
}

export async function setProfile(profile: FocusProfile): Promise<void> {
  await kvSet(KV_KEYS.profile, profile)
}
