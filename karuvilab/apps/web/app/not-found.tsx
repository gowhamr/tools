import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 — Page not found | KaruviLab' }

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Page not found</h1>
      <p className="text-slate-500 mb-8 max-w-md leading-relaxed">We couldn&apos;t find the page you&apos;re looking for.</p>
      <Link href="/" className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-cta">
        ← Back to all tools
      </Link>
    </div>
  )
}
