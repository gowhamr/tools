'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Something went wrong</h1>
      <p className="text-slate-500 mb-8 max-w-md leading-relaxed">An unexpected error occurred. Your files were not uploaded anywhere.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={reset} className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors">Try again</button>
        <a href="/" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:border-brand-300 transition-colors">← Home</a>
      </div>
    </div>
  )
}
