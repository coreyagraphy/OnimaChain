import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent, type ReactNode } from 'react'
import {
  calculateReconstitution,
  formatStudyNumber,
  mcgToMg,
  mgToMcg,
  type ReconstitutionInputs,
  type ReconstitutionOutputs,
} from '~/data/preclinical-calculator'

export const Route = createFileRoute('/research-tools/preclinical-calculator')({
  head: () => ({ meta: [
    { title: 'Mouse Math — OnimaChain' },
    { name: 'description', content: 'For mouse research only: convert vial amount, liquid volume, and a protocol-supplied target amount into concentration, draw volume, U-100 syringe position, and doses per vial.' },
  ] }),
  component: ReconstitutionCalculator,
})

const INITIAL: ReconstitutionInputs = { vialMassMg: 0, diluentMl: 0, amountPerDoseMcg: 0 }
const EXAMPLE: ReconstitutionInputs = { vialMassMg: 10, diluentMl: 3, amountPerDoseMcg: 500 }
type InputErrors = Partial<Record<keyof ReconstitutionInputs, string>>

function ReconstitutionCalculator() {
  const [input, setInput] = useState<ReconstitutionInputs>(INITIAL)
  const [vialUnit, setVialUnit] = useState<'mg' | 'mcg'>('mg')
  const [doseUnit, setDoseUnit] = useState<'mcg' | 'mg'>('mcg')
  const [result, setResult] = useState<ReconstitutionOutputs | null>(null)
  const [errors, setErrors] = useState<InputErrors>({})
  const [exampleLoaded, setExampleLoaded] = useState(false)
  const [pulse, setPulse] = useState(false)

  const vialDisplay = input.vialMassMg ? vialUnit === 'mg' ? input.vialMassMg : mgToMcg(input.vialMassMg) : ''
  const doseDisplay = input.amountPerDoseMcg ? doseUnit === 'mcg' ? input.amountPerDoseMcg : mcgToMg(input.amountPerDoseMcg) : ''

  const set = (field: keyof ReconstitutionInputs, value: number) => {
    setInput((state) => ({ ...state, [field]: value }))
    setErrors((state) => ({ ...state, [field]: undefined }))
    setResult(null)
    setExampleLoaded(false)
  }

  const reset = () => {
    setInput(INITIAL)
    setVialUnit('mg')
    setDoseUnit('mcg')
    setResult(null)
    setErrors({})
    setExampleLoaded(false)
  }

  const loadExample = () => {
    setInput(EXAMPLE)
    setVialUnit('mg')
    setDoseUnit('mcg')
    setResult(null)
    setErrors({})
    setExampleLoaded(true)
    requestAnimationFrame(() => document.getElementById('vial-amount')?.focus())
  }

  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateInputs(input)
    setErrors(nextErrors)
    const firstInvalid = Object.keys(nextErrors)[0] as keyof ReconstitutionInputs | undefined
    if (firstInvalid) {
      document.querySelector<HTMLElement>(`[data-field="${firstInvalid}"] input`)?.focus()
      setResult(null)
      return
    }

    const nextResult = calculateReconstitution(input)
    if (!nextResult) return
    setResult(nextResult)
    setPulse(true)
    window.setTimeout(() => setPulse(false), 650)
    if (window.innerWidth < 1180) requestAnimationFrame(() => document.getElementById('reconstitution-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return <div className="calculator-world pt-28 pb-24">
    <header className="wrap calculator-hero">
      <div className="calculator-hero-copy">
        <p className="label label-cyan">Preclinical research planning</p>
        <h1 className="display calculator-heading">Mouse <span>Math.</span></h1>
        <p className="calculator-positioning">See how your mouse-study vial values translate into research volume.</p>
        <p className="lede max-w-3xl mt-4">Tell OnimaChain what is in the vial, how much research diluent you added, and the amount already specified by your mouse-study protocol. Mouse Math will show the concentration, research volume, U-100 reference mark, and approximate draws available.</p>
        <p className="calculator-safety-line"><span aria-hidden />Mouse research only — never for human dosing.</p>
      </div>
      <div className="calculator-hero-guide" aria-label="Mouse Math steps: Vial, Mix, Draw">
        <div><b>1</b><span>Vial</span></div><i aria-hidden /><div><b>2</b><span>Mix</span></div><i aria-hidden /><div><b>3</b><span>Draw</span></div>
        <button type="button" className="calculator-example" onClick={loadExample}>Load 10 mg example <span aria-hidden>↗</span></button>
        <p>Loads 10 mg + 3 mL + 500 mcg to demonstrate the math.</p>
      </div>
    </header>

    <aside className="wrap calculator-mouse-only" role="note" aria-label="Research-use restriction">
      <div className="calculator-mouse-badge"><i aria-hidden />Mouse research only</div>
      <strong>Not for human use.</strong>
        <p>Mouse Math performs measurement arithmetic for an approved mouse-study protocol. It does not choose a protocol amount, establish safety, or provide medical advice.</p>
      <div className="calculator-mouse-chain" aria-hidden><i /><span /><i /><span /><i /></div>
    </aside>

    <main className="wrap calculator-layout">
      <form className="calculator-console" onSubmit={calculate} noValidate>
        {exampleLoaded && <div className="calculator-example-note" role="status"><strong>Example loaded.</strong> 10 mg in the vial, mixed with 3 mL, with 500 mcg entered as the amount per dose.</div>}

        <StepCard number="1" title="What is in the vial?" shortTitle="Vial" accent="cyan">
          <div className="calculator-field" data-field="vialMassMg">
            <label htmlFor="vial-amount">How much compound is in the vial?</label>
            <div className="calculator-input-line">
              <input id="vial-amount" type="number" min="0" step="any" inputMode="decimal" value={vialDisplay} onChange={(event) => set('vialMassMg', vialUnit === 'mg' ? Number(event.target.value) : mcgToMg(Number(event.target.value)))} aria-invalid={Boolean(errors.vialMassMg)} aria-describedby={errors.vialMassMg ? 'vial-amount-error' : undefined} />
              <SegmentedControl label="Vial amount unit" value={vialUnit} options={[['mg', 'mg'], ['mcg', 'mcg']]} onChange={(value) => { setVialUnit(value as 'mg' | 'mcg'); setResult(null) }} />
            </div>
            {errors.vialMassMg && <FieldError id="vial-amount-error">{errors.vialMassMg}</FieldError>}
          </div>
          <p className="calculator-helper"><span aria-hidden>●</span>Use the total amount printed on the vial.</p>
        </StepCard>

        <StepCard number="2" title="How much liquid did you add?" shortTitle="Mix" accent="violet">
          <NumberField field="diluentMl" id="liquid-added" label="How much research diluent did you add?" unit="mL" value={input.diluentMl} onChange={(value) => set('diluentMl', value)} error={errors.diluentMl} />
          <p className="calculator-helper"><span aria-hidden>●</span>The calculation treats this as the final solution volume.</p>
        </StepCard>

        <StepCard number="3" title="What does the protocol specify?" shortTitle="Draw" accent="yellow">
          <div className="calculator-field" data-field="amountPerDoseMcg">
            <label htmlFor="amount-per-dose">Mouse-study protocol amount</label>
            <div className="calculator-input-line">
              <input id="amount-per-dose" type="number" min="0" step="any" inputMode="decimal" value={doseDisplay} onChange={(event) => set('amountPerDoseMcg', doseUnit === 'mcg' ? Number(event.target.value) : mgToMcg(Number(event.target.value)))} aria-invalid={Boolean(errors.amountPerDoseMcg)} aria-describedby={errors.amountPerDoseMcg ? 'dose-amount-error' : 'dose-amount-helper'} />
              <SegmentedControl label="Dose amount unit" value={doseUnit} options={[['mcg', 'mcg'], ['mg', 'mg']]} onChange={(value) => { setDoseUnit(value as 'mcg' | 'mg'); setResult(null) }} />
            </div>
            {errors.amountPerDoseMcg && <FieldError id="dose-amount-error">{errors.amountPerDoseMcg}</FieldError>}
          </div>
          <p id="dose-amount-helper" className="calculator-helper">Enter the amount already specified by the approved mouse-study protocol. Mouse Math does not recommend or verify protocol amounts.</p>
        </StepCard>

        <div className="calculator-actions">
          <button type="submit" className={`calculator-calculate ${pulse ? 'is-pulsing' : ''}`}><span>Do the Math</span><MoleculeArrow /></button>
          <button type="button" className="calculator-reset" onClick={reset}>Reset</button>
        </div>
      </form>

      <section id="reconstitution-results" className={`calculator-result-chamber ${result ? 'has-results' : ''} ${pulse ? 'is-pulsing' : ''}`} aria-live="polite" aria-atomic="true">
        {result ? <ReconstitutionResults input={input} output={result} vialUnit={vialUnit} /> : <ResultPlaceholder />}
      </section>
    </main>

    <div className="wrap calculator-boundary"><strong>Mouse research only. Not for human use.</strong> U-100 syringe numbers are volume markings: 100 marks equals 1 mL. They are not international units of the substance. Confirm the vial label, final volume, syringe scale, protocol amount, and calculation under appropriate animal-research oversight before any experiment.</div>
  </div>
}

function StepCard({ number, title, shortTitle, accent, children }: { number: string; title: string; shortTitle: string; accent: 'cyan' | 'violet' | 'mint' | 'yellow'; children: ReactNode }) {
  return <section className={`calculator-step calculator-step-${accent}`}>
    <div className="calculator-step-head"><span className="calculator-step-number">{number}</span><div><p>{shortTitle}</p><h2 className="display-md">{title}</h2></div><div className="calculator-step-molecule" aria-hidden><i /><i /><i /></div></div>
    <div className="calculator-step-fields">{children}</div>
  </section>
}

function ReconstitutionResults({ input, output, vialUnit }: { input: ReconstitutionInputs; output: ReconstitutionOutputs; vialUnit: 'mg' | 'mcg' }) {
  const fill = Math.max(0, Math.min(100, output.u100Mark))
  const vialAmount = vialUnit === 'mg' ? `${formatStudyNumber(input.vialMassMg)} mg` : `${formatStudyNumber(mgToMcg(input.vialMassMg))} mcg`
  const markIsWhole = Math.abs(output.u100Mark - Math.round(output.u100Mark)) < 1e-9
  return <>
    <div className="calculator-result-head">
      <div><p className="label calculator-result-kicker">Vial → Mix → Draw</p><h2 className="display-md">MY MOUSE MATH</h2></div>
      <span className="calculator-result-live"><i />Calculated</span>
    </div>
    <dl className="calculator-results">
      <ResultCard label="Mixed concentration" value={`${formatStudyNumber(output.concentrationMgMl)} mg/mL`} secondary={`${formatStudyNumber(output.concentrationMcgMl)} mcg/mL`} description="Based on the vial amount and research diluent you entered." />
      <ResultCard label="Protocol amount represented" value={`${formatStudyNumber(input.amountPerDoseMcg)} mcg`} secondary={`${formatStudyNumber(mcgToMg(input.amountPerDoseMcg))} mg`} description="The mouse-study protocol amount you entered." />
      <div className="calculator-result-card calculator-result-volume calculator-result-syringe">
        <dt>Resulting research volume</dt><dd>{formatStudyNumber(output.drawVolumeUl)} <small>µL</small></dd>
        <strong>{formatStudyNumber(output.drawVolumeMl)} mL · U-100 reference · mark {formatStudyNumber(output.u100Mark)}</strong>
        <p>Research volume representing the protocol amount. On the reference scale, 100 marks equals 1 mL.</p>
        <div className="syringe-scene" role="img" aria-label={`U-100 syringe illustration filled to mark ${formatStudyNumber(output.u100Mark)} out of 100`}>
          <div className="syringe-cap">100</div>
          <div className="syringe-barrel"><div className="syringe-fill" style={{ height: `${fill}%` }} /><div className="syringe-marks" /><span className="syringe-target" style={{ bottom: `${fill}%` }}>{formatStudyNumber(output.u100Mark)}</span></div>
          <div className="syringe-tip" />
        </div>
      </div>
      <ResultCard label="Approximate protocol-sized draws" value={`${output.fullDoses}`} secondary={output.remainderMcg > 0 ? `${formatStudyNumber(output.remainderMcg)} mcg remains` : 'No calculated remainder'} description="Whole mathematical draws; does not account for material left in the vial or needle." />
    </dl>

    {output.u100Mark > 100 && <p role="alert" className="calculator-stock-warning">This volume is greater than the 100 mark and will not fit in one 1 mL U-100 syringe.</p>}
    {!markIsWhole && output.u100Mark <= 100 && <p className="calculator-precision-note">This result falls between whole-number marks. Confirm that your actual syringe has fine enough graduations to measure it accurately.</p>}

    <div className="calculator-flow" aria-label="Visual calculation summary">
      <FlowValue value={vialAmount} label="in vial" /><FlowConnector symbol="+" />
      <FlowValue value={`${formatStudyNumber(input.diluentMl)} mL`} label="liquid" /><FlowConnector symbol="→" />
      <FlowValue value={`${formatStudyNumber(input.amountPerDoseMcg)} mcg`} label="protocol amount" /><FlowConnector symbol="→" />
      <FlowValue value={`${formatStudyNumber(output.drawVolumeUl)} µL`} label="research volume" strong />
    </div>

    <details className="calculator-math">
      <summary>Show the math <span aria-hidden>+</span></summary>
      <div>
        <MathLine label="Total in vial" value={`${formatStudyNumber(input.vialMassMg)} mg × 1,000 = ${formatStudyNumber(mgToMcg(input.vialMassMg))} mcg`} />
        <MathLine label="Concentration" value={`${formatStudyNumber(input.vialMassMg)} mg ÷ ${formatStudyNumber(input.diluentMl)} mL = ${formatStudyNumber(output.concentrationMgMl)} mg/mL`} />
        <MathLine label="Research volume" value={`${formatStudyNumber(input.amountPerDoseMcg)} mcg ÷ ${formatStudyNumber(output.concentrationMcgMl)} mcg/mL = ${formatStudyNumber(output.drawVolumeMl)} mL`} />
        <MathLine label="U-100 position" value={`${formatStudyNumber(output.drawVolumeMl)} mL × 100 marks/mL = mark ${formatStudyNumber(output.u100Mark)}`} />
        <MathLine label="Full draws" value={`${formatStudyNumber(mgToMcg(input.vialMassMg))} mcg ÷ ${formatStudyNumber(input.amountPerDoseMcg)} mcg = ${output.fullDoses} protocol-sized draws${output.remainderMcg ? ` with ${formatStudyNumber(output.remainderMcg)} mcg remaining` : ''}`} />
      </div>
    </details>
  </>
}

function ResultPlaceholder() {
  return <div className="calculator-placeholder">
    <div className="calculator-idle-orbit" aria-hidden><span className="orbit-ring orbit-ring-one" /><span className="orbit-ring orbit-ring-two" /><span className="orbit-core" /><i className="orbit-node orbit-node-one" /><i className="orbit-node orbit-node-two" /><i className="orbit-node orbit-node-three" /></div>
    <p className="label label-violet">Awaiting vial values</p>
    <h2 className="display-md">Your Mouse Math will appear here.</h2>
    <p>Complete Vial, Mix, and Draw, then select <strong>Do the Math</strong>. The brightest result will show the research volume.</p>
  </div>
}

function ResultCard({ label, value, secondary, description }: { label: string; value: string; secondary?: string; description: string }) {
  return <div className="calculator-result-card"><dt>{label}</dt><dd>{value}</dd>{secondary && <strong>{secondary}</strong>}<p>{description}</p></div>
}

function FlowValue({ value, label, strong = false }: { value: string; label: string; strong?: boolean }) {
  return <div className={strong ? 'is-strong' : ''}><strong>{value}</strong><span>{label}</span></div>
}

function FlowConnector({ symbol }: { symbol: string }) {
  return <span className="calculator-flow-connector" aria-hidden><i /><b>{symbol}</b><i /></span>
}

function MathLine({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>
}

function NumberField({ field, id, label, unit, value, onChange, error }: { field: keyof ReconstitutionInputs; id: string; label: string; unit: string; value: number; onChange: (value: number) => void; error?: string }) {
  const errorId = `${id}-error`
  return <div className="calculator-field" data-field={field}><label htmlFor={id}>{label}</label><div className="calculator-input-line"><input id={id} type="number" min="0" step="any" inputMode="decimal" value={value || ''} onChange={(event) => onChange(Number(event.target.value))} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} /><span className="calculator-unit-static">{unit}</span></div>{error && <FieldError id={errorId}>{error}</FieldError>}</div>
}

function SegmentedControl({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return <div className="calculator-segments" role="group" aria-label={label}>{options.map(([option, text]) => <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)}>{text}</button>)}</div>
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return <p id={id} className="calculator-field-error" role="alert">{children}</p>
}

function MoleculeArrow() {
  return <svg aria-hidden width="48" height="18" viewBox="0 0 48 18" fill="none"><circle cx="5" cy="9" r="3.5" stroke="currentColor"/><circle cx="24" cy="9" r="3.5" stroke="currentColor"/><path d="M8.5 9h12M27.5 9H43M39 5l4 4-4 4" stroke="currentColor"/></svg>
}

function validateInputs(input: ReconstitutionInputs): InputErrors {
  const errors: InputErrors = {}
  if (!Number.isFinite(input.vialMassMg) || input.vialMassMg <= 0) errors.vialMassMg = 'Enter the total amount printed on the vial.'
  if (!Number.isFinite(input.diluentMl) || input.diluentMl <= 0) errors.diluentMl = 'Enter how much liquid was added.'
  if (!Number.isFinite(input.amountPerDoseMcg) || input.amountPerDoseMcg <= 0) errors.amountPerDoseMcg = 'Enter the amount specified by the mouse-study protocol.'
  else if (input.amountPerDoseMcg > mgToMcg(input.vialMassMg)) errors.amountPerDoseMcg = 'The protocol amount cannot be greater than the total amount in the vial.'
  return errors
}
