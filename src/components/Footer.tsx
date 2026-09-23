import { Link } from '@tanstack/react-router'
import { CORPUS_CHECKED_AT } from '~/data/studies'
import { brand } from '~/brand'
import { BrandLogo } from './BrandWordmark'

const cols = [
  [['/waitlist', 'Waitlist'], ['/shop', 'Shop'], ['/explore', 'Explore'], ['/watchlist', 'Watchlist'], ['/combinations', 'Stacks'], ['/targets', 'Targets'], ['/coa', 'Lab Reports']],
  [['/claims', 'Research'], ['/signal', 'Portal of Tides'], ['/bond-theory', 'Bond Theory'], ['/research-tools/preclinical-calculator', 'Mouse Math'], ['/research-tools', 'Research Tools'], ['/learn', 'Learn'], ['/methodology', 'Methodology'], ['/coverage', 'Coverage'], ['/corrections', 'Corrections'], ['/timeline', 'Timeline']],
  [['/account', 'Account'], ['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy'], ['/terms', 'Terms']],
] as const

export function Footer() {
  return (
    <footer className="mt-24 border-t hairline bg-obsidian">
      <div className="wrap py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <BrandLogo className="footer-brand-logo" />
          <p className="mt-4 text-sm text-bone/80 max-w-sm">{brand.primaryTagline}</p>
          <p className="mt-2 text-sm muted max-w-sm">{brand.secondaryTagline}</p>
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
            <b className="text-bone/80">You must be 21 or older to use this site.</b> OnimaChain provides research and educational information. Information about compounds, studies and public reports is not medical advice or a recommendation for diagnosis, treatment or personal use. Profiles do not imply stock or sale. Watchlist inclusion does not imply approval. Community reports do not establish cause and effect.
          </p>
        </div>
      </div>
    </footer>
  )
}
