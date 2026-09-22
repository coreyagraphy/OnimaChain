import { Link } from '@tanstack/react-router'
import type { ResearchCompound } from '~/data/research-entities'
import { TARGETS } from '~/data/research-entities'
import { WATCHLIST_THEMES } from '~/data/research-themes'

export function ResearchEntityCard({ compound: c }: { compound: ResearchCompound }) {
  const theme = WATCHLIST_THEMES[c.id]
  return <article id={c.id} className="research-entity-card" data-motion={theme.motionSignature} data-material={theme.moleculeMaterial} style={{ '--entity-accent': theme.primary, '--entity-secondary': theme.secondary } as React.CSSProperties}>
    <div className="research-entity-visual" role="img" aria-label={`Conceptual target visualization for ${c.name}; not a measured molecular structure`}>
      <span className="research-entity-orbit orbit-one" /><span className="research-entity-orbit orbit-two" />
      <span className="research-entity-core">{c.targets.length.toString().padStart(2, '0')}</span>
      <div className="research-entity-targets">{c.targets.map((id, index) => <span key={id} style={{ '--target-index': index } as React.CSSProperties}>{TARGETS.find((t) => t.id === id)?.label}</span>)}</div>
    </div>
    <div className="research-entity-body">
      <p className="label" style={{ color: c.accent }}>Watchlist · compound</p>
      <h3 className="display-md text-[clamp(1.5rem,2.4vw,2.3rem)] mt-2">{c.name}</h3>
      {c.aliases.length > 0 && <p className="mono text-[11px] text-bone/45 mt-1">Also known as {c.aliases.join(', ')}</p>}
      <p className="text-sm text-bone/75 leading-relaxed mt-4">{c.summary}</p>
      <div className="flex flex-wrap gap-2 mt-4"><span className="research-status-pill">Informational profile</span><span className="research-status-pill">Watchlist</span></div>
      <dl className="research-entity-facts mt-5"><div><dt>Development</dt><dd>{c.stage ?? 'Not assessed'}</dd></div><div><dt>Developer</dt><dd>{c.developer ?? 'Not mapped'}</dd></div><div><dt>Status as of</dt><dd>{c.statusAsOf ?? 'Pending'}</dd></div></dl>
      <p className="mono text-[10px] text-bone/45 mt-4">Conceptual visualization · no verified coordinates rendered</p>
      <div className="flex flex-wrap gap-2 mt-5"><Link to="/watchlist/$slug" params={{ slug: c.id }} className="btn btn-sm">Explore the research</Link>{c.statusSource && <a href={c.statusSource} target="_blank" rel="noreferrer noopener" className="btn btn-sm">Primary source ↗</a>}</div>
    </div>
  </article>
}
