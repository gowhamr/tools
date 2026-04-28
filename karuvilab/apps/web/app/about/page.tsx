import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About KaruviLab — Free Browser Tools for Developers',
  description: 'Learn about KaruviLab — a suite of free, privacy-first browser tools for images, PDFs, developer utilities and calculators.',
}

const FEATURES = [
  { icon: '🔒', title: 'Fully Private',       desc: 'Nothing leaves your device. No servers, no uploads, no analytics.' },
  { icon: '⚡', title: 'Instant Results',      desc: 'Everything runs in your browser. No waiting for uploads or processing.' },
  { icon: '💸', title: 'Always Free',          desc: 'No subscriptions, no credits, no paywalls — ever.' },
  { icon: '🛠️', title: '10+ Tools',            desc: 'Image compressor, converter, PDF tools, JSON formatter, regex tester and more.' },
  { icon: '📱', title: 'Works Everywhere',     desc: 'Fully responsive — desktop, tablet and mobile.' },
  { icon: '🌐', title: 'No Sign-up Required', desc: 'Open any tool and start working immediately.' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-purple-700 text-white px-4 sm:px-8 py-12">
        <div className="max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-4 transition-colors">
            ← All tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">About KaruviLab</h1>
          <p className="text-brand-100 text-lg leading-relaxed max-w-xl">
            A growing collection of free, privacy-first tools for developers, designers and everyday users —
            all running directly in your browser.
          </p>
        </div>
      </section>
      <div className="container-app py-12 max-w-3xl space-y-12">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-3 text-slate-600 text-sm leading-relaxed">
            <p>KaruviLab was built on one simple belief: useful tools shouldn&apos;t require you to hand over your files, create an account, or pay a subscription.</p>
            <p>Every tool on KaruviLab runs entirely client-side using modern Web APIs. Your files never touch our servers because there are no servers involved in the processing.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">What makes KaruviLab different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Ready to get started?</h2>
          <p className="text-sm text-slate-500 mb-4">Browse all tools — no sign-up required.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-cta">
            View all tools →
          </Link>
        </section>
      </div>
    </div>
  )
}
