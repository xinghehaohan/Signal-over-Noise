export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@200..800&family=JetBrains+Mono:wght@400..700&display=swap');

  /* ─── Layout shell ───────────────────────── */
  .dc-layout {
    display: flex;
    height: 100%;
    overflow: hidden;
    font-family: 'Inter Tight', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* ─── Sidebar ────────────────────────────── */
  .dc-sidebar {
    width: 260px;
    min-width: 260px;
    background: #f4efe3;
    border-right: 1px solid #d8ccb6;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .dc-sb-header {
    height: 48px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: #eee6d6;
    border-bottom: 1px solid #d8ccb6;
    flex-shrink: 0;
  }
  .dc-sb-title {
    font-size: 13px;
    font-weight: 700;
    color: #2b2118;
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dc-sb-action {
    color: #8a7a65;
    display: flex;
    align-items: center;
    gap: 4px;
    text-decoration: none;
    font-size: 12px;
    flex-shrink: 0;
    transition: color 0.1s, background 0.1s;
    padding: 4px;
    border-radius: 3px;
  }
  .dc-sb-action:hover { color: #2b2118; background: rgba(43,33,24,0.07); }

  .dc-sb-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0 16px;
  }
  .dc-sb-scroll::-webkit-scrollbar { width: 3px; }
  .dc-sb-scroll::-webkit-scrollbar-thumb { background: #d8ccb6; border-radius: 3px; }

  .dc-sb-loading {
    padding: 24px 16px;
    text-align: center;
    font-size: 12px;
    color: #8a7a65;
  }
  .dc-sb-empty {
    padding: 24px 16px;
    text-align: center;
    font-size: 12px;
    color: #8a7a65;
    line-height: 1.6;
  }

  /* ─── Channel tree ───────────────────────── */
  .dc-server-group { margin-bottom: 4px; }

  .dc-server-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8a7a65;
    padding: 14px 8px 4px 14px;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 3px;
    cursor: default;
  }

  .dc-category-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #a09080;
    padding: 8px 8px 3px 14px;
    user-select: none;
  }

  .dc-ch-item {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px 4px 10px;
    margin: 1px 6px;
    border-radius: 3px;
    cursor: pointer;
    color: #5a4d40;
    transition: background 0.08s, color 0.08s;
    min-width: 0;
    border-left: 2px solid transparent;
  }
  .dc-ch-item:hover { background: #f7f1e6; color: #2b2118; }
  .dc-ch-item.dc-selected {
    background: #eadfc9;
    color: #2b2118;
    border-left-color: #9e1b1b;
  }

  .dc-ch-hash {
    font-size: 15px;
    opacity: 0.45;
    flex-shrink: 0;
    line-height: 1;
    margin-top: -1px;
  }
  .dc-ch-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }
  .dc-ch-badge {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    background: #e5dcc8;
    padding: 1px 5px;
    border-radius: 8px;
    color: #8a7a65;
    flex-shrink: 0;
  }
  .dc-ch-item.dc-selected .dc-ch-badge {
    background: #9e1b1b;
    color: #fff8e7;
  }

  /* ─── Main panel ─────────────────────────── */
  .dc-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f4efe3;
    min-width: 0;
    color: #1A1814;
  }

  /* Desktop channel header */
  .dc-ch-header {
    height: 48px;
    background: #fffdf7;
    border-bottom: 1px solid #e5ddc8;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    box-shadow: 0 1px 0 rgba(26,24,20,0.04);
  }
  .dc-ch-header-hash {
    font-size: 20px;
    color: #c4b89a;
    line-height: 1;
    flex-shrink: 0;
  }
  .dc-ch-header-name {
    font-size: 15px;
    font-weight: 600;
    color: #1A1814;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dc-ch-header-sep { color: #d4ccb6; font-size: 16px; flex-shrink: 0; }
  .dc-ch-header-server {
    font-size: 13px;
    color: #9b8e7a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
  .dc-ch-header-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #c4b89a;
    flex-shrink: 0;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  /* ─── Mobile sticky wrapper ──────────────── */
  .dc-mob-sticky {
    flex-shrink: 0;
  }

  /* ─── Mobile top bar (hidden on desktop) ─── */
  .dc-mob-topbar {
    display: none;
  }
  .dc-mob-menu-btn {
    background: none;
    border: none;
    color: #5a4d40;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 3px;
    flex-shrink: 0;
    transition: color 0.1s, background 0.1s;
  }
  .dc-mob-menu-btn:hover { color: #2b2118; background: rgba(43,33,24,0.06); }
  .dc-mob-ch-name {
    font-size: 14px;
    font-weight: 600;
    color: #2b2118;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dc-mob-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #c4b89a;
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* ─── Toolbar ────────────────────────────── */
  .dc-toolbar {
    background: #fffdf7;
    border-bottom: 1px solid #ede7d4;
    padding: 6px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
  }
  .dc-tb-group { display: flex; flex-direction: column; gap: 2px; }
  .dc-tb-lbl {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #b5a893;
  }
  .dc-tb-input {
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 12px;
    padding: 5px 9px;
    background: #f4efe3;
    border: 1px solid #d4ccb6;
    border-radius: 3px;
    color: #1A1814;
    outline: none;
    height: 28px;
  }
  .dc-tb-input:focus { border-color: #8b1a1a; }
  .dc-tb-input-lg { min-width: 160px; }
  .dc-tb-input-md { width: 110px; }
  .dc-tb-input-sm { width: 64px; }
  .dc-tb-check {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #6b6359;
    cursor: pointer;
    user-select: none;
    padding: 5px 0;
    height: 28px;
  }
  .dc-tb-check input { accent-color: #8b1a1a; cursor: pointer; width: 13px; height: 13px; }
  .dc-tb-btn {
    padding: 0 14px;
    height: 28px;
    background: #8b1a1a;
    color: #fff8e7;
    border: none;
    border-radius: 3px;
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background 0.12s;
    flex-shrink: 0;
  }
  .dc-tb-btn:hover:not(:disabled) { background: #6f1414; }
  .dc-tb-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Mobile filter toggle — hidden on desktop */
  .dc-tb-mobile-header {
    display: none;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: #5a4d40;
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 600;
    height: 38px;
  }
  .dc-tb-mobile-header-label {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* Transparent on desktop — children join toolbar's flex directly */
  .dc-tb-body {
    display: contents;
  }

  /* ─── Messages area ──────────────────────── */
  .dc-msgs-wrap {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2px 0 32px;
  }
  .dc-msgs-wrap::-webkit-scrollbar { width: 6px; }
  .dc-msgs-wrap::-webkit-scrollbar-thumb { background: #d4ccb6; border-radius: 4px; }

  .dc-msgs-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #c4b89a;
    padding: 2px 16px 4px;
    letter-spacing: 0.04em;
  }

  /* Date separator */
  .dc-date-sep {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #c4b89a;
    letter-spacing: 0.06em;
    user-select: none;
  }
  .dc-date-sep-line { flex: 1; border-top: 1px solid #ede7d4; }

  /* ─── Message row ────────────────────────── */
  .dc-msg-row {
    display: flex;
    gap: 10px;
    padding: 2px 16px;
    transition: background 0.07s;
  }
  .dc-msg-row:hover { background: rgba(26,24,20,0.04); }

  .dc-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    margin-top: 2px;
    user-select: none;
  }

  .dc-msg-body { flex: 1; min-width: 0; padding: 1px 0; }

  .dc-msg-header {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 1px;
    flex-wrap: wrap;
  }
  .dc-msg-author {
    font-size: 13px;
    font-weight: 600;
    color: #1a1814;
    line-height: 1;
  }
  .dc-msg-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #c4b89a;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  .dc-msg-content {
    font-size: 14px;
    line-height: 1.5;
    color: #2a2520;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .dc-msg-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin-top: 2px;
  }
  .dc-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 5px;
    border-radius: 2px;
    font-weight: 600;
  }
  .dc-badge-everyone { background: #ede8f5; color: #5c3d8b; }
  .dc-badge-pinned   { background: #f5ebd8; color: #7a4a0f; }
  .dc-badge-edited   { background: #f0ede6; color: #9b8e7a; }

  /* ─── Attachments ────────────────────────── */
  .dc-atts { margin-top: 4px; display: flex; flex-direction: column; gap: 4px; }

  .dc-att-img-wrap {
    display: inline-block;
    line-height: 0;
    border-radius: 4px;
    overflow: hidden;
    background: #e5ddc8;
    max-width: 420px;
  }
  .dc-att-img {
    display: block;
    max-width: 420px;
    max-height: 320px;
    width: auto;
    height: auto;
    object-fit: contain;
    cursor: pointer;
    transition: opacity 0.12s;
  }
  .dc-att-img:hover { opacity: 0.9; }
  .dc-att-img-cap {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #9b8e7a;
    margin-top: 3px;
    max-width: 420px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1;
  }

  .dc-att-file {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #fffdf7;
    border: 1px solid #e5ddc8;
    border-radius: 4px;
    max-width: 420px;
  }
  .dc-att-file-icon { color: #8b1a1a; flex-shrink: 0; }
  .dc-att-file-info { flex: 1; min-width: 0; }
  .dc-att-file-name {
    font-size: 13px;
    font-weight: 500;
    color: #1a1814;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dc-att-file-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #9b8e7a;
    margin-top: 2px;
  }
  .dc-att-link {
    color: #8b1a1a;
    text-decoration: none;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .dc-att-link:hover { text-decoration: underline; }

  /* ─── Load more / empty ──────────────────── */
  .dc-load-more { text-align: center; padding: 8px 16px 16px; }
  .dc-load-more-btn {
    padding: 7px 20px;
    background: transparent;
    border: 1px solid #d4ccb6;
    border-radius: 3px;
    font-family: 'Inter Tight', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #6b6359;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: border-color 0.12s, color 0.12s;
  }
  .dc-load-more-btn:hover { border-color: #8b1a1a; color: #8b1a1a; }

  .dc-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 240px;
    padding: 40px;
    text-align: center;
    color: #9b8e7a;
  }
  .dc-empty-title { font-size: 15px; font-weight: 500; color: #6b6359; margin-bottom: 8px; }
  .dc-empty-sub { font-size: 13px; line-height: 1.5; }

  .dc-no-channel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9b8e7a;
    font-size: 14px;
    text-align: center;
    padding: 40px;
  }

  /* ─── Spinner ────────────────────────────── */
  @keyframes dc-spin { to { transform: rotate(360deg); } }
  .dc-spin { animation: dc-spin 0.9s linear infinite; }

  /* ─── Drawer overlay ─────────────────────── */
  .dc-drawer-overlay {
    display: none;
    position: fixed;
    top: 48px;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(43,33,24,0.38);
    z-index: 99;
    cursor: pointer;
  }
  .dc-drawer-overlay.dc-open { display: block; }

  /* ─── Mobile ─────────────────────────────── */
  @media (max-width: 680px) {
    .dc-layout {
      flex-direction: column;
      position: relative;
    }

    /* Sidebar becomes fixed left drawer, starting below site header */
    .dc-sidebar {
      position: fixed;
      left: 0; top: 48px; bottom: 0;
      width: 270px;
      min-width: 0;
      z-index: 100;
      transform: translateX(-100%);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .dc-sidebar.dc-open {
      transform: translateX(0);
      box-shadow: 6px 0 28px rgba(43,33,24,0.2);
    }

    /* Desktop channel header replaced by mobile topbar */
    .dc-ch-header { display: none; }

    /* Mobile top bar */
    .dc-mob-topbar {
      display: flex;
      height: 48px;
      background: #fffdf7;
      border-bottom: 1px solid #e5ddc8;
      padding: 0 14px;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    /* Sticky header collapses on scroll-down */
    .dc-mob-sticky {
      overflow: hidden;
      transition: max-height 0.28s ease;
      max-height: 240px;
    }
    .dc-mob-sticky.dc-scroll-hidden {
      max-height: 0;
    }

    /* Toolbar switches to column layout with toggle header */
    .dc-toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      padding: 0 14px;
    }
    .dc-tb-mobile-header {
      display: flex;
    }
    .dc-tb-body {
      display: none;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      padding-bottom: 10px;
      width: 100%;
    }
    .dc-tb-body.dc-open {
      display: flex;
    }

    .dc-main { flex: 1; min-height: 0; }
    .dc-msg-row { padding: 3px 12px; }

    /* Prevent attachment elements from exceeding viewport width */
    .dc-att-img-wrap { max-width: 100%; }
    .dc-att-img { max-width: 100%; }
    .dc-att-img-cap { max-width: 100%; }
    .dc-att-file { max-width: 100%; }
  }
`
