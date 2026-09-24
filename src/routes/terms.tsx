import { createFileRoute } from '@tanstack/react-router'
import { BRAND } from '~/brand'
import { OperatorIdentity } from '~/components/OperatorIdentity'

const RULES = [
  ['You must be 21 or older', 'Must be 21 and over to enter. By using this site you confirm you are.'],
  ['This is not medical advice', 'Everything here is for research and education. Nothing on this site is a diagnosis, a treatment plan or a promise of a result. Talk to a doctor before you change anything about your health.'],
  ['We never tell you how to use anything', 'No doses, no schedules, no mixing instructions, no “stacks”. If you see that anywhere on this site, it is a mistake and we want to know.'],
  ['Studies are not guarantees', 'A result in a dish, in a rat, or even in a small group of people does not mean you will get the same result. We show how far each thing has been tested so you can see the gap.'],
  ['Stories are not proof', 'What people say online is worth reading and we keep it separate from studies. We never turn a story into a claim.'],
  ['Education only', 'OnimaChain does not take product orders through this website. Molecule pages are identity and source records, not product listings or recommendations.'],
  ['Corrections', 'After review and publication, substantive corrections should identify the changed page, old and new wording, reason, date and source. The editorial submission channel remains closed until configured and tested.'],
]

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: `Terms — ${BRAND}` }, { name: 'description', content: 'The rules for using this site, in plain English.' }] }),
  component: () => (
    <div className="pt-28 wrap min-h-[60vh]">
      <p className="label label-cyan">Terms</p>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">The rules, short and honest.</h1>
      <p className="lede mt-5 max-w-2xl">Seven things you agree to by using {BRAND}.</p>
      <OperatorIdentity />
      <ol className="mt-10 grid gap-3 max-w-3xl">
        {RULES.map(([t, b], i) => (
          <li key={t} className="panel-flat p-5 flex gap-4"><span className="mono text-bone/40 pt-1">{String(i + 1).padStart(2, '0')}</span><div><p className="font-semibold text-bone/95">{t}</p><p className="mt-1.5 text-sm text-bone/80">{b}</p></div></li>
        ))}
      </ol>
      <p className="mt-8 mono text-[11px] text-bone/45">Release-gated draft · legal review pending.</p>
    </div>
  ),
})
