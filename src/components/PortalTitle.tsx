import { useId } from 'react'

const GENOME_ROWS = [
  'ACGTGCAATGCCGTTAACGTCGATGCTAGCATGCA',
  'TGCAACGTTCGATGGCATACGTTAGCGATCGTACA',
  'CGTATGCAAGCTTAGCGTACCATGCAATGCGTTAG',
  'GATCCGTAGCATGCAACGTTAGCTAGGCAATCGTA',
  'ATGCGTACCAATGGCATTCGAGCTTAGCAACGTGC',
  'TACGGCATAGCTACGTTGCAATCGGATGCACTAGC',
]

function SequenceWord({ children, width }: { children: string; width: number }) {
  const rawId = useId().replace(/:/g, '')
  const clipId = `portal-sequence-${rawId}`
  const gradientId = `portal-current-${rawId}`
  return (
    <svg className="portal-sequence-word" viewBox={`0 0 ${width} 180`} role="presentation" aria-hidden="true">
      <defs>
        <clipPath id={clipId}><text x="8" y="143" className="portal-sequence-mask">{children}</text></clipPath>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dffeff" /><stop offset=".28" stopColor="#38d9df" /><stop offset=".58" stopColor="#5d65ff" /><stop offset=".82" stopColor="#d75cff" /><stop offset="1" stopColor="#64f0c1" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width={width} height="180" fill="#071322" />
        <rect className="portal-sequence-current" width={width} height="180" fill={`url(#${gradientId})`} opacity=".25" />
        {GENOME_ROWS.map((row, i) => <text key={row} x={-20 + (i % 2) * 12} y={24 + i * 29} className="portal-genome-row">{row.repeat(2)}</text>)}
      </g>
      <text x="8" y="143" className="portal-sequence-outline">{children}</text>
    </svg>
  )
}

export function PortalTitle({ className = '' }: { className?: string }) {
  return <h1 className={`portal-title portal-sequence-title ${className}`} aria-label="Portal of Tides"><SequenceWord width={610}>Portal</SequenceWord><span className="portal-title-small">of</span><SequenceWord width={525}>Tides</SequenceWord></h1>
}
