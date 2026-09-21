export interface Lesson {
  slug: string
  title: string
  summary: string
  status: 'interactive' | 'in-production'
}

export const LESSONS: Lesson[] = [
  { slug: 'how-internet-claims-mutate', title: 'How internet claims mutate', summary: 'Scrub a finding from its abstract to its viral version and watch what each step drops.', status: 'interactive' },
  { slug: 'how-animal-research-works', title: 'How animal research works', summary: 'Models, endpoints and why a rat result is a rat result.', status: 'in-production' },
  { slug: 'what-in-vitro-means', title: 'What "in vitro" means', summary: 'Cells in a dish are a system, not a body.', status: 'in-production' },
  { slug: 'why-replication-matters', title: 'Why replication matters', summary: 'One lab, ten papers, one finding.', status: 'in-production' },
  { slug: 'correlation-vs-causation', title: 'Correlation vs causation', summary: 'Why reports that co-occur are not reports that cause.', status: 'in-production' },
  { slug: 'how-peptides-interact-with-receptors', title: 'How peptides interact with receptors', summary: 'Docking, binding and what a mechanism does and does not tell you.', status: 'in-production' },
  { slug: 'why-source-independence-matters', title: 'Why source independence matters', summary: 'Ten thousand posts are not ten thousand observations.', status: 'in-production' },
  { slug: 'reading-a-research-paper', title: 'Reading a research paper', summary: 'Abstract, methods, results — and the sentence people quote.', status: 'in-production' },
  { slug: 'understanding-clinical-trial-phases', title: 'Understanding clinical-trial phases', summary: 'Phase I to approval, and what each phase measures.', status: 'in-production' },
  { slug: 'research-vs-anecdote', title: 'Research vs anecdote', summary: 'Two evidence classes, kept separate on purpose.', status: 'in-production' },
]
