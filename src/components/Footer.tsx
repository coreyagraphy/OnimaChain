import { Link } from '@tanstack/react-router'
import { CORPUS_CHECKED_AT } from '~/data/studies'
import { BRAND } from '~/brand'

const cols = [
  [['/explore', 'Shop'], ['/claims', 'Research'], ['/signal', 'Portal of Tides'], ['/bond-theory', 'Bond Theory'], ['/learn', 'Learn']],
  [['/methodology', 'Methodology'], ['/coverage', 'Coverage'], ['/corrections', 'Corrections'], ['/timeline', 'Timeline']],
  [['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy'], ['/terms', 'Terms']],
] as const

export function Footer() {
  return (
    <footer className="mt-24 border-t hairline bg-obsidian">
      <div className="wrap py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="display text-[15px] tracking-[0.18em] uppercase">{BRAND}</p>
          <p className="mt-3 text-sm muted max-w-sm">Shop the collection, learn what each peptide is, and open the original sources when you want to go deeper.</p>
          <p className="mt-4 mono text-[11px] text-bone/40">Working brand only until final domain and trademark clearance.</p>
          <p className="mono text-[11px] text-bone/40">Sources last checked: {CORPUS_CHECKED_AT.slice(0, 10)} · PubMed records verified through NCBI</p>
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
            <b className="text-bone/80">You must be 21 or older to use this site.</b> Everything here is for research and education. It is not medical advice, and we never tell you how much of anything to take. Talk to a doctor before you change anything about your health. Prices, checkout, shipping and product eligibility are still being finalized.
          </p>
        </div>
      </div>
    </footer>
  )
}
