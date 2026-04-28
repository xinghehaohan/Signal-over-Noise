import { createClient } from '@supabase/supabase-js'
import type { Video, FocusProfile } from './types'

const TABLE = 'app_data'

const KV_KEYS = {
  videos: 'dgs:videos:v1',
  profile: 'dgs:profile:v1',
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  return createClient(url, key)
}

async function kvGet<T>(key: string): Promise<T | null> {
  const { data, error } = await getClient()
    .from(TABLE)
    .select('value')
    .eq('key', key)
    .maybeSingle()
  if (error) throw error
  return data ? (data.value as T) : null
}

async function kvSet(key: string, value: unknown): Promise<void> {
  const { error } = await getClient()
    .from(TABLE)
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
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
