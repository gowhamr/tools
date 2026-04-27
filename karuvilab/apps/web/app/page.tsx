import Link from 'next/link'
import { TOOLS } from '@/lib/tools'
import ToolGrid from '@/components/ui/ToolGrid'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-purple-700 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.09)_0%,transparent_60%)]"
        />
        <div className="container-app py-10 sm:py-14 lg:py-20 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3.5 py-1.5 text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              Free &amp; private — no sign-up
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-3">
              What will you
              <br />
              <span className="text-brand-200">create today?</span>
            </h1>
            <p className="text-base text-brand-100 mb-7 max-w-lg leading-relaxed">
              Compress, convert &amp; validate — all in your browser.
              Zero uploads, zero tracking, always free.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/compress-image"
                className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors shadow-cta text-sm"
              >
                🗜️ Compress Image
              </Link>
              <Link
                href="/json-formatter"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/30 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/25 transition-colors text-sm"
              >
                &#123;&#125; JSON Formatter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy strip ────────────────────────────────── */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="container-app py-2.5 flex flex-wrap gap-3 sm:gap-7 text-xs text-emerald-700 font-semibold">
          <span>🔒 Runs in your browser</span>
          <span>🚫 No file uploads</span>
          <span>⚡ Instant results</span>
          <span>💸 Always free</span>
        </div>
      </div>

      {/* ── Tool grid ────────────────────────────────────── */}
      <div className="container-app py-8 flex-1">
        <ToolGrid tools={TOOLS} />
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 mt-8">
        <div className="container-app py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-sm">K</div>
                <span className="text-white font-bold">KaruviLab</span>
              </div>
              <p className="text-xs max-w-xs leading-relaxed">
                Free browser tools for developers and everyday file tasks. No data leaves your device.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-2 text-xs">
              <div>
                <p className="text-white font-semibold mb-2">Tools</p>
                <ul className="space-y-1.5">
                  <li><Link href="/compress-image"  className="hover:text-white transition-colors">Image Compressor</Link></li>
                  <li><Link href="/convert-image"   className="hover:text-white transition-colors">Image Converter</Link></li>
                  <li><Link href="/pdf-tools"        className="hover:text-white transition-colors">PDF Tools</Link></li>
                  <li><Link href="/json-formatter"   className="hover:text-white transition-colors">JSON Formatter</Link></li>
                  <li><Link href="/base64"           className="hover:text-white transition-colors">Base64 Encoder</Link></li>
                  <li><Link href="/regex-tester"     className="hover:text-white transition-colors">Regex Tester</Link></li>
                  <li><Link href="/sip-calculator"   className="hover:text-white transition-colors">SIP Calculator</Link></li>
                  <li><Link href="/emi-calculator"   className="hover:text-white transition-colors">EMI Calculator</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold mb-2">Info</p>
                <ul className="space-y-1.5">
                  <li><Link href="/guides"  className="hover:text-white transition-colors">Guides</Link></li>
                  <li><Link href="/about"   className="hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold mb-2">Legal</p>
                <ul className="space-y-1.5">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms"   className="hover:text-white transition-colors">Terms of Use</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-5 text-xs text-slate-500">
            © {new Date().getFullYear()} KaruviLab · No sign-up · No tracking · Built for developers
          </div>
        </div>
      </footer>
    </div>
  )
}
