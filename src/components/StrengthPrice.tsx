import { displayName, type Compound } from '~/data/compounds'
import { priceFor, variantsFor } from '~/data/variants'

interface Props {
  compound: Compound
  value: string | null
  onChange: (id: string | null) => void
  compact?: boolean
}

/** Explicitly provisional commerce UI; real strengths/prices must replace examples together. */
export function StrengthPrice({ compound, value, onChange, compact = false }: Props) {
  const variants = variantsFor(compound.slug)
  return <div className={`strength-price ${compact ? 'strength-price-compact' : ''}`}>
    <label className="strength-field">
      <span className="strength-caption">Strength {variants.length ? '· example' : '· pending'}</span>
      <select aria-label={`${displayName(compound)} strength`} value={value ?? ''} onChange={(event) => onChange(event.target.value || null)} disabled={!variants.length}>
        {variants.length ? variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>) : <option value="">Options to be confirmed</option>}
      </select>
    </label>
    <div className="strength-price-value" aria-live="polite">
      <span className="strength-caption">Price placeholder</span>
      <strong className="mono">{priceFor(compound.slug, value)}</strong>
    </div>
  </div>
}
