export interface Lesson {
  slug: string
  title: string
  summary: string
  status: 'interactive' | 'in-production'
}

export const LESSONS: Lesson[] = [
  { slug: 'how-internet-claims-mutate', title: 'How a study turns into a viral post', summary: 'Drag the slider from the real study to the viral version and watch what gets dropped along the way.', status: 'interactive' },
  { slug: 'how-animal-research-works', title: 'Why a rat result is a rat result', summary: 'What animal studies can tell you, and where they stop.', status: 'in-production' },
  { slug: 'what-in-vitro-means', title: 'Cells in a dish are not a body', summary: 'What “in vitro” means and why it matters.', status: 'in-production' },
  { slug: 'why-replication-matters', title: 'One lab, ten papers, one finding', summary: 'Why a result needs to be repeated by someone else before it counts.', status: 'in-production' },
  { slug: 'correlation-vs-causation', title: 'Happened after is not caused by', summary: 'Why two things showing up together does not mean one caused the other.', status: 'in-production' },
  { slug: 'how-peptides-interact-with-receptors', title: 'How a peptide talks to a cell', summary: 'Receptors, binding, and what “how it works” can and can’t tell you.', status: 'in-production' },
  { slug: 'why-source-independence-matters', title: 'Ten thousand posts, one story', summary: 'Why a flood of posts can all trace back to a single source.', status: 'in-production' },
  { slug: 'reading-a-research-paper', title: 'How to read a study in five minutes', summary: 'Summary, method, results, and the one sentence everyone quotes.', status: 'in-production' },
  { slug: 'understanding-clinical-trial-phases', title: 'Phase I, II, III: what the numbers mean', summary: 'From first safety test to approval, one step at a time.', status: 'in-production' },
  { slug: 'research-vs-anecdote', title: 'A study vs. a story', summary: 'Both matter. They are not the same thing, and we never mix them.', status: 'in-production' },
]
