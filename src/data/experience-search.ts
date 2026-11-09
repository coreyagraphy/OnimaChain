import { COMPOUND_OPTIONS, EXPERIENCES, OUTCOMES, type Experience, type Outcome } from './experiences.ts'

export const TOPICS: Record<string, { label: string; aliases: string[] }> = {
  sleep: { label: 'Sleep', aliases: ['sleep', 'insomnia', 'cant sleep', 'cannot sleep', 'trouble sleeping', 'sleeping'] },
  anxiety: { label: 'Anxiety', aliases: ['anxiety', 'anxious', 'social anxiety'] },
  focus: { label: 'Focus & brain fog', aliases: ['focus', 'brain fog', 'concentration', 'cognition', 'word finding', 'mental clarity'] },
  mood: { label: 'Mood', aliases: ['mood', 'depression', 'depressed', 'emotional flatness'] },
  recovery: { label: 'Injury & recovery', aliases: ['recovery', 'injury', 'injuries', 'joint pain', 'tendon pain'] },
  gut: { label: 'Digestive symptoms', aliases: ['gut', 'digestion', 'digestive', 'stomach', 'nausea', 'vomiting'] },
  skin: { label: 'Skin', aliases: ['skin'] },
  hair: { label: 'Hair', aliases: ['hair'] },
  weight: { label: 'Weight & appetite', aliases: ['weight', 'weight loss', 'fat loss', 'appetite', 'food noise', 'obesity'] },
  body: { label: 'Body composition', aliases: ['body composition', 'muscle growth'] },
  energy: { label: 'Energy & fatigue', aliases: ['energy', 'fatigue', 'tired', 'tiredness'] },
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

/** Recognized phrases are matched as units; every remaining word must match the same account.
 * Named diseases are deliberately NOT expanded to broad body systems (e.g. cancer -> skin).
 */
export function matchesQuery(record: Experience, query: string): boolean {
  let rest = normalize(query)
  if (!rest) return true
  const allNames = COMPOUND_OPTIONS.flatMap(([slug, label, aliases]) => [
    { phrase: normalize(label), slug }, { phrase: normalize(slug).replaceAll(' ', ''), slug },
    ...aliases.split('|').filter(Boolean).map(alias => ({ phrase: normalize(alias), slug })),
  ]).sort((a, b) => b.phrase.length - a.phrase.length)
  for (const { phrase, slug } of allNames) {
    if (!contains(rest, phrase)) continue
    if (!record.compounds.includes(slug)) return false
    rest = (` ${rest} `).replaceAll(` ${phrase} `, ' ').trim()
  }
  const phrases = Object.entries(TOPICS).flatMap(([topic, data]) => data.aliases.map(alias => ({ topic, phrase: normalize(alias) })))
    .sort((a, b) => b.phrase.length - a.phrase.length)
  for (const { topic, phrase } of phrases) {
    if (!contains(rest, phrase)) continue
    if (!record.topics.includes(topic)) return false
    rest = (` ${rest} `).replaceAll(` ${phrase} `, ' ').trim()
  }
  const text = normalize(`${record.title} ${record.summary}`)
  const words = rest.split(/\s+/).filter(Boolean)
  // Only connective words are ignored. Negation is retained, so "no anxiety" is not treated as "anxiety".
  return words.filter(w => !['and', 'with', 'for', 'the', 'a', 'an', 'of'].includes(w)).every(w => contains(text, w))
}

export function searchExperiences(filters: Filters): Experience[] {
  return EXPERIENCES.filter(record =>
    (record.compounds.includes('5-amino-1mq') ? filters.group === 'other' : filters.group === 'peptides') &&
    (!filters.compound || record.compounds.includes(filters.compound)) &&
    (!filters.outcome || record.outcome === filters.outcome) &&
    (!filters.topic || record.topics.includes(filters.topic)) &&
    matchesQuery(record, filters.q),
  )
}
export const compoundName = (id: string) => COMPOUND_OPTIONS.find(c => c[0] === id)?.[1] ?? id
