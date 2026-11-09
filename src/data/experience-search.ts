import { COMPOUND_OPTIONS, EXPERIENCES, OUTCOMES, type Experience, type Outcome } from './experiences.ts'

export const TOPICS: Record<string, { label: string; aliases: string[] }> = {
  knee: { label: 'Knee pain & meniscus', aliases: ['knee', 'knees', 'knee pain', 'knee hurts', 'knees hurt', 'knee aches', 'sore knee', 'sore knees', 'pain in my knee', 'pain in the knee', 'meniscus', 'meniscus tear', 'torn meniscus'] },
  shoulder: { label: 'Shoulder pain & rotator cuff', aliases: ['shoulder', 'shoulders', 'shoulder pain', 'shoulder hurts', 'shoulders hurt', 'sore shoulder', 'rotator cuff', 'rotator cuff injury'] },
  neck: { label: 'Neck pain', aliases: ['neck', 'neck pain', 'neck hurts', 'sore neck', 'neck ache'] },
  'pinched-nerve': { label: 'Pinched nerve', aliases: ['pinched nerve', 'pinch nerve', 'trapped nerve', 'compressed nerve'] },
  nerve: { label: 'Nerve pain & tingling', aliases: ['nerve pain', 'nerve symptoms', 'tingling', 'pins and needles', 'tingling arm', 'arm tingling', 'tingling hand', 'hand tingling'] },
  'leg-swelling': { label: 'Leg, ankle & foot swelling', aliases: ['leg swelling', 'swollen leg', 'swollen legs', 'leg is swollen', 'legs are swollen', 'ankle swelling', 'swollen ankles', 'swollen ankle', 'foot swelling', 'feet swelling', 'swollen feet', 'swollen foot', 'puffy ankles', 'edema', 'oedema'] },
  cholesterol: { label: 'Cholesterol & blood lipids', aliases: ['cholesterol', 'high cholesterol', 'ldl', 'ldl cholesterol', 'high ldl', 'hdl', 'hdl cholesterol', 'triglycerides', 'high triglycerides', 'lipids', 'blood lipids', 'lipid panel', 'hyperlipidemia', 'dyslipidemia'] },
  sleep: { label: 'Sleep', aliases: ['sleep', 'insomnia', 'cant sleep', 'cannot sleep', 'trouble sleeping', 'sleeping', 'cant fall asleep', 'cannot fall asleep', 'keep waking up', 'wake up at night', 'trouble falling asleep', 'not sleeping well', 'dont sleep well'] },
  anxiety: { label: 'Anxiety', aliases: ['anxiety', 'anxious', 'social anxiety'] },
  focus: { label: 'Focus & brain fog', aliases: ['focus', 'brain fog', 'concentration', 'cognition', 'word finding', 'mental clarity', 'cant concentrate', 'cannot concentrate', 'cant focus', 'cannot focus', 'brain feels foggy', 'forget words'] },
  mood: { label: 'Mood', aliases: ['mood', 'depression', 'depressed', 'emotional flatness'] },
  recovery: { label: 'Injury & recovery', aliases: ['recovery', 'injury', 'injuries', 'joint pain', 'tendon pain'] },
  gut: { label: 'Digestive symptoms', aliases: ['gut', 'digestion', 'digestive', 'stomach', 'nausea', 'vomiting'] },
  skin: { label: 'Skin', aliases: ['skin'] },
  hair: { label: 'Hair', aliases: ['hair'] },
  weight: { label: 'Weight & appetite', aliases: ['weight', 'weight loss', 'fat loss', 'appetite', 'food noise', 'obesity'] },
  body: { label: 'Body composition', aliases: ['body composition', 'muscle growth'] },
  energy: { label: 'Energy & fatigue', aliases: ['energy', 'fatigue', 'tired', 'tiredness', 'always tired', 'tired all the time', 'no energy', 'low energy', 'exhausted', 'worn out'] },
  sexual: { label: 'Sexual function', aliases: ['sexual function', 'libido', 'erectile dysfunction', 'erections', 'sex drive'] },
  heart: { label: 'Heart-related symptoms', aliases: ['heart', 'palpitations', 'heart rate', 'cardiovascular'] },
  sinus: { label: 'Sinus & congestion', aliases: ['sinus', 'sinusitis', 'congestion'] },
  injection: { label: 'Injection-site reactions', aliases: ['injection site', 'injection site reactions', 'bruising', 'stinging'] },
  mecfs: { label: 'ME/CFS', aliases: ['me cfs', 'mecfs', 'cfs', 'chronic fatigue syndrome'] },
  immune: { label: 'Immune-related symptoms', aliases: ['immune'] },
  'long-covid': { label: 'Long COVID discussion', aliases: ['long covid', 'post covid'] },
}
export type Filters = { q: string; compound: string; outcome: '' | Outcome; topic: string; group: 'peptides' | 'other' }
export const DEFAULT_FILTERS: Filters = { q: '', compound: '', outcome: '', topic: '', group: 'peptides' }
export const normalize = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const contains = (text: string, phrase: string) => (` ${text} `).includes(` ${phrase} `)

