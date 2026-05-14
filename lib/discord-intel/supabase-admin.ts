// This module must only be imported by server-side code (API routes, server actions).
// It uses the service role key which bypasses Row Level Security.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.')

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return _client
}
