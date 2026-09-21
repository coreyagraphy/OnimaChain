import { CORPUS } from '~/data/signal'

/** Mandatory on every Human Signal / constellation panel. Never rendered with fabricated numbers. */
export function CorpusHeader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-1 mono text-[11px] text-bone/60 ${className}`} aria-label="What these numbers are based on">
      <span>Real-world reports checked: <b className="text-bone/85 font-medium">{CORPUS.sources} sources</b></span>
      <span aria-hidden>·</span>
      <span>Time window: <b className="text-bone/85 font-medium">{CORPUS.collectionWindow}</b></span>
      <span aria-hidden>·</span>
      <span>Platforms connected: <b className="text-bone/85 font-medium">{CORPUS.platformsEnabled.length ? CORPUS.platformsEnabled.join(', ') : 'none'}</b></span>
    </div>
  )
}
