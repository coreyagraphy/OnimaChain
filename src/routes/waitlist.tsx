import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '~/brand'

/**
 * Presentation-only until the site moves to the new Netlify account/domain and
 * the owner approves email storage and privacy copy. No action, fetch, Netlify Form, or storage.
 */
export const Route = createFileRoute('/waitlist')({
  head: () => ({ meta: [
    { title: `Join the waitlist — ${BRAND}` },
    { name: 'description', content: 'Be first to hear when OnimaChain opens. Waitlist members will receive 20% off their first order.' },
  ] }),
  component: Waitlist,
})

function Waitlist() {
  return <div className="waitlist-world pt-[72px]">
    <section className="waitlist-stage wrap" aria-labelledby="waitlist-heading">
      <div className="waitlist-copy">
        <p className="label label-cyan">OnimaChain · first access</p>
        <h1 id="waitlist-heading" className="waitlist-heading">Join the<br /><span>waitlist.</span></h1>
        <p className="waitlist-lede">The collection is taking shape. Be first to hear when ordering opens, with <strong>20% off your first order</strong> waiting for you.</p>
        <p className="waitlist-date"><span className="waitlist-live-dot" aria-hidden />Opening date to be announced</p>
        <div className="waitlist-form-shell" aria-label="Waitlist signup preview">
          <div className="waitlist-form-head"><span>01 / Your place in line</span><span>Signup preview</span></div>
          <label htmlFor="waitlist-email" className="waitlist-email-label">Email address</label>
          <div className="waitlist-form-row">
            <input id="waitlist-email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" disabled aria-describedby="waitlist-status" />
            <button type="button" disabled>Signups paused</button>
          </div>
          <p id="waitlist-status" className="waitlist-status">Signups are paused until our site move is complete. This preview does not collect or store email addresses.</p>
        </div>
        <p className="waitlist-footnote">No purchase is possible yet. We’ll announce the opening date and offer details before orders begin.</p>
      </div>
      <div className="waitlist-art" aria-hidden="true">
        <div className="waitlist-halo waitlist-halo-one" />
        <div className="waitlist-halo waitlist-halo-two" />
        <div className="waitlist-chain waitlist-chain-one" /><div className="waitlist-chain waitlist-chain-two" />
        <div className="waitlist-offer">
          <span className="waitlist-offer-kicker">First order</span>
          <span className="waitlist-offer-number">20<span>%</span></span>
          <span className="waitlist-offer-rule" />
          <span className="waitlist-offer-bottom">For the first in line</span>
        </div>
      </div>
    </section>
    <section className="wrap waitlist-after">
      <p className="label label-violet">While you wait</p>
      <h2 className="display-md">Follow the evidence now.</h2>
      <p>Explore the compounds and the research behind them. The waitlist is for launch news and the first-order offer, not medical advice.</p>
      <div className="waitlist-after-links"><Link to="/explore" className="btn btn-primary">Explore the collection</Link><Link to="/claims" className="btn">Open the research</Link></div>
    </section>
  </div>
}
