import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: `Contact — ${BRAND}` }, { name: 'description', content: 'How to reach us, and what we can and cannot answer.' }] }),
  component: () => (
    <div className="pt-28 wrap min-h-[60vh]">
      <p className="label label-cyan">Contact</p>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">Talk to a human.</h1>
      <p className="lede mt-5 max-w-2xl">Found a mistake? Want a source we missed? Tell us and we will log the fix in public.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-4 max-w-4xl">
        <div className="panel glass relative p-6"><p className="relative label label-cyan">Corrections and sources</p><p className="relative mt-3 text-sm text-bone/85">Send the study, the page, and what is wrong. Every real fix goes on the <Link to="/corrections" className="underline">corrections page</Link> with before and after.</p></div>
        <div className="panel glass relative p-6"><p className="relative label label-cyan">Orders and shipping</p><p className="relative mt-3 text-sm text-bone/85">Checkout is not open yet. When it is, order and shipping questions will be answered here.</p></div>
        <div className="panel glass relative p-6 md:col-span-2"><p className="relative label label-amber">What we can&rsquo;t answer</p><p className="relative mt-3 text-sm text-bone/85">We cannot tell you whether a peptide is right for you, how much to take, or how to use it. Those are questions for a doctor. You must be 21 or older to use this site.</p></div>
      </div>
      <p className="mt-8 mono text-[11px] text-bone/45">A contact address is being set up. Until then, this page explains what to expect.</p>
    </div>
  ),
})
