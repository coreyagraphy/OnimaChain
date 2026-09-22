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
  const sheenId = `portal-sheen-${rawId}`
  const grainId = `portal-grain-${rawId}`
  return (
    <svg className="portal-sequence-word" viewBox={`0 0 ${width} 180`} role="presentation" aria-hidden="true">
      <defs>
        <clipPath id={clipId}><text x="8" y="143" className="portal-sequence-mask">{children}</text></clipPath>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5ffff" /><stop offset=".09" stopColor="#9bb9c9" /><stop offset=".24" stopColor="#263c55" /><stop offset=".39" stopColor="#dceaf0" /><stop offset=".49" stopColor="#ffffff" /><stop offset=".58" stopColor="#546c80" /><stop offset=".76" stopColor="#071827" /><stop offset=".89" stopColor="#4ebdd7" /><stop offset="1" stopColor="#061322" />
        </linearGradient>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#55e5f2" stopOpacity=".37" /><stop offset=".38" stopColor="#ffffff" stopOpacity="0" /><stop offset=".69" stopColor="#7769ff" stopOpacity=".35" /><stop offset="1" stopColor="#c35fff" stopOpacity=".2" /></linearGradient>
        <filter id={grainId} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".18 .52" numOctaves="2" seed="8" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width={width} height="180" fill={`url(#${gradientId})`} />
        <rect className="portal-sequence-current" width={width} height="180" fill={`url(#${sheenId})`} />
        <rect width={width} height="180" filter={`url(#${grainId})`} opacity=".21" style={{ mixBlendMode: 'soft-light' }} />
        {GENOME_ROWS.map((row, i) => <text key={row} x={-20 + (i % 2) * 12} y={24 + i * 29} className="portal-genome-row">{row.repeat(2)}</text>)}
      </g>
      <text x="8" y="143" className="portal-sequence-outline">{children}</text>
    </svg>
  )
}

export function PortalTitle({ className = '' }: { className?: string }) {
  return <h1 className={`portal-title portal-sequence-title ${className}`} aria-label="Portal of Tides"><SequenceWord width={610}>Portal</SequenceWord><span className="portal-title-small">of</span><SequenceWord width={525}>Tides</SequenceWord></h1>
}
