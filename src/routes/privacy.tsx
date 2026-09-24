import { createFileRoute } from '@tanstack/react-router'
import { BRAND } from '~/brand'

const POINTS = [
  ['What this browser keeps', 'This site has no public accounts or checkout yet. Local browser storage can keep your age answer, cart, Bond Theory picks and any goals or text entered there, Pulse follows and last-visit time, and Evidence Worlds mission completion. The Evidence Worlds record is only a list of completed fictional missions, not your answers. Editors using the Pulse review tool may also store an access key locally.'],
  ['What remains to be checked', 'This code review has not confirmed hosting logs, analytics, email services, or other providers. The operator must verify those flows and update this draft before treating it as a complete privacy notice.'],
  ['When checkout opens', 'We will need a name, an address and a payment method to ship an order. We will say exactly who handles payment before you type anything.'],
  ['Your choices', 'Replay Evidence Worlds to clear its saved mission completion. Clearing this site’s browser storage removes the other locally saved items described above. This draft has not yet been reconciled with hosting logs, providers, or any future account service.'],
  ['Age', 'You must be 21 or older to use this site. We do not knowingly collect anything from anyone younger.'],
]

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: `Privacy — ${BRAND}` }, { name: 'description', content: 'A draft explanation of local browser storage and privacy items still to verify.' }] }),
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
