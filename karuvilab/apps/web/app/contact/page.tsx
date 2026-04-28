import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact — KaruviLab',
  description: 'Get in touch with KaruviLab.',
}

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-purple-700 text-white px-4 sm:px-8 py-12">
        <div className="max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-4 transition-colors">← All tools</Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-brand-100 text-lg leading-relaxed">Have a question, found a bug, or want to request a new tool?</p>
        </div>
      </section>
      <div className="container-app py-12 max-w-3xl space-y-8">
        <section className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Get in touch</h2>
          <p className="text-sm text-slate-500 leading-relaxed">We typically respond within 1–2 business days.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1">General &amp; Support</p>
              <a href="mailto:hello@karuvilab.com" className="text-sm font-semibold text-brand-700 hover:underline">hello@karuvilab.com</a>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Response Time</p>
              <p className="text-sm font-semibold text-slate-700">1–2 business days</p>
            </div>
          </div>
        </section>
        <section className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <h2 className="font-bold text-slate-900 mb-2">Before you write…</h2>
          <p className="text-sm text-slate-500 mb-3">Your question may already be answered in our guides.</p>
          <Link href="/guides" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline">📖 Browse the Guides →</Link>
        </section>
      </div>
    </div>
  )
}
