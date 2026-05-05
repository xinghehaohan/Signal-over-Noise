'use client'

import { useEffect, useState } from 'react'

interface Chatlog {
  filename: string
  label: string
}

export default function ChatlogsPage() {
  const [chatlogs, setChatlogs] = useState<Chatlog[]>([])
  const [active, setActive] = useState<Chatlog | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/chatlogs')
      .then(r => r.json())
      .then((data: Chatlog[]) => {
        setChatlogs(data)
        if (data.length > 0) setActive(data[0])
      })
  }, [])

  const iframeSrc = active
    ? `/api/chatlogs/${encodeURIComponent(active.filename)}`
    : ''

  return (
    <>
      <style>{`
        .cl-layout { display: flex; height: 100dvh; font-family: system-ui, sans-serif; background: #18191c; }
        .cl-sidebar {
          width: 220px; flex-shrink: 0; background: #2b2d31;
          display: flex; flex-direction: column;
          border-right: 1px solid #3a3d43;
          position: fixed; top: 0; height: 100dvh; z-index: 20;
          transition: left 0.2s;
        }
        .cl-topbar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #2b2d31; border-bottom: 1px solid #3a3d43; }
        .cl-topbar-toggle { display: flex; }
        @media (min-width: 640px) {
          .cl-sidebar { position: relative; left: 0 !important; }
          .cl-topbar-toggle { display: none; }
        }
      `}</style>

      <div className="cl-layout">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10 }}
          />
        )}

        <aside className="cl-sidebar" style={{ left: sidebarOpen ? 0 : -220 }}>
          <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #3a3d43' }}>
            <a href="/" style={{ color: '#b5bac1', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              ← Signal over Noise
            </a>
          </div>
          <div style={{ padding: '12px 12px 8px', color: '#b5bac1', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Chat Logs
          </div>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0 6px 12px' }}>
            {chatlogs.map(log => (
              <button
                key={log.filename}
                onClick={() => { setActive(log); setSidebarOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 10px', marginBottom: 2, borderRadius: 6,
                  border: 'none', cursor: 'pointer',
                  background: active?.filename === log.filename ? '#404249' : 'transparent',
                  color: active?.filename === log.filename ? '#e5e7eb' : '#b5bac1',
                  fontSize: 14,
                  fontWeight: active?.filename === log.filename ? 600 : 400,
                }}
              >
                # {log.label}
              </button>
            ))}
          </nav>
        </aside>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="cl-topbar">
            <span className="cl-topbar-toggle">
              <button
                onClick={() => setSidebarOpen(s => !s)}
                style={{ background: 'none', border: 'none', color: '#b5bac1', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
            </span>
            <a href="/" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none' }}>← Signal over Noise</a>
            <span style={{ color: '#3a3d43' }}>/</span>
            <span style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>
              {active ? `# ${active.label}` : 'Chat Logs'}
            </span>
          </div>

          {iframeSrc && (
            <iframe
              key={iframeSrc}
              src={iframeSrc}
              style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
              title={active?.label}
            />
          )}
        </div>
      </div>
    </>
  )
}
