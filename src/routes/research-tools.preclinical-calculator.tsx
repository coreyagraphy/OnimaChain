import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { calculateMouseStudy, formatStudyNumber, mcgToMg, mgToMcg, type StudyInputs } from '~/data/preclinical-calculator'

export const Route = createFileRoute('/research-tools/preclinical-calculator')({
  head: () => ({ meta: [{ title: 'Mouse Study Calculator — OnimaChain' }] }),
  component: MouseStudyCalculator,
})

const INITIAL: StudyInputs = { stockMassMg: 0, diluentMl: 0, mouseMassG: 0, targetDose: 0, doseUnit: 'mg/kg', animals: 0, administrations: 0, handlingLossPercent: 0 }

function MouseStudyCalculator() {
  const [input, setInput] = useState<StudyInputs>(INITIAL)
  const [stockUnit, setStockUnit] = useState<'mg' | 'mcg'>('mg')
  const output = useMemo(() => calculateMouseStudy(input), [input])
  const set = (field: keyof StudyInputs, value: number) => setInput((state) => ({ ...state, [field]: value }))
  const reset = () => { setInput(INITIAL); setStockUnit('mg') }
  const fill = output ? Math.max(0, Math.min(100, output.volumePerAnimalUl)) : 0
  const stockDisplay = input.stockMassMg ? stockUnit === 'mg' ? input.stockMassMg : mgToMcg(input.stockMassMg) : ''

  return <div className="pt-28 pb-24 research-world">
    <header className="wrap research-hero">
      <p className="label label-cyan">Preclinical research planning</p>
      <h1 className="display research-heading">Mouse Study <span>Calculator.</span></h1>
      <p className="lede max-w-3xl mt-6">Enter values from your own approved experimental protocol. This tool performs volume arithmetic; it does not recommend a compound, dose, route, or regimen.</p>
    </header>

    <section className="wrap mt-12 grid lg:grid-cols-[1fr_1fr] gap-6">
      <div className="panel p-6 md:p-9">
        <div className="flex items-center justify-between gap-3"><h2 className="display-md text-2xl">Study inputs</h2><button type="button" className="btn btn-sm" onClick={reset}>Reset</button></div>
        <div className="calculator-fields mt-7">
          <div className="calculator-field">
            <label htmlFor="compound-stock-mass">Compound stock mass</label>
            <div className="flex gap-2">
              <input id="compound-stock-mass" type="number" min="0" step="any" inputMode="decimal" value={stockDisplay} onChange={(event) => set('stockMassMg', stockUnit === 'mg' ? Number(event.target.value) : mcgToMg(Number(event.target.value)))} />
              <select aria-label="Stock mass unit" value={stockUnit} onChange={(event) => setStockUnit(event.target.value as 'mg' | 'mcg')}><option value="mg">mg</option><option value="mcg">mcg (µg)</option></select>
            </div>
          </div>
          <NumberField label="Research diluent volume" unit="mL" value={input.diluentMl} onChange={(value) => set('diluentMl', value)} />
          <NumberField label="Mouse body mass" unit="g" value={input.mouseMassG} onChange={(value) => set('mouseMassG', value)} />
          <div className="calculator-field">
            <label htmlFor="target-dose">Target experimental dose</label>
            <div className="flex gap-2">
              <input id="target-dose" type="number" min="0" step="any" inputMode="decimal" value={input.targetDose || ''} onChange={(event) => set('targetDose', Number(event.target.value))} />
              <select aria-label="Dose unit" value={input.doseUnit} onChange={(event) => setInput((state) => ({ ...state, doseUnit: event.target.value as StudyInputs['doseUnit'] }))}><option value="mg/kg">mg/kg</option><option value="µg/kg">mcg/kg (µg/kg)</option></select>
            </div>
          </div>
          <NumberField label="Number of animals" unit="animals" value={input.animals} onChange={(value) => set('animals', value)} integer />
          <NumberField label="Number of administrations" unit="times" value={input.administrations} onChange={(value) => set('administrations', value)} integer />
          <NumberField label="Expected handling loss" unit="% optional" value={input.handlingLossPercent} onChange={(value) => set('handlingLossPercent', value)} allowZero />
        </div>
      </div>

      <div className="panel p-6 md:p-9">
        <p className="label label-cyan">Calculated from your inputs</p><h2 className="display-md text-2xl mt-2">Bench worksheet</h2>
        <div aria-live="polite" aria-atomic="true">
          {output ? <>
            <dl className="calculator-results mt-7">
              <Result label="Stock concentration" value={`${formatStudyNumber(output.concentrationMgMl)} mg/mL`} />
              <Result label="Experimental dose per animal" value={`${formatStudyNumber(output.dosePerAnimalMg)} mg · ${formatStudyNumber(mgToMcg(output.dosePerAnimalMg))} mcg`} />
              <Result label="Volume per animal" value={`${formatStudyNumber(output.volumePerAnimalUl)} µL`} />
              <Result label="Total solution required" value={`${formatStudyNumber(output.totalSolutionMl)} mL`} />
              <Result label="Total compound required" value={`${formatStudyNumber(output.totalCompoundMg)} mg`} />
              <Result label="Volume with handling allowance" value={`${formatStudyNumber(output.volumeWithAllowanceMl)} mL`} />
              <Result label="Compound with handling allowance" value={`${formatStudyNumber(output.compoundWithAllowanceMg)} mg`} />
            </dl>
            {!output.stockSufficient && <p role="alert" className="text-amber-200 text-sm mt-5">The prepared stock is insufficient for this study plus the entered handling allowance.</p>}
            <div className="pipette-scene mt-8" role="img" aria-label={`Conceptual graduated laboratory vessel showing ${formatStudyNumber(output.volumePerAnimalUl)} microliters; visual scale capped at 100 microliters`}>
              <div className="pipette-tube"><div className="pipette-fill" style={{ height: `${fill}%` }} /><div className="pipette-marks" /></div>
              <p><strong>{formatStudyNumber(output.volumePerAnimalUl)} µL</strong><span>per animal · vessel illustration scaled to 100 µL; values above 100 µL fill the display but retain their numeric result</span></p>
            </div>
          </> : <p className="muted mt-8">Enter positive protocol values to calculate. Handling loss may be zero.</p>}
        </div>
      </div>
    </section>
    <div className="wrap mt-10 text-sm muted max-w-4xl">Laboratory planning only. No human-equivalent dose, injection instructions, syringe units, compound-specific presets, or medical advice. Confirm calculations and protocol suitability independently before any experiment.</div>
  </div>
}

function NumberField({ label, unit, value, onChange, integer = false, allowZero = false }: { label: string; unit: string; value: number; onChange: (value: number) => void; integer?: boolean; allowZero?: boolean }) {
  const id = label.toLowerCase().replaceAll(' ', '-')
  return <div className="calculator-field"><label htmlFor={id}>{label}</label><div className="flex gap-2"><input id={id} type="number" min={allowZero ? '0' : integer ? '1' : '0'} step={integer ? '1' : 'any'} inputMode="decimal" value={value || (allowZero ? 0 : '')} onChange={(event) => onChange(Number(event.target.value))} /><span>{unit}</span></div></div>
}

function Result({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div> }
