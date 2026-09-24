/*
 * Human Signal data. The product has NO platform access in this build.
 * Every panel renders the corpus header and an explicit empty state. Nothing here is a number
 * about people; every number is a count of what the corpus holds (zero).
 */

export const CORPUS = {
  sources: 0,
  collectionWindow: 'none',
  platformsEnabled: [] as string[],
  header: 'Real-world reports checked: 0 · Time window: none · Platforms connected: none',
}

export const EMPTY_PLATFORM = 'Not connected yet, so nothing is counted from here'

export const HUMAN_SIGNAL_LINE =
  'People online describe what they felt. That is worth reading, but it does not prove the product caused it.'

export const COMMUNITY_CLASS_LINE =
  'Stories from real people can show patterns. On their own they cannot prove cause and effect.'

export const FINGERPRINT_DIMENSIONS = [
  { id: 'source-diversity', label: 'How many different voices', def: 'How many separate accounts, channels or publications the posts come from.' },
  { id: 'origin-diversity', label: 'How many original stories', def: 'How many posts started on their own instead of copying someone else.' },
  { id: 'first-person', label: 'First-hand vs. hearsay', def: 'How many posts are people describing their own experience rather than repeating others.' },
  { id: 'documentation', label: 'Comes with proof', def: 'How many reports include photos, records or logs.' },
  { id: 'co-intervention', label: 'Other things going on', def: 'How many reports mention other products or changes at the same time.' },
  { id: 'concentration', label: 'A few loud voices?', def: 'How much of the chatter comes from just a handful of accounts.' },
  { id: 'echo', label: 'Copies and reposts', def: 'How many posts are reposts, quotes or near copies.' },
  { id: 'time-dispersion', label: 'Spread over time', def: 'Whether posts came in one burst or over a long stretch.' },
  { id: 'platform-diversity', label: 'How many platforms', def: 'How many different sites the posts come from.' },
  { id: 'promotional', label: 'Selling something?', def: 'How many posts look like ads or carry affiliate links.' },
  { id: 'outcome-description', label: 'Says what happened', def: 'How many reports name a specific result instead of a vague feeling.' },
  { id: 'follow-up', label: 'Came back to update', def: 'How many people posted a follow-up later.' },
] as const

export const NOT_ASSESSED = 'Not measured yet — no reports collected'

export const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', adapter: 'Official API', state: 'Not connected' },
  { id: 'reddit', name: 'Reddit', adapter: 'Licensed / manual / approved coverage', state: 'Not connected' },
  { id: 'tiktok', name: 'TikTok', adapter: 'Creator-authorized / approved coverage', state: 'Not connected' },
  { id: 'podcasts', name: 'Podcast RSS', adapter: 'Public feeds', state: 'Not connected' },
  { id: 'forums', name: 'Public forums', adapter: 'Manual editorial entry', state: 'Not connected' },
  { id: 'publisher', name: 'Public publisher feeds', adapter: 'RSS', state: 'Not connected' },
] as const

export const SCIENTIFIC_SOURCES = [
  { id: 'pubmed', name: 'PubMed', state: 'Build-time citation metadata check; not claim review', enabled: true },
  { id: 'crossref', name: 'Crossref', state: 'Not connected', enabled: false },
  { id: 'clinicaltrials', name: 'ClinicalTrials.gov', state: 'Not connected', enabled: false },
  { id: 'fda', name: 'FDA', state: 'Selected official records attached manually; no live connector', enabled: false },
  { id: 'wada', name: 'WADA', state: 'Not connected', enabled: false },
  { id: 'pdb', name: 'RCSB PDB (identifiers only)', state: 'IDs listed; 3D files not downloaded', enabled: false },
] as const

export const SIGNAL_FILTERS = [
  { id: 'compound', label: 'Compound' },
  { id: 'theme', label: 'What people hoped for' },
  { id: 'body', label: 'Body system' },
  { id: 'platform', label: 'Platform' },
  { id: 'date', label: 'Date' },
  { id: 'report-type', label: 'Report type', options: ['Positive', 'Mixed', 'No effect', 'Adverse', 'Unclear'] },
  { id: 'origin', label: 'Original or copy', options: ['Original story', 'Copy or repost', 'Unknown'] },
  { id: 'documentation', label: 'Comes with proof' },
  { id: 'combination', label: 'One product or a mix' },
] as const

export const CONSTELLATION_LEGEND = [
  { id: 'independent', label: 'Likely an original story', shape: 'filled point' },
  { id: 'derivative', label: 'Repeating someone else', shape: 'hollow point' },
  { id: 'documented', label: 'Report with proof attached', shape: 'ringed point' },
  { id: 'unclear', label: 'Can’t tell where it came from', shape: 'faint point' },
] as const
