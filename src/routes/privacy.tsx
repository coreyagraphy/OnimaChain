import { createFileRoute } from '@tanstack/react-router'
import { BRAND } from '~/brand'

const POINTS = [
  ['What we collect right now', 'Almost nothing. This site has no accounts and no checkout yet. Your browser remembers two things on your own device: that you answered the age question, and what is in your cart.'],
  ['What we don’t do', 'We don’t sell your information. We don’t track you across other websites. We don’t use your searches here to build a health profile of you.'],
  ['When checkout opens', 'We will need a name, an address and a payment method to ship an order. We will say exactly who handles payment before you type anything.'],
  ['Your choices', 'Clear your browser storage and the age answer and cart are gone. When accounts exist, you will be able to see and delete what we hold.'],
  ['Age', 'You must be 21 or older to use this site. We do not knowingly collect anything from anyone younger.'],
]

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: `Privacy — ${BRAND}` }, { name: 'description', content: 'What we collect, what we never do with it, and what changes when checkout opens.' }] }),
  component: () => (
    <div className="pt-28 wrap min-h-[60vh]">
      <p className="label label-cyan">Privacy</p>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">Your business stays your business.</h1>
      <p className="lede mt-5 max-w-2xl">Here is what this site knows about you, in plain English.</p>
      <div className="mt-10 grid gap-3 max-w-3xl">
        {POINTS.map(([t, b]) => (
          <div key={t} className="panel-flat p-5"><p className="label label-cyan">{t}</p><p className="mt-2 text-sm text-bone/85">{b}</p></div>
        ))}
      </div>
      <p className="mt-8 mono text-[11px] text-bone/45">Draft for plain-English review. A lawyer will check this before checkout opens.</p>
    </div>
  ),
})