export function validateFilters(raw: Record<string, unknown>): Filters {
  return {
    q: typeof raw.q === 'string' ? raw.q.slice(0, 180) : '',
    compound: COMPOUND_OPTIONS.some(c => c[0] === raw.compound) ? String(raw.compound) : '',
    outcome: typeof raw.outcome === 'string' && Object.hasOwn(OUTCOMES, raw.outcome) ? raw.outcome as Outcome : '',
    topic: typeof raw.topic === 'string' && Object.hasOwn(TOPICS, raw.topic) ? raw.topic : '',
    group: raw.group === 'other' ? 'other' : 'peptides',
  }
}

const allNames = COMPOUND_OPTIONS.flatMap(([slug, label, aliases]) => [
    { phrase: normalize(label), slug }, { phrase: normalize(slug).replaceAll(' ', ''), slug },
    ...aliases.split('|').filter(Boolean).map(alias => ({ phrase: normalize(alias), slug })),
  ]).sort((a, b) => b.phrase.length - a.phrase.length)
const topicPhrases = Object.entries(TOPICS).flatMap(([topic, data]) => [data.label, ...data.aliases].map(alias => ({ topic, phrase: normalize(alias) })))
  .sort((a, b) => b.phrase.length - a.phrase.length)
const filler = new Set(['and', 'with', 'for', 'the', 'a', 'an', 'of', 'in', 'on', 'around', 'my', 'i', 'im', 'ive', 'have', 'having', 'am', 'is', 'are', 'feel', 'feeling', 'been', 'lately', 'really', 'very', 'please'])

/** Normalize phrasing, not diagnoses. Unknown body parts and diseases remain required words. */
function conversationalQuery(query: string) {
  return normalize(query)
    .replace(/\b(cholesterol|ldl|triglycerides) (?:is |are )?(?:too )?high\b/g, 'high $1')
    .replace(/^(?:can you |could you )?(?:show me|find|search for|looking for|what peptides (?:help|are associated with)|which peptides (?:help|are associated with))\b/, '')
    .replace(/\b(knees?|shoulders?|neck|legs?|ankles?|feet|foot)\s+(?:is |are |feels? |has been |have been )?(?:really |very )?(hurting|aching|sore|painful|swelling|swollen)\b/g, (_, site: string, symptom: string) => `${site} ${['swelling', 'swollen'].includes(symptom) ? 'swelling' : 'pain'}`)
    .replace(/\b(?:left|right|both) (?=(?:knees?|shoulders?|legs?|ankles?|feet|foot)\b)/g, '')
    .replace(/\bknees pain\b/g, 'knee pain').replace(/\bshoulders pain\b/g, 'shoulder pain')
    .replace(/\blegs swelling\b/g, 'leg swelling').replace(/\bankles swelling\b/g, 'ankle swelling')
    .trim()
}

export function interpretQuery(query: string) {
  let rest = conversationalQuery(query)
  const compounds: string[] = []
  const topics: string[] = []
  for (const { phrase, slug } of allNames) {
    if (!contains(rest, phrase)) continue
    if (!compounds.includes(slug)) compounds.push(slug)
    rest = (` ${rest} `).replaceAll(` ${phrase} `, ' ').trim()
  }
  for (const { topic, phrase } of topicPhrases) {
    if (!contains(rest, phrase)) continue
    if (!topics.includes(topic)) topics.push(topic)
    rest = (` ${rest} `).replaceAll(` ${phrase} `, ' ').trim()
  }
  const words = rest.split(/\s+/).filter(w => w && !filler.has(w))
  // Known phrases such as "can't sleep" and "no energy" are consumed first.
  // Other negation cannot safely be interpreted as asking for a benefit or absence of harm.
  const ambiguousNegation = words.some(w => ['no', 'not', 'without', 'dont', 'doesnt', 'isnt', 'arent', 'never', 'cant', 'cannot'].includes(w))
  return { compounds, topics, words, ambiguousNegation }
}

function matchesInterpretation(record: Experience, parsed: ReturnType<typeof interpretQuery>, query: string): boolean {
  if (!query.trim()) return true
  if (parsed.ambiguousNegation || !(parsed.compounds.length || parsed.topics.length || parsed.words.length)) return false
  const text = normalize(`${record.title} ${record.summary}`)
  return parsed.compounds.every(id => record.compounds.includes(id)) && parsed.topics.every(id => record.topics.includes(id)) && parsed.words.every(word => contains(text, word))
}

export function matchesQuery(record: Experience, query: string): boolean {
  return matchesInterpretation(record, interpretQuery(query), query)
}

export function searchExperiences(filters: Filters): Experience[] {
  const parsed = interpretQuery(filters.q)
  return EXPERIENCES.filter(record =>
    (record.compounds.includes('5-amino-1mq') ? filters.group === 'other' : filters.group === 'peptides') &&
    (!filters.compound || record.compounds.includes(filters.compound)) &&
    (!filters.outcome || record.outcome === filters.outcome) &&
    (!filters.topic || record.topics.includes(filters.topic)) &&
    matchesInterpretation(record, parsed, filters.q),
  )
}
export const compoundName = (id: string) => COMPOUND_OPTIONS.find(c => c[0] === id)?.[1] ?? id
