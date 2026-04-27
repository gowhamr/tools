'use client'

import { useState, useMemo } from 'react'
import type { Tool, ToolCategory } from '@/lib/tools'
import { CATEGORIES } from '@/lib/tools'
import ToolCard from './ToolCard'

interface ToolGridProps {
  tools: Tool[]
}

export default function ToolGrid({ tools }: ToolGridProps) {
  const [query, setQuery]   = useState('')
  const [active, setActive] = useState<ToolCategory | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tools.filter(t => {
      const matchCat = active === 'all' || t.category === active
      if (!q) return matchCat
      return matchCat && (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q))
      )
    })
  }, [tools, query, active])

  const byCategory = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      tools: filtered.filter(t => t.category === cat.id),
    })).filter(c => c.tools.length > 0)
  }, [filtered])

  return (
    <div className="space-y-5">
      {/* ── Search + Filter bar ───────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/80 backdrop-blur border border-white shadow-sm rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {[{ id: 'all', label: 'All', icon: '✦' }, ...CATEGORIES].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id as ToolCategory | 'all')}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                active === cat.id
                  ? 'bg-brand-600 text-white shadow-cta'
                  : 'bg-white/80 border border-white text-slate-600 hover:bg-white hover:border-brand-200 hover:text-brand-700',
              ].join(' ')}
            >
              <span className="text-sm leading-none">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No tools match &quot;{query}&quot;</p>
          <button
            onClick={() => { setQuery(''); setActive('all') }}
            className="mt-3 text-sm text-brand-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        byCategory.map(cat => (
          <section key={cat.id}>
            {/* ALL CAPS category header matching reference design */}
            <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
              {cat.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {cat.tools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
