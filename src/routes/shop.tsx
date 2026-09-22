import { createFileRoute, Link } from '@tanstack/react-router'
import { availableListingFor, PRODUCT_LISTINGS } from '~/data/research-entities'

export const Route = createFileRoute('/shop')({ head: () => ({ meta: [{ title: 'Shop — OnimaChain' }] }), component: ShopPage })

function ShopPage() {
  const available = PRODUCT_LISTINGS.filter((item) => availableListingFor(item.compoundId)?.id === item.id)
  return <div className="pt-28 pb-24 research-world"><header className="wrap research-hero"><p className="label label-cyan">Verified research-product listings only</p><h1 className="display research-heading">Shop the <span>verified lot.</span></h1><p className="lede max-w-3xl mt-6">Scientific profiles and product listings are separate. A molecule appearing in the library does not mean it is stocked by OnimaChain.</p></header><section className="wrap mt-10"><div className="panel p-8 md:p-12 max-w-3xl"><p className="label label-cyan">Available for research · {available.length}</p>{available.length === 0 ? <><h2 className="display-md text-3xl mt-4">No verified listings yet.</h2><p className="muted mt-4">Pricing and cart actions remain hidden until a specific product, lot, and inventory record are verified. The waitlist is a visible preview but signups are paused until the account migration.</p><div className="flex flex-wrap gap-3 mt-7"><Link to="/explore" className="btn">Explore research</Link><Link to="/waitlist" className="btn">View waitlist</Link></div></> : <div className="grid gap-3 mt-6">{available.map((item) => <Link key={item.id} to="/compound/$slug" params={{ slug: item.compoundId }} className="panel-flat p-5">{item.compoundId} · Available for research</Link>)}</div>}</div></section></div>
}
