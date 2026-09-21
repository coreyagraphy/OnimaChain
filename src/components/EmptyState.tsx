import type { ReactNode } from 'react'
import { BRAND } from '~/brand'

interface Props {
  title: string
  detail?: string
  children?: ReactNode
  tone?: 'default' | 'amber'
  compact?: boolean
}

/** Every empty state says exactly what is missing. Absence in the corpus is never "no evidence exists". */
export function EmptyState({ title, detail, children, tone = 'default', compact = false }: Props) {
  return (
    <div className={`rounded-xl border border-dashed ${tone === 'amber' ? 'border-amber/40' : 'border-bone/15'} ${compact ? 'p-4' : 'p-6 md:p-8'}`} role="status">
      <p className={`display-md ${compact ? 'text-base' : 'text-lg md:text-xl'} ${tone === 'amber' ? 'text-amber' : 'text-bone/85'}`}>{title}</p>
      {detail && <p className="mt-2 text-sm muted max-w-prose">{detail}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

export const CORPUS_ABSENCE = `We haven’t added a checked source for this yet.`
