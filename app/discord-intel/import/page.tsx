'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { Upload, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import type { ImportSummary } from '@/lib/discord-intel/types'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@200..800&family=JetBrains+Mono:wght@400..700&display=swap');

  .di-root {
    font-family: 'Inter Tight', system-ui, sans-serif;
    background: #F4EFE3;
    color: #1A1814;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  .di-wrap {
    max-width: 680px;
    margin: 0 auto;
    padding: 48px 24px;
  }
  .di-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 500;
    color: #8B1A1A;
  }
  .di-title {
    font-size: 28px;
    font-weight: 300;
    letter-spacing: -0.02em;
    margin: 8px 0 4px;
  }
  .di-sub {
    font-size: 14px;
    color: #6B6359;
    margin-bottom: 40px;
  }
  .di-rule { border: none; border-top: 2px solid #8B1A1A; margin-bottom: 40px; }

  .di-drop {
    border: 2px dashed #D4CCB6;
    border-radius: 6px;
    background: #FFFDF7;
    padding: 48px 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    position: relative;
  }
  .di-drop:hover, .di-drop.drag-over {
    border-color: #8B1A1A;
    background: #FAF4E2;
  }
  .di-drop input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
  .di-drop-icon { color: #8B1A1A; margin-bottom: 12px; }
  .di-drop-label {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  .di-drop-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #9B8E7A;
    letter-spacing: 0.05em;
  }
  .di-file-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    background: #F0E8D0;
    padding: 6px 12px;
    border-radius: 3px;
    margin-top: 12px;
    display: inline-block;
    color: #3F3A2E;
  }

  .di-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
    padding: 11px 24px;
    background: #8B1A1A;
    color: #FFF8E7;
    border: none;
    border-radius: 3px;
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: background 0.15s;
  }
  .di-btn:hover:not(:disabled) { background: #6F1414; }
  .di-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .di-card {
    background: #FFFDF7;
    border: 1px solid #E5DDC8;
    border-radius: 6px;
    padding: 28px;
    margin-top: 32px;
    box-shadow: 0 1px 0 rgba(26,24,20,0.04), 0 8px 24px -12px rgba(63,58,46,0.15);
  }
  .di-card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .di-card-title.success { color: #1A5C1A; }
  .di-card-title.error { color: #8B1A1A; }

  .di-stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
  .di-stat {
    background: #F4EFE3;
    border-radius: 4px;
    padding: 12px 14px;
  }
  .di-stat-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9B8E7A;
    margin-bottom: 4px;
  }
  .di-stat-value {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #1A1814;
  }
  .di-stat-value.accent { color: #8B1A1A; }

  .di-channel-info {
    border-top: 1px solid #E5DDC8;
    padding-top: 16px;
    margin-bottom: 20px;
    font-size: 13px;
    color: #6B6359;
    line-height: 1.6;
  }
  .di-channel-info strong { color: #1A1814; }

  .di-errors {
    background: #FFF3F3;
    border: 1px solid #E8C8C8;
    border-radius: 4px;
    padding: 12px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #8B1A1A;
    line-height: 1.6;
    margin-bottom: 16px;
    white-space: pre-wrap;
    max-height: 160px;
    overflow-y: auto;
  }

  .di-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #8B1A1A;
    text-decoration: none;
    letter-spacing: 0.01em;
  }
  .di-link:hover { text-decoration: underline; }

  .di-error-msg {
    background: #FFF3F3;
    border: 1px solid #E8C8C8;
    border-radius: 4px;
    padding: 14px 16px;
    font-size: 13px;
    color: #8B1A1A;
    margin-top: 20px;
  }
`

export default function DiscordIntelImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(f: File | null) {
    if (!f) return
    setFile(f)
    setSummary(null)
    setApiError(null)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setSummary(null)
    setApiError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/discord-intel/import', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        setApiError(json.error ?? `Server error ${res.status}`)
      } else {
        setSummary(json.data as ImportSummary)
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="di-root">
        <div className="di-wrap">
          <p className="di-eyebrow">Discord Intel</p>
          <h1 className="di-title">Import Archive</h1>
          <p className="di-sub">Upload a .jsonl export from your Chrome extension to ingest messages into Supabase.</p>
          <hr className="di-rule" />

          <div
            className={`di-drop${dragOver ? ' drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              handleFileChange(e.dataTransfer.files[0] ?? null)
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".jsonl,.ndjson"
              onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <div className="di-drop-icon">
              <Upload size={32} />
            </div>
            <p className="di-drop-label">
              {file ? 'File selected' : 'Drop file here or click to browse'}
            </p>
            <p className="di-drop-hint">.jsonl or .ndjson · one channel per file</p>
            {file && (
              <span className="di-file-name">{file.name}</span>
            )}
          </div>

          <button
            className="di-btn"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
            {loading ? 'Importing…' : 'Import File'}
          </button>

          {apiError && (
            <div className="di-error-msg">
              <strong>Import failed:</strong> {apiError}
            </div>
          )}

          {summary && (
            <div className="di-card">
              <div className={`di-card-title ${summary.errors.length === 0 ? 'success' : 'error'}`}>
                {summary.errors.length === 0
                  ? <><CheckCircle2 size={18} /> Import complete</>
                  : <><AlertCircle size={18} /> Import finished with warnings</>
                }
              </div>

              <div className="di-channel-info">
                <strong>{summary.serverName}</strong> / {summary.channelName}
                <br />
                Run ID: <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{summary.runId.slice(0, 48)}{summary.runId.length > 48 ? '…' : ''}</span>
              </div>

              <div className="di-stat-grid">
                <div className="di-stat">
                  <div className="di-stat-label">Declared</div>
                  <div className="di-stat-value">{summary.declaredCount}</div>
                </div>
                <div className="di-stat">
                  <div className="di-stat-label">Parsed</div>
                  <div className="di-stat-value">{summary.parsedCount}</div>
                </div>
                <div className="di-stat">
                  <div className="di-stat-label">Inserted / Updated</div>
                  <div className="di-stat-value accent">{summary.insertedOrUpdatedCount}</div>
                </div>
                <div className="di-stat">
                  <div className="di-stat-label">Duplicates</div>
                  <div className="di-stat-value">{summary.duplicateCount}</div>
                </div>
                <div className="di-stat">
                  <div className="di-stat-label">Attachments</div>
                  <div className="di-stat-value">{summary.attachmentCount}</div>
                </div>
                <div className="di-stat">
                  <div className="di-stat-label">Parse Errors</div>
                  <div className="di-stat-value">{summary.errors.length}</div>
                </div>
              </div>

              {summary.errors.length > 0 && (
                <div className="di-errors">{summary.errors.join('\n')}</div>
              )}

              <Link
                href={`/discord-intel/timeline?channelId=${summary.externalChannelId}`}
                className="di-link"
              >
                View timeline <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
