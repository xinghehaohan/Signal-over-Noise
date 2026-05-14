import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discord Intel — Signal over Noise',
  description: 'Browse and search Discord channel archives.',
}

const HDR_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@200..800&family=JetBrains+Mono:wght@400..700&display=swap');

  .di-hdr {
    height: 48px;
    background: #1e1a16;
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 10px;
    position: sticky;
    top: 0;
    z-index: 200;
    flex-shrink: 0;
    border-bottom: 1px solid #2a2420;
    font-family: 'Inter Tight', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .di-hdr-brand {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: #5a4f44;
    white-space: nowrap;
    text-decoration: none;
    transition: color 0.12s;
    flex-shrink: 0;
  }
  .di-hdr-brand:hover { color: #9b8e7a; }

  .di-hdr-divider {
    font-size: 16px;
    color: #2e2820;
    flex-shrink: 0;
    user-select: none;
    line-height: 1;
    margin: 0 2px;
  }

  .di-hdr-section {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 600;
    color: #f5ede0;
    letter-spacing: -0.01em;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .di-hdr-dot {
    width: 5px;
    height: 5px;
    background: #8b1a1a;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .di-hdr-nav {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  .di-hdr-link {
    font-size: 12px;
    font-weight: 500;
    color: #514640;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 3px;
    transition: color 0.12s, background 0.12s;
    white-space: nowrap;
    letter-spacing: 0.01em;
  }
  .di-hdr-link:hover {
    color: #c4b89a;
    background: rgba(255,255,255,0.05);
  }

  .di-hdr-link-primary {
    font-size: 12px;
    font-weight: 600;
    color: #8b7a6a;
    text-decoration: none;
    padding: 5px 12px;
    border-radius: 3px;
    border: 1px solid #2e2820;
    transition: color 0.12s, background 0.12s, border-color 0.12s;
    white-space: nowrap;
    letter-spacing: 0.01em;
    margin-left: 6px;
  }
  .di-hdr-link-primary:hover {
    color: #f5ede0;
    background: rgba(255,255,255,0.05);
    border-color: #4a3e34;
  }

  .di-body {
    height: calc(100vh - 48px);
    overflow-x: hidden;
    overflow-y: auto;
  }

  @media (max-width: 680px) {
    .di-hdr { padding: 0 14px; }
    .di-hdr-brand { display: none; }
    .di-hdr-divider { display: none; }
    .di-hdr-link-primary { margin-left: 0; }
  }
`

export default function DiscordIntelSectionLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{HDR_CSS}</style>
      <header className="di-hdr">
        <Link href="/" className="di-hdr-brand">Signal over Noise</Link>
        <span className="di-hdr-divider">/</span>
        <span className="di-hdr-section">
          <span className="di-hdr-dot" />
          Discord Intel
        </span>
        <nav className="di-hdr-nav">
          <Link href="/discord-intel/import" className="di-hdr-link">Import</Link>
          <Link href="/digest" className="di-hdr-link-primary">Video Digest</Link>
        </nav>
      </header>
      <div className="di-body">{children}</div>
    </>
  )
}
