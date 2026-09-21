/*
 * Human Signal data. The product has NO platform access in this build.
 * Every panel renders the corpus header and an explicit empty state. Nothing here is a number
 * about people; every number is a count of what the corpus holds (zero).
 */

export const CORPUS = {
  sources: 0,
  collectionWindow: 'none',
  platformsEnabled: [] as string[],
  header: 'Corpus: 0 sources · Collection window: none · Platforms: none enabled',
}

export const EMPTY_PLATFORM = 'No source access for this platform'

export const HUMAN_SIGNAL_LINE =
  'Public reports describe experiences; they do not establish that the compound caused those outcomes.'

export const COMMUNITY_CLASS_LINE =
  'Community reports are a distinct evidence class that can reveal recurring experiences but cannot independently establish causation.'

export const FINGERPRINT_DIMENSIONS = [
  { id: 'source-diversity', label: 'Source diversity', def: 'How many distinct sources (accounts, channels, publications) contribute mentions.' },
  { id: 'origin-diversity', label: 'Independent-origin diversity', def: 'How many estimated independent origin clusters exist behind the mentions.' },
  { id: 'first-person', label: 'First-person proportion', def: 'Share of mentions that are first-person accounts rather than commentary.' },
  { id: 'documentation', label: 'Documentation present', def: 'Share of reports with any supporting documentation (images, records, logs).' },
  { id: 'co-intervention', label: 'Co-intervention prevalence', def: 'Share of reports that mention concurrent interventions.' },
  { id: 'concentration', label: 'Source concentration', def: 'How much of the signal comes from a few sources.' },
  { id: 'echo', label: 'Duplication / echo level', def: 'Share of mentions classified as reposts, quotations or near-duplicates.' },
  { id: 'time-dispersion', label: 'Time dispersion', def: 'How mentions distribute over the collection window.' },
  { id: 'platform-diversity', label: 'Platform diversity', def: 'How many enabled platforms contribute mentions.' },
  { id: 'promotional', label: 'Promotional / affiliate contamination', def: 'Share of mentions with affiliate or promotional indicators.' },
  { id: 'outcome-description', label: 'Identifiable outcome description', def: 'Share of reports that name a specific observed outcome.' },
  { id: 'follow-up', label: 'Follow-up availability', def: 'Share of reports with a later follow-up from the same account.' },
] as const

export const NOT_ASSESSED = 'Not assessed — no corpus'

export const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', adapter: 'Official API', state: 'No source access enabled' },
  { id: 'reddit', name: 'Reddit', adapter: 'Licensed / manual / approved coverage', state: 'No source access enabled' },
  { id: 'tiktok', name: 'TikTok', adapter: 'Creator-authorized / approved coverage', state: 'No source access enabled' },
  { id: 'podcasts', name: 'Podcast RSS', adapter: 'Public feeds', state: 'No source access enabled' },
  { id: 'forums', name: 'Public forums', adapter: 'Manual editorial entry', state: 'No source access enabled' },
  { id: 'publisher', name: 'Public publisher feeds', adapter: 'RSS', state: 'No source access enabled' },
] as const

export const SCIENTIFIC_SOURCES = [
  { id: 'pubmed', name: 'PubMed', state: 'Indexed — PMIDs verified via NCBI eutils at build time', enabled: true },
  { id: 'crossref', name: 'Crossref', state: 'Not enabled', enabled: false },
  { id: 'clinicaltrials', name: 'ClinicalTrials.gov', state: 'Not enabled', enabled: false },
  { id: 'fda', name: 'FDA', state: 'Not enabled', enabled: false },
  { id: 'wada', name: 'WADA', state: 'Not enabled', enabled: false },
  { id: 'pdb', name: 'RCSB PDB (identifiers only)', state: 'Identifiers listed; structures not fetched', enabled: false },
] as const

export const SIGNAL_FILTERS = [
  { id: 'compound', label: 'Compound' },
  { id: 'theme', label: 'Outcome theme' },
  { id: 'body', label: 'Body system' },
  { id: 'platform', label: 'Platform' },
  { id: 'date', label: 'Date' },
  { id: 'report-type', label: 'Report type', options: ['Positive', 'Mixed', 'No effect', 'Adverse', 'Unclear'] },
  { id: 'origin', label: 'Origin', options: ['Independent origin', 'Echo', 'Unknown'] },
  { id: 'documentation', label: 'Documentation present' },
  { id: 'combination', label: 'Single compound / combination' },
] as const

export const CONSTELLATION_LEGEND = [
  { id: 'independent', label: 'Independent-origin candidate', shape: 'filled point' },
  { id: 'derivative', label: 'Derivative discussion', shape: 'hollow point' },
  { id: 'documented', label: 'Documented report', shape: 'ringed point' },
  { id: 'unclear', label: 'Unclear provenance', shape: 'faint point' },
] as const
