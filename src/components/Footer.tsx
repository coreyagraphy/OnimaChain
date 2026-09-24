import { Link } from '@tanstack/react-router'
import { brand } from '~/brand'
import { BrandLogo } from './BrandWordmark'

const cols = [
  [['/explore', 'Explore'], ['/claims', 'Research'], ['/signal', 'Source map'], ['/observatory', 'Evidence Observatory'], ['/learn', 'Learning Lab']],
  [['/methodology', 'Methodology'], ['/coverage', 'Coverage'], ['/corrections', 'Corrections']],
  [['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy'], ['/terms', 'Terms']],
] as const

export function Footer() {
  return (
    <footer className="mt-24 border-t hairline bg-obsidian">
      <div className="wrap py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <BrandLogo className="footer-brand-logo" />
          <p className="mt-4 text-sm text-bone/80 max-w-sm">{brand.primaryTagline}</p>
          <p className="mt-2 text-sm muted max-w-sm">{brand.secondaryTagline}</p>
          <p className="mono text-[11px] text-bone/60">Citation metadata checks are not scientific claim reviews. See each record for its source status.</p>
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
            <b className="text-bone/80">You must be 21 or older to use this site.</b> OnimaChain is an educational reference. We do not take product orders through this website. This is not medical advice or a recommendation to use a compound.
          </p>
        </div>
      </div>
    </footer>
  )
}
