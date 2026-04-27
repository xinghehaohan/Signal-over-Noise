'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Upload, X, RefreshCw, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, ChevronRight, SkipForward,
} from 'lucide-react'
import type { Video, FocusProfile, AnalysisResult } from '@/lib/types'
import { parseVTTStats, parseVTTToPlain, cleanFilename } from '@/lib/vtt'

// ─────────────────────────────────────────────────────────────────────────
//  STYLES — full dossier aesthetic + ingest-specific additions
// ─────────────────────────────────────────────────────────────────────────
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@200..800&family=JetBrains+Mono:wght@400..700&display=swap');
  .dgs-root { font-family:'Inter Tight',system-ui,sans-serif; background:#F4EFE3; color:#1A1814; min-height:100vh; -webkit-font-smoothing:antialiased; }
  .dgs-disp { font-family:'Fraunces','Times New Roman',serif; letter-spacing:-0.02em; }
  .dgs-ital { font-family:'Instrument Serif',serif; font-style:italic; letter-spacing:0; }
  .dgs-mono { font-family:'JetBrains Mono',ui-monospace,monospace; }
  .dgs-eyebrow { font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; font-weight:500; }
  .dgs-rule-thick { border-top:2px solid #8B1A1A; }
  .dgs-rule-thin { border-top:1px solid #D4CCB6; }
  .dgs-paper { background:#FFFDF7; border:1px solid #E5DDC8; box-shadow:0 1px 0 rgba(26,24,20,.04),0 12px 30px -18px rgba(63,58,46,.18); }
  .dgs-meta { font-size:13px; color:#6B6359; }
  .dgs-meta-dot::before { content:'·'; margin:0 8px; color:#B5AC95; }
  .dgs-btn-primary { background:#8B1A1A; color:#FFF8E7; padding:10px 18px; font-family:'Inter Tight',sans-serif; font-weight:500; font-size:14px; border-radius:2px; transition:all .15s; cursor:pointer; border:1px solid #8B1A1A; }
  .dgs-btn-primary:hover { background:#6F1414; }
  .dgs-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
  .dgs-btn-ghost { background:transparent; color:#1A1814; padding:8px 14px; font-family:'Inter Tight',sans-serif; font-weight:500; font-size:13px; border-radius:2px; transition:all .15s; cursor:pointer; border:1px solid #D4CCB6; }
  .dgs-btn-ghost:hover { background:#FAF4E2; border-color:#8B1A1A; color:#8B1A1A; }
  .dgs-btn-ghost:disabled { opacity:.4; cursor:not-allowed; }
  .dgs-input { width:100%; background:#FFFDF7; border:1px solid #D4CCB6; border-radius:2px; padding:6px 10px; font-family:'Inter Tight',sans-serif; font-size:13px; color:#1A1814; transition:border-color .15s; }
  .dgs-input:focus { outline:none; border-color:#8B1A1A; }
  .dgs-link { color:#8B1A1A; text-decoration:none; font-weight:500; transition:all .15s; border-bottom:1px solid transparent; cursor:pointer; }
  .dgs-link:hover { border-bottom-color:#8B1A1A; }
  .dgs-error { border:1px solid #C9836A; background:#FBEFE6; color:#6B2E14; padding:10px 12px; border-radius:2px; font-size:13px; }
  .dgs-fade-in { animation:dgsFade .4s ease both; }
  @keyframes dgsFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .dgs-spinner { animation:dgsSpin 1s linear infinite; }
  @keyframes dgsSpin { to{transform:rotate(360deg)} }

  /* Drop zone */
  .ing-dropzone {
    border:2px dashed #D4CCB6; border-radius:4px; transition:all .2s;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    cursor:pointer; background:#FFFDF7;
  }
  .ing-dropzone:hover, .ing-dropzone.dragging { border-color:#8B1A1A; background:#FAF4E2; }
  .ing-dropzone.compact { padding:18px 24px; flex-direction:row; gap:12px; justify-content:flex-start; }
  .ing-dropzone.full { padding:80px 40px; min-height:360px; }

  /* Status pills */
  .ing-pill { display:inline-flex; align-items:center; gap:5px; padding:2px 9px; border-radius:2px; font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:600; letter-spacing:.06em; white-space:nowrap; }
  .ing-pill-ready    { background:#E8E2CD; color:#5A5234; }
  .ing-pill-queued   { background:#D4E4F0; color:#2A5070; }
  .ing-pill-analyzing{ background:#F0E8D4; color:#7A5A1A; }
  .ing-pill-done     { background:#D4EAD4; color:#2A622A; }
  .ing-pill-failed   { background:#F0D4D4; color:#8B1A1A; }
  .ing-pill-skipped  { background:#ECEAE0; color:#6B6359; }
  .ing-pill-duplicate{ background:#F0E8D4; color:#7A5A1A; }

  /* Queue table row */
  .ing-row { padding:14px 20px; border-top:1px solid #EAE3CE; display:grid; gap:10px; align-items:start; grid-template-columns:90px 1fr 130px 68px 110px auto; }
  .ing-row:first-child { border-top:none; }
  .ing-col-label { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:#B5AC95; padding:14px 20px 6px; display:grid; gap:10px; align-items:center; grid-template-columns:90px 1fr 130px 68px 110px auto; border-bottom:1px solid #EAE3CE; }

  /* Cloud stub */
  .ing-cloud-stub { border:1px dashed #D4CCB6; border-radius:2px; padding:10px 16px; display:flex; align-items:center; gap:10px; background:#FFFDF7; opacity:.7; }
  .ing-coming-soon { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase; background:#E8E2CD; color:#6B6359; padding:2px 7px; border-radius:2px; font-weight:600; }

  /* Completion banner */
  .ing-banner { background:#1A1814; color:#FFF8E7; padding:18px 28px; border-radius:2px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .ing-banner-scores { display:flex; gap:16px; font-size:13px; }

  /* Dup prompt inline */
  .ing-dup-prompt { background:#FAF4E2; border:1px solid #E5DDC8; padding:8px 12px; border-radius:2px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:12.5px; color:#3F3A2E; }

  /* Warning inline */
  .ing-warn { background:#FEF8EC; border:1px solid #E5D8AA; padding:6px 10px; border-radius:2px; font-size:12px; color:#7A5A1A; display:flex; gap:6px; align-items:flex-start; }

  /* Error text (expandable) */
  .ing-err-text { max-width:220px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font-size:11.5px; color:#8B1A1A; cursor:default; }
  .ing-err-text:hover { white-space:normal; overflow:visible; }
`

// ─────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────
type RowStatus = 'ready' | 'duplicate' | 'queued' | 'analyzing' | 'done' | 'failed' | 'skipped'

interface QueueRow {
  id: string
  filename: string
  title: string
  channel: string
  duration: number
  category: string
  vttContent: string
  plainTranscript: string
  status: RowStatus
  score?: number
  error?: string
  videoId?: string
  addedAt: number
  cueCount: number
  wordCount: number
  speakers: string[]
  warnings: string[]
  dupMatchDate?: string
}

// ─────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────
const CONCURRENCY = 3
const MAX_WARN_BYTES = 5 * 1024 * 1024
const COST_PER_30_MIN = 0.05
const QUEUE_KEY = 'dgs:ingest_queue:v1'
const todayISO = () => new Date().toISOString().slice(0, 10)

function estimateCost(rows: QueueRow[]): string {
  const mins = rows.filter(r => !['done', 'skipped'].includes(r.status))
    .reduce((s, r) => s + r.duration, 0)
  const cost = Math.max(0.01, Math.round((mins / 30) * COST_PER_30_MIN * 100) / 100)
  return cost.toFixed(2)
}

function classifyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/failed to fetch|networkerror|network request failed/i.test(msg)) return `Network error: ${msg}`
  if (msg.startsWith('API ')) return msg
  if (/json|parse|unexpected token/i.test(msg)) return `Parse error: ${msg}`
  return msg
}

// ─────────────────────────────────────────────────────────────────────────
//  CONCURRENCY POOL
// ─────────────────────────────────────────────────────────────────────────
async function runPool<T>(
  items: T[],
  process: (item: T) => Promise<void>,
  limit = CONCURRENCY,
): Promise<void> {
  const queue = [...items]
  const executing = new Set<Promise<void>>()

  while (queue.length > 0 || executing.size > 0) {
    while (executing.size < limit && queue.length > 0) {
      const item = queue.shift()!
      let p!: Promise<void>
      p = process(item).finally(() => executing.delete(p))
      executing.add(p)
    }
    if (executing.size > 0) await Promise.race(executing)
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  API HELPERS
// ─────────────────────────────────────────────────────────────────────────
async function apiGetProfile(): Promise<FocusProfile | null> {
  try {
    const r = await fetch('/api/profile')
    const data = await r.json()
    return data.profile ?? null
  } catch { return null }
}

async function apiGetVideos(): Promise<Video[]> {
  try {
    const r = await fetch('/api/videos')
    const data = await r.json()
    return Array.isArray(data.videos) ? data.videos : []
  } catch { return [] }
}

async function apiAppendVideo(video: Video): Promise<void> {
  const r = await fetch('/api/videos', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video }),
  })
  if (!r.ok) throw new Error(`Store error ${r.status}`)
}

async function apiTriage(params: {
  title: string; channel: string; duration: number
  category: string; transcript: string; profile: FocusProfile
}): Promise<AnalysisResult> {
  const r = await fetch('/api/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`API ${r.status}: ${txt.slice(0, 150)}`)
  }
  const data = await r.json()
  if (data.error) throw new Error(data.error)
  return data
}

// ─────────────────────────────────────────────────────────────────────────
//  STATUS PILL
// ─────────────────────────────────────────────────────────────────────────
const StatusPill = ({ row }: { row: QueueRow }) => {
  const map: Record<RowStatus, { cls: string; label: string }> = {
    ready:     { cls: 'ing-pill-ready',     label: 'READY' },
    queued:    { cls: 'ing-pill-queued',    label: 'QUEUED' },
    analyzing: { cls: 'ing-pill-analyzing', label: 'ANALYZING' },
    done:      { cls: 'ing-pill-done',      label: row.score ? `${row.score}/10` : 'DONE' },
    failed:    { cls: 'ing-pill-failed',    label: 'FAILED' },
    skipped:   { cls: 'ing-pill-skipped',   label: 'SKIPPED' },
    duplicate: { cls: 'ing-pill-duplicate', label: 'DUP?' },
  }
  const { cls, label } = map[row.status]
  return (
    <span className={`ing-pill ${cls}`}>
      {row.status === 'analyzing' && (
        <Loader2 size={9} className="dgs-spinner" />
      )}
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────
//  HEADER
// ─────────────────────────────────────────────────────────────────────────
const IngestHeader = () => (
  <header style={{ borderBottom: '1px solid #E5DDC8', background: '#F4EFE3', position: 'sticky', top: 0, zIndex: 30 }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="dgs-eyebrow" style={{ color: '#8B1A1A' }}>The Daily Digest</div>
        <div className="dgs-disp" style={{ fontSize: 22, fontWeight: 600, marginTop: 2, lineHeight: 1 }}>
          Signal <span className="dgs-ital" style={{ fontWeight: 400 }}>over</span> Noise
        </div>
      </a>
      <a href="/" className="dgs-btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13 }}>
        <ArrowLeft size={13} /> Back to digest
      </a>
    </div>
  </header>
)

// ─────────────────────────────────────────────────────────────────────────
//  CLOUD LINK STUB
// ─────────────────────────────────────────────────────────────────────────
const CloudLinkStub = () => (
  <div className="ing-cloud-stub">
    <span className="dgs-eyebrow" style={{ color: '#B5AC95', fontSize: 10 }}>Cloud folder</span>
    <input
      disabled
      className="dgs-input"
      style={{ flex: 1, opacity: .5, cursor: 'not-allowed' }}
      placeholder="Paste TurboScribe folder link…"
    />
    <span className="ing-coming-soon">Coming soon</span>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────
//  DROP ZONE
// ─────────────────────────────────────────────────────────────────────────
const DropZone = ({
  compact,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onBrowse,
  inputRef,
  onFileInput,
  dropErrors,
}: {
  compact: boolean
  dragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onBrowse: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  dropErrors: string[]
}) => (
  <div>
    <div
      className={`ing-dropzone ${compact ? 'compact' : 'full'} ${dragging ? 'dragging' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onBrowse}
    >
      <Upload size={compact ? 16 : 28} style={{ color: '#B5AC95', flexShrink: 0 }} />
      {compact ? (
        <span style={{ fontSize: 13, color: '#6B6359' }}>
          Drop more <code style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>.vtt</code> files or click to browse
        </span>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div className="dgs-ital" style={{ fontSize: 20, color: '#3F3A2E', marginBottom: 8 }}>
            Drop your TurboScribe exports here
          </div>
          <div className="dgs-ital" style={{ fontSize: 15, color: '#8B8070' }}>
            Multiple <code style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>.vtt</code> files accepted — each becomes a digest entry
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="dgs-btn-ghost" onClick={e => { e.stopPropagation(); onBrowse() }}>
              Browse files
            </button>
          </div>
        </div>
      )}
    </div>

    <input
      ref={inputRef}
      type="file"
      accept=".vtt"
      multiple
      style={{ display: 'none' }}
      onChange={onFileInput}
    />

    {dropErrors.length > 0 && (
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {dropErrors.map((e, i) => (
          <div key={i} className="dgs-error" style={{ padding: '8px 12px', fontSize: 12.5 }}>
            <AlertCircle size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 5 }} />
            {e}
          </div>
        ))}
      </div>
    )}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────
//  QUEUE SUMMARY BAR
// ─────────────────────────────────────────────────────────────────────────
const QueueSummaryBar = ({ rows }: { rows: QueueRow[] }) => {
  const total = rows.length
  const totalMins = rows.reduce((s, r) => s + r.duration, 0)
  const cost = estimateCost(rows)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '10px 0', flexWrap: 'wrap' }}>
      <span className="dgs-mono" style={{ fontSize: 12.5, color: '#1A1814' }}>
        <strong>{total}</strong> {total === 1 ? 'file' : 'files'} staged
      </span>
      <span className="dgs-mono" style={{ fontSize: 12, color: '#6B6359' }}>~{totalMins} min total</span>
      <span className="dgs-mono" style={{ fontSize: 12, color: '#6B6359' }}>est. cost ${cost}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
//  COMPLETION BANNER
// ─────────────────────────────────────────────────────────────────────────
const CompletionBanner = ({ rows }: { rows: QueueRow[] }) => {
  const done = rows.filter(r => r.status === 'done')
  const mustListen = done.filter(r => (r.score ?? 0) >= 7).length
  const scannable = done.filter(r => (r.score ?? 0) >= 4 && (r.score ?? 0) < 7).length
  const failed = rows.filter(r => r.status === 'failed').length
  return (
    <div className="ing-banner dgs-fade-in" style={{ marginBottom: 20 }}>
      <div>
        <div className="dgs-eyebrow" style={{ color: '#C9B97E', marginBottom: 4 }}>Batch complete</div>
        <div className="ing-banner-scores">
          <span>{done.length} analyzed</span>
          {mustListen > 0 && <span style={{ color: '#C9B97E' }}>{mustListen} must-listen</span>}
          {scannable > 0 && <span style={{ color: '#B0A070' }}>{scannable} scannable</span>}
          {failed > 0 && <span style={{ color: '#E09090' }}>{failed} failed</span>}
        </div>
      </div>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#FFF8E7', textDecoration: 'none', fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,248,231,.3)', padding: '6px 14px', borderRadius: 2 }}>
        View today&apos;s digest <ChevronRight size={13} />
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
//  QUEUE ROW
// ─────────────────────────────────────────────────────────────────────────
const CATEGORIES = ['general', 'macro', 'markets', 'geopolitics', 'crypto', 'tech']

const QueueRowItem = ({
  row,
  onUpdate,
  onRemove,
  onRetry,
  onDupDecision,
}: {
  row: QueueRow
  onUpdate: (id: string, updates: Partial<QueueRow>) => void
  onRemove: (id: string) => void
  onRetry: (id: string) => void
  onDupDecision: (id: string, choice: 'reanalyze' | 'skip') => void
}) => {
  const editable = row.status === 'ready' || row.status === 'duplicate' || row.status === 'failed'
  return (
    <div>
      <div className="ing-row">
        {/* Status */}
        <div><StatusPill row={row} /></div>

        {/* Title */}
        <div style={{ minWidth: 0 }}>
          {editable ? (
            <input
              className="dgs-input"
              value={row.title}
              onChange={e => onUpdate(row.id, { title: e.target.value })}
              placeholder="Video title"
            />
          ) : (
            <div className="dgs-disp" style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.3, wordBreak: 'break-word' }}>
              {row.title}
            </div>
          )}
          {row.warnings.map((w, i) => (
            <div key={i} className="ing-warn" style={{ marginTop: 4 }}>
              <AlertCircle size={11} style={{ flexShrink: 0, marginTop: 1 }} /> {w}
            </div>
          ))}
          {row.status === 'failed' && row.error && (
            <div title={row.error} className="ing-err-text" style={{ marginTop: 3 }}>
              {row.error}
            </div>
          )}
        </div>

        {/* Channel */}
        <div>
          {editable ? (
            <input
              className="dgs-input"
              value={row.channel}
              onChange={e => onUpdate(row.id, { channel: e.target.value })}
              placeholder="Channel"
            />
          ) : (
            <span className="dgs-meta">{row.channel || '—'}</span>
          )}
        </div>

        {/* Duration */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {editable ? (
            <input
              className="dgs-input"
              type="number"
              min={1}
              value={row.duration}
              onChange={e => onUpdate(row.id, { duration: Number(e.target.value) || 1 })}
              style={{ width: 60 }}
            />
          ) : (
            <span className="dgs-mono" style={{ fontSize: 12.5 }}>{row.duration}m</span>
          )}
        </div>

        {/* Category */}
        <div>
          {editable ? (
            <select
              className="dgs-input"
              value={row.category}
              onChange={e => onUpdate(row.id, { category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <span className="dgs-meta">{row.category}</span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {row.status === 'failed' && (
            <button
              title="Retry"
              onClick={() => onRetry(row.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B1A1A', padding: 2 }}
            >
              <RefreshCw size={13} />
            </button>
          )}
          {!['analyzing', 'queued'].includes(row.status) && (
            <button
              title="Remove"
              onClick={() => onRemove(row.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B5AC95', padding: 2 }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Dedup prompt */}
      {row.status === 'duplicate' && (
        <div style={{ padding: '0 20px 12px 120px' }}>
          <div className="ing-dup-prompt">
            <AlertCircle size={12} style={{ flexShrink: 0, color: '#8B6A1A' }} />
            <span>Already triaged on <strong>{row.dupMatchDate}</strong>.</span>
            <button
              className="dgs-btn-ghost"
              style={{ padding: '3px 10px', fontSize: 12 }}
              onClick={() => onDupDecision(row.id, 'skip')}
            >
              <SkipForward size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
              Skip
            </button>
            <button
              className="dgs-btn-ghost"
              style={{ padding: '3px 10px', fontSize: 12 }}
              onClick={() => onDupDecision(row.id, 'reanalyze')}
            >
              <RefreshCw size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
              Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function IngestPage() {
  const [rows, setRows] = useState<QueueRow[]>([])
  const [profile, setProfile] = useState<FocusProfile | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dropErrors, setDropErrors] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keep refs in sync for use in async callbacks
  const rowsRef = useRef(rows)
  useEffect(() => { rowsRef.current = rows }, [rows])
  const profileRef = useRef(profile)
  useEffect(() => { profileRef.current = profile }, [profile])

  // Load profile on mount
  useEffect(() => {
    apiGetProfile().then(p => setProfile(p))
  }, [])

  // Restore queue from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY)
      if (!raw) return
      const saved: QueueRow[] = JSON.parse(raw)
      // Reset in-flight states to 'ready' per spec
      setRows(saved.map(r =>
        r.status === 'queued' || r.status === 'analyzing' ? { ...r, status: 'ready' } : r
      ))
    } catch { /* ignore corrupt data */ }
  }, [])

  // Persist queue to localStorage whenever it changes
  useEffect(() => {
    try {
      if (rows.length > 0) {
        // Don't persist vttContent for done/skipped rows — they're in main store
        const toSave = rows.map(r =>
          r.status === 'done' || r.status === 'skipped'
            ? { ...r, vttContent: '', plainTranscript: '' }
            : r
        )
        localStorage.setItem(QUEUE_KEY, JSON.stringify(toSave))
      } else {
        localStorage.removeItem(QUEUE_KEY)
      }
    } catch { /* quota exceeded — ignore */ }
  }, [rows])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const updateRow = useCallback((id: string, updates: Partial<QueueRow>) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [])

  const removeRow = useCallback((id: string) => {
    setRows(prev => prev.filter(r => r.id !== id))
    setDropErrors([])
  }, [])

  // ── VTT file processing ───────────────────────────────────────────────────
  const processFiles = useCallback((files: File[]) => {
    const errors: string[] = []
    setDropErrors([])

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.vtt')) {
        errors.push(`"${file.name}" rejected — only .vtt files are accepted`)
        continue
      }
      if (file.size > MAX_WARN_BYTES) {
        errors.push(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — this may be a wrong file type`)
      }

      const reader = new FileReader()
      reader.onload = e => {
        const content = e.target?.result as string
        const stats = parseVTTStats(content)

        if (stats.errors.length > 0) {
          setDropErrors(prev => [...prev, `"${file.name}": ${stats.errors.join('; ')}`])
          return
        }

        const row: QueueRow = {
          id: 'row-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          filename: file.name,
          title: cleanFilename(file.name),
          channel: '',
          duration: stats.durationMinutes,
          category: 'general',
          vttContent: content,
          plainTranscript: parseVTTToPlain(content),
          status: 'ready',
          addedAt: Date.now(),
          cueCount: stats.cueCount,
          wordCount: stats.wordCount,
          speakers: stats.speakers,
          warnings: stats.warnings,
        }
        setRows(prev => {
          // Deduplicate by filename
          if (prev.some(r => r.filename === file.name)) return prev
          return [...prev, row]
        })
      }
      reader.readAsText(file, 'utf-8')
    }

    if (errors.length > 0) setDropErrors(errors)
  }, [])

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragging(false), [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }, [processFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files))
    e.target.value = ''
  }, [processFiles])

  const handleBrowse = useCallback(() => fileInputRef.current?.click(), [])

  // ── Per-row actions ───────────────────────────────────────────────────────
  const processRow = useCallback(async (rowId: string) => {
    const row = rowsRef.current.find(r => r.id === rowId)
    const prof = profileRef.current
    if (!row || !prof) return

    updateRow(rowId, { status: 'analyzing', error: undefined })

    try {
      const result = await apiTriage({
        title: row.title,
        channel: row.channel || 'Unknown',
        duration: row.duration,
        category: row.category,
        transcript: row.plainTranscript.slice(0, 80000),
        profile: prof,
      })

      const video: Video = {
        id: 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        date: todayISO(),
        title: row.title,
        channel: row.channel,
        duration: row.duration,
        category: row.category,
        url: '',
        score: result.score,
        reasoning: result.reasoning,
        fullReport: {
          summary: result.summary,
          keyTakeaways: result.keyTakeaways,
          timestamps: result.timestamps,
        },
        addedAt: Date.now(),
      }

      await apiAppendVideo(video)
      updateRow(rowId, { status: 'done', score: result.score, videoId: video.id })
    } catch (err) {
      updateRow(rowId, { status: 'failed', error: classifyError(err) })
    }
  }, [updateRow])

  const retryRow = useCallback((rowId: string) => {
    processRow(rowId)
  }, [processRow])

  const dupDecision = useCallback((rowId: string, choice: 'reanalyze' | 'skip') => {
    if (choice === 'skip') {
      updateRow(rowId, { status: 'skipped' })
    } else {
      processRow(rowId)
    }
  }, [updateRow, processRow])

  // ── Analyze all ───────────────────────────────────────────────────────────
  const analyzeAll = useCallback(async () => {
    if (!profileRef.current || running) return
    setRunning(true)
    setDropErrors([])

    const currentRows = rowsRef.current.filter(r => r.status === 'ready')
    if (currentRows.length === 0) { setRunning(false); return }

    // Dedup check
    const existing = await apiGetVideos()
    const dupIds: { id: string; matchDate: string }[] = []
    const toProcessIds: string[] = []

    for (const row of currentRows) {
      const match = existing.find(v =>
        v.title.toLowerCase() === row.title.toLowerCase() ||
        (row.channel && v.channel.toLowerCase() === row.channel.toLowerCase() &&
         Math.abs(v.duration - row.duration) <= 1)
      )
      if (match) {
        dupIds.push({ id: row.id, matchDate: match.date })
      } else {
        toProcessIds.push(row.id)
      }
    }

    if (dupIds.length > 0) {
      setRows(prev => prev.map(r => {
        const dup = dupIds.find(d => d.id === r.id)
        return dup ? { ...r, status: 'duplicate', dupMatchDate: dup.matchDate } : r
      }))
    }

    if (toProcessIds.length > 0) {
      setRows(prev => prev.map(r =>
        toProcessIds.includes(r.id) ? { ...r, status: 'queued' } : r
      ))
      await runPool(toProcessIds, processRow)
    }

    setRunning(false)
  }, [running, processRow])

  // ── Derived state ─────────────────────────────────────────────────────────
  const readyCount = rows.filter(r => r.status === 'ready').length
  const allTerminal = rows.length > 0 &&
    rows.every(r => ['done', 'failed', 'skipped'].includes(r.status))
  const showBanner = allTerminal && rows.some(r => r.status === 'done')

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dgs-root">
      <style>{styleSheet}</style>
      <IngestHeader />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Page title */}
        <div className="dgs-eyebrow" style={{ color: '#8B1A1A' }}>Batch Ingest</div>
        <h1 className="dgs-disp" style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.1, marginTop: 6, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Import VTT Transcripts
        </h1>
        <p style={{ color: '#3F3A2E', fontSize: 14.5, lineHeight: 1.55, marginBottom: 28, maxWidth: 560 }}>
          Drop your TurboScribe <code style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>.vtt</code> exports. Each file is parsed, staged for review, then sent to the model in parallel.
        </p>

        {!profile && (
          <div className="dgs-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
            No focus profile found.{' '}
            <a href="/" className="dgs-link">Configure it in Focus settings</a> before analyzing.
          </div>
        )}

        {/* Cloud folder stub */}
        <div style={{ marginBottom: 16 }}>
          <CloudLinkStub />
        </div>

        {rows.length === 0 ? (
          /* ── Empty state ── */
          <DropZone
            compact={false}
            dragging={dragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onBrowse={handleBrowse}
            inputRef={fileInputRef}
            onFileInput={handleFileInput}
            dropErrors={dropErrors}
          />
        ) : (
          /* ── Queue ── */
          <div>
            {showBanner && <CompletionBanner rows={rows} />}

            <DropZone
              compact
              dragging={dragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onBrowse={handleBrowse}
              inputRef={fileInputRef}
              onFileInput={handleFileInput}
              dropErrors={dropErrors}
            />

            <div style={{ marginTop: 24 }}>
              <QueueSummaryBar rows={rows} />
              <div className="dgs-rule-thick" style={{ margin: '8px 0 0' }} />

              <div className="dgs-paper" style={{ marginTop: 0 }}>
                {/* Column headers */}
                <div className="ing-col-label">
                  <span>Status</span>
                  <span>Title</span>
                  <span>Channel</span>
                  <span>Min</span>
                  <span>Category</span>
                  <span />
                </div>

                {rows.map(row => (
                  <QueueRowItem
                    key={row.id}
                    row={row}
                    onUpdate={updateRow}
                    onRemove={removeRow}
                    onRetry={retryRow}
                    onDupDecision={dupDecision}
                  />
                ))}
              </div>

              {/* Action bar */}
              {!allTerminal && (
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={analyzeAll}
                    disabled={running || readyCount === 0 || !profile}
                    className="dgs-btn-primary"
                  >
                    {running ? (
                      <><Loader2 size={14} className="dgs-spinner" style={{ display: 'inline', verticalAlign: '-2px', marginRight: 8 }} />Analyzing…</>
                    ) : (
                      <>Analyze {readyCount > 0 ? readyCount : 'all'} {readyCount === 1 ? 'video' : 'videos'}</>
                    )}
                  </button>
                  <button
                    onClick={() => setRows([])}
                    className="dgs-btn-ghost"
                    disabled={running}
                  >
                    Clear all
                  </button>
                  <span className="dgs-meta">
                    {CONCURRENCY} workers · est. ${estimateCost(rows)}
                  </span>
                </div>
              )}

              {allTerminal && (
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => setRows([])} className="dgs-btn-ghost">
                    Clear queue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
