import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — KaruviLab',
  description: 'KaruviLab privacy policy: all tools run locally in your browser. No file uploads, no tracking, no data collection.',
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-purple-700 text-white px-4 sm:px-8 py-12">
        <div className="max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-4 transition-colors">
            ← All tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-brand-100 text-sm">Last updated: January 2025</p>
        </div>
      </section>
      <div className="container-app py-12 max-w-3xl space-y-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex gap-4">
          <span className="text-2xl shrink-0">🔒</span>
          <div>
            <p className="font-bold text-emerald-900 mb-1">Short version: we collect nothing.</p>
            <p className="text-sm text-emerald-800 leading-relaxed">All tools run entirely in your browser. Your files, text and data never leave your device.</p>
          </div>
        </div>
        {[
          { title: '1. Data We Do Not Collect', content: ['We do not collect, store, or transmit any files you process.','We do not collect personal information such as name, email, or IP address.','We do not use cookies for tracking or advertising.'] },
          { title: '2. How Our Tools Work', content: ['All processing happens locally in your browser using JavaScript.','Files you upload are loaded into browser memory only — never sent to any server.','When you close the tab, all data is cleared automatically.'] },
          { title: '3. Analytics', content: ['We may use privacy-respecting analytics (aggregated page view counts) that do not identify individual users.','No third-party advertising or tracking scripts are loaded.'] },
          { title: '4. Contact', content: ['Questions about this privacy policy? Reach us via the Contact page.'] },
        ].map(section => (
          <section key={section.title} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h2>
            <ul className="space-y-2">
              {section.content.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>{item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
