import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: `About — ${BRAND}` }, { name: 'description', content: 'What this site is, who it is for, and the rules we hold ourselves to.' }] }),
  component: () => (
    <div className="pt-28 wrap min-h-[60vh]">
      <p className="label label-cyan">About</p>
      <h1 className="display text-[clamp(2.4rem,6vw,5.4rem)] mt-3">Peptides, without the jargon.</h1>
      <p className="lede mt-5 max-w-2xl">{BRAND} shows you the peptides people actually talk about, explains what each one is in plain English, and puts the real studies one click away. No hype, no secret handshake.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-4 max-w-4xl">
        <div className="panel glass relative p-6"><p className="relative label label-cyan">Who this is for</p><p className="relative mt-3 text-sm text-bone/85">Adults, 21 and older, who are curious about peptides and want straight answers instead of a sales pitch or a wall of science words.</p></div>
        <div className="panel glass relative p-6"><p className="relative label label-cyan">What we promise</p><p className="relative mt-3 text-sm text-bone/85">Every study we show was checked against PubMed. Every claim shows where it started. If we haven&rsquo;t checked something, we say so.</p></div>
        <div className="panel glass relative p-6"><p className="relative label label-amber">What we don&rsquo;t do</p><p className="relative mt-3 text-sm text-bone/85">We don&rsquo;t give medical advice. We don&rsquo;t tell you how much of anything to take. We don&rsquo;t make up customer stories or results.</p></div>
        <div className="panel glass relative p-6"><p className="relative label label-violet">Where things stand</p><p className="relative mt-3 text-sm text-bone/85">{BRAND} is a working name. Prices, checkout and shipping are still being finalized. Read our <Link to="/methodology" className="underline">method</Link> to see how the site works underneath.</p></div>
      </div>
    </div>
  ),
})
