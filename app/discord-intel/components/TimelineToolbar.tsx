import React from 'react'
import { RefreshCw, Loader2, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'

export interface ToolbarFilters {
  q: string
  from: string
  to: string
  hasAttachments: boolean
  limit: number
}

interface TimelineToolbarProps {
  filters: ToolbarFilters
  onChange: (f: ToolbarFilters) => void
  onRefresh: () => void
  loading: boolean
  filtersOpen?: boolean
  onToggleFilters?: () => void
}

const LIMIT_OPTIONS = [50, 100, 200]

export function TimelineToolbar({
  filters,
  onChange,
  onRefresh,
  loading,
  filtersOpen,
  onToggleFilters,
}: TimelineToolbarProps) {
  function set<K extends keyof ToolbarFilters>(key: K, value: ToolbarFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="dc-toolbar">
      {/* Mobile-only toggle header */}
      {onToggleFilters && (
        <button className="dc-tb-mobile-header" onClick={onToggleFilters} aria-expanded={filtersOpen}>
          <span className="dc-tb-mobile-header-label">
            <SlidersHorizontal size={13} />
            Filters
          </span>
          {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}

      {/* Filter body — display:contents on desktop, collapsible on mobile */}
      <div className={`dc-tb-body${filtersOpen ? ' dc-open' : ''}`}>
        <div className="dc-tb-group">
          <span className="dc-tb-lbl">Search</span>
          <input
            type="text"
            className="dc-tb-input dc-tb-input-lg"
            placeholder="Filter by content…"
            value={filters.q}
            onChange={e => set('q', e.target.value)}
          />
        </div>

        <div className="dc-tb-group">
          <span className="dc-tb-lbl">From</span>
          <input
            type="date"
            className="dc-tb-input dc-tb-input-md"
            value={filters.from}
            onChange={e => set('from', e.target.value)}
          />
        </div>

        <div className="dc-tb-group">
          <span className="dc-tb-lbl">To</span>
          <input
            type="date"
            className="dc-tb-input dc-tb-input-md"
            value={filters.to}
            onChange={e => set('to', e.target.value)}
          />
        </div>

        <div className="dc-tb-group">
          <span className="dc-tb-lbl">Limit</span>
          <select
            className="dc-tb-input dc-tb-input-sm"
            value={filters.limit}
            onChange={e => set('limit', parseInt(e.target.value, 10))}
          >
            {LIMIT_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <label className="dc-tb-check">
          <input
            type="checkbox"
            checked={filters.hasAttachments}
            onChange={e => set('hasAttachments', e.target.checked)}
          />
          Has media
        </label>

        <button
          className="dc-tb-btn"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh"
        >
          {loading
            ? <Loader2 size={13} className="dc-spin" />
            : <RefreshCw size={13} />
          }
          Refresh
        </button>
      </div>
    </div>
  )
}
