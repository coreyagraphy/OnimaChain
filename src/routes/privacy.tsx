import { createFileRoute } from '@tanstack/react-router'
import { BRAND } from '~/brand'

const POINTS = [
  ['What this browser keeps', 'The age gate stores your yes/no acknowledgment locally. Evidence Worlds stores completed fictional mission numbers, not the answers you chose.'],
  ['Retired tools', 'When this version loads, it removes known local cart, Bond Theory goal/pick, and Pulse preference/review-key entries from this browser. It does not delete any server records. The educational site no longer accepts orders, health-goal matching, or public live-feed submissions.'],
  ['Editorial messages, once enabled', 'The correction form remains closed until a real operator, inbox, sender and delivery test are configured. Once enabled, it sends your page reference, message, optional source URL and optional reply email to the configured editorial inbox through the email provider. Please do not submit medical records or treatment details.'],
  ['Your choices', 'Replay Evidence Worlds to clear its saved mission completion. You can also clear this site’s browser storage in your browser settings. An optional reply email is not required to submit an editorial message when the channel opens.'],
  ['What remains to be verified before release', 'The operator must confirm the public legal identity and contact, hosting logs, any analytics or cookies, email-provider retention, correction-message handling and any other service providers. This draft is not a complete production privacy notice until those facts are checked.'],
  ['Age', 'You must be 21 or older to use this site. We do not knowingly collect anything from anyone younger.'],
]

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: `Privacy — ${BRAND}` }, { name: 'description', content: 'A draft explanation of local browser storage and privacy items still to verify.' }] }),
  component: () => (
    <div className="pt-28 wrap min-h-[60vh]">
      <p className="label label-cyan">Privacy</p>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">What this site stores.</h1>
      <p className="lede mt-5 max-w-2xl">A code-based inventory for owner review. The operator and infrastructure details still need verification before production release.</p>
      <div className="mt-10 grid gap-3 max-w-3xl">
        {POINTS.map(([t, b]) => (
          <div key={t} className="panel-flat p-5"><p className="label label-cyan">{t}</p><p className="mt-2 text-sm text-bone/85">{b}</p></div>
        ))}
      </div>
      <p className="mt-8 mono text-[11px] text-bone/45">Release-gated draft · operator/provider review and legal review pending.</p>
    </div>
  ),
})
