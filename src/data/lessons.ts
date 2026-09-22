export type LessonCategory = 'claims' | 'research' | 'biology' | 'clinical'
export type LessonStatus = 'live' | 'forming' | 'next-up'
export type LessonVisual = 'mutation' | 'species' | 'dish' | 'replication' | 'causation' | 'receptor' | 'echo' | 'paper' | 'phases' | 'split'

export interface Lesson {
  slug: string
  title: string
  summary: string
  category: LessonCategory
  status: LessonStatus
  visual: LessonVisual
  accent: string
  lessonGoal: string
  misunderstanding: string
  takeaway: string
  teaser: { question: string; options: [string, string]; correct: 0 | 1; explanation: string } | null
  sources: { label: string; url: string; kind: string }[]
}

export const LESSON_CATEGORIES: { id: LessonCategory; label: string; description: string }[] = [
  { id: 'claims', label: 'Claims', description: 'How research changes as it travels online.' },
  { id: 'research', label: 'Research basics', description: 'What a study tested, and what it cannot settle.' },
  { id: 'biology', label: 'Biology', description: 'How a signal can start without proving an outcome.' },
  { id: 'clinical', label: 'Clinical development', description: 'How evidence moves toward people.' },
]

export const LESSONS: Lesson[] = [
  {
    slug: 'how-internet-claims-mutate', title: 'How a study turns into a viral post',
    summary: 'Drag from the original study to the viral version and watch what gets dropped along the way.',
    category: 'claims', status: 'live', visual: 'mutation', accent: '#67DFF2',
    lessonGoal: 'Trace each change in wording back to the evidence that started it.',
    misunderstanding: 'A viral sentence can sound like a direct quote even when it has dropped the species, setup, and uncertainty.',
    takeaway: 'Ask what was actually studied before repeating the short version.', teaser: null,
    sources: [
      { label: 'Original BPC-157 tendon study (PMID 21030672)', url: 'https://pubmed.ncbi.nlm.nih.gov/21030672/', kind: 'Original study' },
      { label: 'Understanding Medical Research', url: 'https://medlineplus.gov/understandingmedicalresearch.html', kind: 'Research literacy' },
    ],
  },
  {
    slug: 'how-animal-research-works', title: 'Why a rat result is still a rat result',
    summary: 'Animal studies can reveal biological signals. They do not automatically tell us what happens in people.',
    category: 'research', status: 'next-up', visual: 'species', accent: '#8FBFFF',
    lessonGoal: 'Spot the species in a study and keep its conclusion at that stage.',
    misunderstanding: 'A promising result in an animal is often repeated as if the same outcome had been shown in people.',
    takeaway: 'Name the species every time you describe the result.',
    teaser: { question: 'A study found a result in rats. What can you say now?', options: ['The same result has been shown in people.', 'The result was observed in rats; human effects still need testing.'], correct: 1, explanation: 'A rat finding can guide the next question. It does not replace a human study.' },
    sources: [{ label: 'Understanding Medical Research', url: 'https://medlineplus.gov/understandingmedicalresearch.html', kind: 'Research literacy' }],
  },
  {
    slug: 'what-in-vitro-means', title: 'Cells in a dish are not a body',
    summary: '“In vitro” means studying cells outside a living body. It can suggest a mechanism without proving a whole-body effect.',
    category: 'research', status: 'forming', visual: 'dish', accent: '#79D9C1',
    lessonGoal: 'Recognize what a cell experiment isolates and what it leaves out.',
    misunderstanding: 'A change in cultured cells is sometimes described as a proven result in a person.',
    takeaway: 'A dish is a useful test environment, not a stand-in for a whole body.',
    teaser: { question: 'A peptide changed cultured cells in a dish. What was directly observed?', options: ['A change in cells outside the body.', 'A proven clinical benefit in people.'], correct: 0, explanation: 'The observation belongs to the cells and conditions used in that experiment.' },
    sources: [{ label: 'NCI definition of in vitro', url: 'https://www.cancer.gov/publications/dictionaries/cancer-terms/def/in-vitro', kind: 'Definition' }],
  },
  {
    slug: 'why-replication-matters', title: 'One lab, ten papers, one finding',
    summary: 'Ten papers from one research group are not ten independent confirmations.',
    category: 'research', status: 'forming', visual: 'replication', accent: '#BEA9EE',
    lessonGoal: 'Look for independent research groups, not just a long list of publications.',
    misunderstanding: 'A paper count can be mistaken for the number of independent teams that checked a result.',
    takeaway: 'Ask who repeated the experiment and whether the result held up.',
    teaser: { question: 'Ten papers from one lab and one paper from a second lab: how many independent labs?', options: ['Eleven', 'Two'], correct: 1, explanation: 'Paper count and independent research groups are different things.' },
    sources: [{ label: 'NIH rigor and reproducibility', url: 'https://www.grants.nih.gov/policy-and-compliance/policy-topics/reproducibility', kind: 'Research methods' }],
  },
  {
    slug: 'correlation-vs-causation', title: 'Happened after is not caused by',
    summary: 'Two things happening together does not prove one caused the other.',
    category: 'claims', status: 'forming', visual: 'causation', accent: '#F6AE78',
    lessonGoal: 'Separate a sequence of events from evidence of cause and effect.',
    misunderstanding: '“After taking it, this happened” can sound causal even when other explanations remain.',
    takeaway: 'Timing is a clue, not proof of cause.',
    teaser: { question: 'Someone felt different after using a product. Does timing alone show why?', options: ['Yes, the later event proves the cause.', 'No, other explanations still need checking.'], correct: 1, explanation: 'A before-and-after story does not rule out other causes.' },
    sources: [{ label: 'NLM: causation and study design', url: 'https://www.nlm.nih.gov/oet/ed/stats/02-400.html', kind: 'Research methods' }],
  },
  {
    slug: 'how-peptides-interact-with-receptors', title: 'How a peptide talks to a cell',
    summary: 'A peptide can bind to a receptor and start a signal. That mechanism alone does not prove an outcome.',
    category: 'biology', status: 'forming', visual: 'receptor', accent: '#72C6FF',
    lessonGoal: 'Understand the path from a molecule to a receptor to a cellular signal.',
    misunderstanding: 'A plausible pathway is sometimes presented as a measured clinical result.',
    takeaway: 'Mechanism explains a possibility; outcomes need their own evidence.',
    teaser: { question: 'A peptide activates a receptor in a lab. What still needs testing?', options: ['Whether that produces a meaningful outcome in people.', 'Nothing; receptor binding proves a clinical benefit.'], correct: 0, explanation: 'Binding and downstream signals are not the same as a measured outcome in people.' },
    sources: [{ label: 'NCBI Bookshelf: cellular receptors', url: 'https://www.ncbi.nlm.nih.gov/books/NBK554403/', kind: 'Cell biology' }],
  },
  {
    slug: 'why-source-independence-matters', title: 'Ten thousand posts. One story.',
    summary: 'Many reposts can trace back to one account. Repetition is not independent evidence.',
    category: 'claims', status: 'forming', visual: 'echo', accent: '#E59BE8',
    lessonGoal: 'Trace repeated stories back to their earliest identifiable source.',
    misunderstanding: 'A large post count can look like many separate experiences.',
    takeaway: 'Count distinct origins before treating a chorus as corroboration.',
    teaser: { question: 'Five hundred posts repeat one original account. How many original accounts are confirmed?', options: ['Five hundred', 'One'], correct: 1, explanation: 'Reposts can amplify reach without adding independent firsthand accounts.' },
    sources: [{ label: 'The spread of true and false news online (PMID 29590045)', url: 'https://pubmed.ncbi.nlm.nih.gov/29590045/', kind: 'Information research' }],
  },
  {
    slug: 'reading-a-research-paper', title: 'How to read a study in five minutes',
    summary: 'Find the question, method, result, and limitation before trusting a repeated headline.',
    category: 'research', status: 'forming', visual: 'paper', accent: '#CDE9ED',
    lessonGoal: 'Get oriented in a paper without reading every line first.',
    misunderstanding: 'A conclusion can sound broader than the method and measured result allow.',
    takeaway: 'Start with the question and method, then read the result and limitation together.',
    teaser: { question: 'Where would you check what researchers actually measured?', options: ['Methods and results', 'Headline alone'], correct: 0, explanation: 'The method tells you how the test was run; the results show what was observed.' },
    sources: [{ label: 'NCCIH: how to make sense of a journal article', url: 'https://www.nccih.nih.gov/health/know-science/how-to-make-sense-of-a-scientific-journal-article/abstract-and-main-section', kind: 'Reading guide' }],
  },
  {
    slug: 'understanding-clinical-trial-phases', title: 'Phase I, II, III: what the numbers mean',
    summary: 'Clinical development moves through different questions; a phase label is not an approval.',
    category: 'clinical', status: 'forming', visual: 'phases', accent: '#9BAAF9',
    lessonGoal: 'Recognize why each clinical phase exists and what a phase label cannot guarantee.',
    misunderstanding: '“In Phase III” is sometimes read as “proven and approved.”',
    takeaway: 'Look for the actual results and a regulator decision, not just the phase number.',
    teaser: { question: 'A compound has entered Phase III. Is it automatically approved?', options: ['Yes', 'No'], correct: 1, explanation: 'A phase describes a stage of study, not a completed approval decision.' },
    sources: [{ label: 'FDA: clinical research phases', url: 'https://www.fda.gov/patients/drug-development-process/step-3-clinical-research', kind: 'Regulatory explanation' }],
  },
  {
    slug: 'research-vs-anecdote', title: 'A study vs. a story',
    summary: 'A controlled study and a personal experience can both be useful. They answer different questions.',
    category: 'clinical', status: 'forming', visual: 'split', accent: '#7CD8E5',
    lessonGoal: 'Know what controlled research can test and what one personal account can describe.',
    misunderstanding: 'A vivid account can be mistaken for a comparison across people.',
    takeaway: 'Listen to the story, but use study design to judge broad claims.',
    teaser: { question: 'Which can directly compare outcomes across groups?', options: ['A single personal story', 'A well-designed controlled study'], correct: 1, explanation: 'A controlled design can compare groups; a single story cannot make that comparison.' },
    sources: [{ label: 'Understanding Medical Research', url: 'https://medlineplus.gov/understandingmedicalresearch.html', kind: 'Research literacy' }],
  },
]

export const LESSON_BY_SLUG: Record<string, Lesson> = Object.fromEntries(LESSONS.map((lesson) => [lesson.slug, lesson]))

export const BEGINNER_PATH = [
  'research-vs-anecdote', 'how-animal-research-works', 'what-in-vitro-means', 'how-internet-claims-mutate',
  'why-replication-matters', 'how-peptides-interact-with-receptors', 'understanding-clinical-trial-phases',
  'reading-a-research-paper', 'why-source-independence-matters', 'correlation-vs-causation',
]
