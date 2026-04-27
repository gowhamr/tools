import Link from 'next/link'
import type { Tool } from '@/lib/tools'
import Badge from './Badge'
import { cn } from '@/lib/utils'

const categoryColors: Record<string, { bg: string; icon: string }> = {
  images:      { bg: 'bg-indigo-50',   icon: 'text-indigo-600' },
  pdf:         { bg: 'bg-rose-50',     icon: 'text-rose-600'   },
  developer:   { bg: 'bg-violet-50',   icon: 'text-violet-600' },
  calculators: { bg: 'bg-amber-50',    icon: 'text-amber-600'  },
}

interface ToolCardProps {
  tool: Tool
  className?: string
}

export default function ToolCard({ tool, className }: ToolCardProps) {
  const colors = categoryColors[tool.category] ?? { bg: 'bg-slate-100', icon: 'text-slate-600' }

  return (
    <Link
      href={tool.href}
      className={cn(
        'group flex items-center gap-4 px-4 py-3.5',
        'bg-white rounded-2xl border border-white/80',
        'shadow-[0_1px_4px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.04)]',
        'hover:shadow-[0_6px_20px_rgba(79,70,229,.13),0_0_0_1px_rgba(79,70,229,.10)]',
        'hover:-translate-y-0.5 active:scale-[.98]',
        'transition-all duration-200',
        className
      )}
    >
      {/* Icon square */}
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0',
        colors.bg, colors.icon
      )}>
        {tool.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[0.88rem] text-slate-900 group-hover:text-brand-700 transition-colors leading-tight">
            {tool.name}
          </span>
          {tool.badge && (
            <Badge label={tool.badge} variant={tool.badge as 'New' | 'Fast' | 'Popular'} />
          )}
        </div>
        <p className="text-[0.72rem] text-slate-400 mt-0.5 leading-tight truncate">
          {tool.shortDesc}
        </p>
      </div>

      {/* Arrow */}
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="text-slate-300 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
