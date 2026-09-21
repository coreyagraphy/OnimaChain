import { Link } from '@tanstack/react-router'
import { CORPUS_CHECKED_AT } from '~/data/studies'

const cols = [
  [['/explore', 'Explore'], ['/claims', 'Claims'], ['/signal', 'Signal Map'], ['/learn', 'Learn']],
  [['/methodology', 'Methodology'], ['/coverage', 'Coverage'], ['/corrections', 'Corrections'], ['/timeline', 'Timeline']],
  [['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy'], ['/terms', 'Terms']],
] as const

export function Footer() {
  return (
    <footer className="mt-24 border-t hairline bg-obsidian">
      <div className="wrap py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="display text-[15px] tracking-[0.18em] uppercase">Cyravon</p>
          <p className="mt-3 text-sm muted max-w-sm">The Molecular Evidence &amp; Signal Atlas. See what research found, what people report, and how the story changed between them.</p>
          <p className="mt-4 mono text-[11px] text-bone/40">Working brand only until final domain and trademark clearance.</p>
          <p className="mono text-[11px] text-bone/40">Corpus check: {CORPUS_CHECKED_AT.slice(0, 10)} · PMIDs verified via NCBI eutils</p>
        </div>
        {cols.map((c, i) => (
          <ul key={i} className="grid gap-2 content-start">
            {c.map(([to, label]) => (
              <li key={to}><Link to={to} className="label hover:!text-bone">{label}</Link></li>
            ))}
          </ul>
        ))}
      </div>
      <div className="border-t hairline">
        <div className="wrap py-6">
          <p className="text-[12px] text-bone/60 max-w-3xl">
            <b className="text-bone/80">Research and educational information. Cyravon does not provide individualized medical advice or facilitate the purchase of research compounds.</b>
          </p>
        </div>
      </div>
    </footer>
  )
}
