'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import type { DiscordSource, DiscordMessageTimelineItem } from '@/lib/discord-intel/types'
import { DiscordIntelLayout } from './components/DiscordIntelLayout'
import { ChannelSidebar } from './components/ChannelSidebar'
import { TimelineToolbar, type ToolbarFilters } from './components/TimelineToolbar'
import { MessageList } from './components/MessageList'

const DEFAULT_FILTERS: ToolbarFilters = {
  q: '',
  from: '',
  to: '',
  hasAttachments: false,
  limit: 100,
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ts
  }
}

export function TimelineClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlChannelId = searchParams.get('channelId')

  const [sources, setSources] = useState<DiscordSource[]>([])
  const [loadingSources, setLoadingSources] = useState(true)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)

  const [messages, setMessages] = useState<DiscordMessageTimelineItem[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalApprox, setTotalApprox] = useState(0)
  const [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState<ToolbarFilters>(DEFAULT_FILTERS)

  // Mobile UI state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)

  // Scroll direction tracking with threshold to avoid jitter
  const lastScrollY = useRef(0)
  const scrollDelta = useRef(0)

  const latestFetchId = useRef(0)

  // ── Load sources ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoadingSources(true)
    fetch('/api/discord-intel/sources')
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        const items: DiscordSource[] = json.items ?? []
        setSources(items)
        setLoadingSources(false)

        const target = urlChannelId
          ? items.find(s => s.external_channel_id === urlChannelId)
          : items[0]
        if (target) setSelectedChannelId(target.external_channel_id)
      })
      .catch(() => setLoadingSources(false))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch messages ─────────────────────────────────────────────
  const fetchMessages = useCallback(
    async (channelId: string, f: ToolbarFilters, currentOffset: number, append: boolean) => {
      if (!channelId) return

      const fetchId = ++latestFetchId.current

      if (append) setLoadingMore(true)
      else setLoadingMessages(true)

      const params = new URLSearchParams()
      params.set('channelId', channelId)
      params.set('limit', String(f.limit))
      params.set('offset', String(currentOffset))
      if (f.q) params.set('q', f.q)
      if (f.from) params.set('from', f.from)
      if (f.to) params.set('to', f.to)
      if (f.hasAttachments) params.set('hasAttachments', 'true')

      try {
        const res = await fetch(`/api/discord-intel/messages?${params.toString()}`)
        const json = await res.json()

        if (fetchId !== latestFetchId.current) return

        const incoming: DiscordMessageTimelineItem[] = json.items ?? []
        if (append) {
          setMessages(prev => [...prev, ...incoming])
          setOffset(prev => prev + incoming.length)
        } else {
          setMessages(incoming)
          setOffset(incoming.length)
        }
        setTotalApprox(json.totalApprox ?? 0)
      } finally {
        if (fetchId === latestFetchId.current) {
          setLoadingMessages(false)
          setLoadingMore(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (!selectedChannelId) return
    fetchMessages(selectedChannelId, filters, 0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId, filters])

  // ── Handlers ──────────────────────────────────────────────────
  function handleSelectChannel(channelId: string) {
    setSelectedChannelId(channelId)
    setDrawerOpen(false)
    setHeaderHidden(false)
    lastScrollY.current = 0
    scrollDelta.current = 0
    const params = new URLSearchParams(searchParams.toString())
    params.set('channelId', channelId)
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleLoadMore() {
    if (!selectedChannelId) return
    fetchMessages(selectedChannelId, filters, offset, true)
  }

  function handleRefresh() {
    if (!selectedChannelId) return
    fetchMessages(selectedChannelId, filters, 0, false)
  }

  // Accumulate scroll delta in each direction; flip state after 40px threshold
  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const y = e.currentTarget.scrollTop
    const delta = y - lastScrollY.current
    lastScrollY.current = y

    if (delta > 0) {
      scrollDelta.current = Math.max(0, scrollDelta.current) + delta
      if (scrollDelta.current > 40) {
        scrollDelta.current = 0
        setHeaderHidden(true)
      }
    } else {
      scrollDelta.current = Math.min(0, scrollDelta.current) + delta
      if (scrollDelta.current < -40) {
        scrollDelta.current = 0
        setHeaderHidden(false)
      }
    }
  }

  // ── Derived ───────────────────────────────────────────────────
  const selectedSource = sources.find(s => s.external_channel_id === selectedChannelId) ?? null
  const channelName = selectedSource?.channel_name_clean ?? selectedChannelId ?? ''
  const serverName = selectedSource?.server_name_clean ?? ''

  // Only hide on mobile (CSS handles this, but we still apply the class)
  // Don't hide while drawer or filters panel is open
  const shouldHideHeader = headerHidden && !drawerOpen && !filtersOpen

  // ── Render ────────────────────────────────────────────────────
  const sidebar = (
    <ChannelSidebar
      sources={sources}
      loading={loadingSources}
      selectedId={selectedChannelId}
      onSelect={handleSelectChannel}
      isOpen={drawerOpen}
      onClose={() => setDrawerOpen(false)}
    />
  )

  const main = (
    <div className="dc-main">
      {selectedChannelId ? (
        <>
          {/* Sticky wrapper — collapses on mobile when scrolling down */}
          <div className={`dc-mob-sticky${shouldHideHeader ? ' dc-scroll-hidden' : ''}`}>

            {/* Mobile top bar (hidden on desktop via CSS) */}
            <div className="dc-mob-topbar">
              <button
                className="dc-mob-menu-btn"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open channel list"
              >
                <Menu size={20} />
              </button>
              <span className="dc-mob-ch-name">#{channelName}</span>
              {selectedSource && (
                <span className="dc-mob-meta">
                  {selectedSource.message_count.toLocaleString()} msgs
                </span>
              )}
            </div>

            {/* Desktop channel header (hidden on mobile via CSS) */}
            <div className="dc-ch-header">
              <span className="dc-ch-header-hash">#</span>
              <span className="dc-ch-header-name">{channelName}</span>
              {serverName && (
                <>
                  <span className="dc-ch-header-sep">·</span>
                  <span className="dc-ch-header-server">{serverName}</span>
                </>
              )}
              {selectedSource && (
                <span className="dc-ch-header-meta">
                  {selectedSource.message_count.toLocaleString()} msgs
                  {selectedSource.last_message_at
                    ? ` · ${formatTimestamp(selectedSource.last_message_at)}`
                    : ''}
                </span>
              )}
            </div>

            {/* Filter toolbar */}
            <TimelineToolbar
              filters={filters}
              onChange={f => setFilters(f)}
              onRefresh={handleRefresh}
              loading={loadingMessages}
              filtersOpen={filtersOpen}
              onToggleFilters={() => setFiltersOpen(v => !v)}
            />
          </div>

          {/* Messages */}
          <MessageList
            messages={messages}
            loading={loadingMessages}
            loadingMore={loadingMore}
            totalApprox={totalApprox}
            channelName={channelName}
            onLoadMore={handleLoadMore}
            onScroll={handleScroll}
          />
        </>
      ) : (
        <div className="dc-no-channel">
          {loadingSources ? 'Loading channels…' : 'Select a channel from the sidebar.'}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Overlay for mobile drawer */}
      <div
        className={`dc-drawer-overlay${drawerOpen ? ' dc-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <DiscordIntelLayout sidebar={sidebar} main={main} />
    </>
  )
}
