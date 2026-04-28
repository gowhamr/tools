import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use — KaruviLab',
  description: 'KaruviLab terms of use.',
}

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-purple-700 text-white px-4 sm:px-8 py-12">
        <div className="max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-4 transition-colors">← All tools</Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Terms of Use</h1>
          <p className="text-brand-100 text-sm">Last updated: January 2025</p>
        </div>
      </section>
      <div className="container-app py-12 max-w-3xl space-y-6">
        {[
          { title: '1. Acceptance', body: 'By using KaruviLab you agree to these Terms. If you do not agree, please do not use the Service.' },
          { title: '2. Description', body: 'KaruviLab provides free, browser-based utility tools. All tools run client-side in your browser.' },
          { title: '3. No Warranty', body: 'The Service is provided "as is" without warranties of any kind. We do not guarantee error-free or uninterrupted operation.' },
          { title: '4. Limitation of Liability', body: 'To the fullest extent permitted by law, KaruviLab shall not be liable for any damages arising from your use of the Service.' },
          { title: '5. Financial Calculators', body: 'The SIP and EMI calculators are for informational purposes only and do not constitute financial advice.' },
          { title: '6. Modifications', body: 'We reserve the right to modify these Terms at any time. Continued use constitutes acceptance of revised Terms.' },
        ].map(s => (
          <section key={s.title} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="text-base font-bold text-slate-900 mb-2">{s.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
