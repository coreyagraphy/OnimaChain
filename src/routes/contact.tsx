import { createFileRoute, Link } from '@tanstack/react-router'
import { EditorialIntake } from '~/components/EditorialIntake'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: `Editorial contact — ${BRAND}` }, { name: 'description', content: 'Submit a page correction or original source for editorial review when the verified contact channel is enabled.' }] }),
  component: Contact,
})

function Contact() {
  return <div className="pt-28 wrap min-h-[60vh]"><p className="label label-cyan">Contact</p><h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">Help us correct the record.</h1><p className="lede mt-5 max-w-2xl">Found an error, a broken citation, or a source we missed? Tell us.</p><div className="mt-10"><EditorialIntake /></div><p className="text-sm muted mt-8">Accepted corrections are listed on the <Link to="/corrections" className="underline">corrections page</Link>. We can’t give medical advice here.</p></div>
}
