/*
 * Goals → research matches, used by Bond Theory.
 *
 * Every line here describes where published research on a compound has actually been done
 * (cells, animals, people, or an approved use) in plain words. Nothing is a dose, a protocol, or a promise.
 * Editorial summaries of well-known published findings; the checked PubMed records live in studies.ts.
 * When a line mentions a number from a human trial, it is the headline figure that trial reported.
 */

export type GoalId =
  | 'injury' | 'gut' | 'inflammation' | 'wounds'
  | 'weight' | 'bloodsugar'
  | 'muscle' | 'gh'
  | 'skin' | 'hair' | 'tan'
  | 'libido' | 'hormones'
  | 'focus' | 'mood' | 'brain-recovery' | 'sleep'
  | 'aging' | 'energy'
  | 'immune'

export interface Goal { id: GoalId; label: string; keywords: string[] }

export const GOALS: Goal[] = [
  { id: 'injury', label: 'Injury, tendon & joint recovery', keywords: ['injury', 'injured', 'tendon', 'tendonitis', 'joint', 'knee', 'shoulder', 'elbow', 'back pain', 'bad back', 'lower back', 'ligament', 'sprain', 'tear', 'rotator', 'achilles', 'sore', 'pain', 'recovery', 'recover', 'surgery'] },
  { id: 'gut', label: 'Gut & digestion', keywords: ['gut', 'stomach', 'ibs', 'leaky', 'ulcer', 'digest', 'digestion', 'bloat', 'bloating', 'colitis', 'crohn', 'reflux', 'bowel'] },
  { id: 'inflammation', label: 'Inflammation & swelling', keywords: ['inflammation', 'inflamed', 'swelling', 'swollen', 'arthritis'] },
  { id: 'wounds', label: 'Wound & scar healing', keywords: ['wound', 'cut', 'scar', 'burn', 'heal', 'healing', 'ulcers'] },
  { id: 'weight', label: 'Weight & fat loss', keywords: ['weight', 'fat', 'belly', 'lose', 'lbs', 'pounds', 'appetite', 'obesity', 'overweight', 'cravings', 'lean out'] },
  { id: 'bloodsugar', label: 'Blood sugar', keywords: ['sugar', 'diabetes', 'diabetic', 'insulin', 'a1c', 'glucose', 'prediabetes'] },
  { id: 'muscle', label: 'Muscle & strength', keywords: ['muscle', 'strength', 'strong', 'bulk', 'gains', 'mass', 'build', 'lifting', 'sarcopenia'] },
  { id: 'gh', label: 'Growth hormone & body composition', keywords: ['growth hormone', 'gh', 'hgh', 'igf', 'body composition', 'recomp'] },
  { id: 'skin', label: 'Skin, wrinkles & glow', keywords: ['skin', 'wrinkle', 'wrinkles', 'collagen', 'glow', 'acne', 'complexion', 'fine lines', 'elasticity'] },
  { id: 'hair', label: 'Hair growth', keywords: ['hair', 'balding', 'thinning', 'hairline', 'alopecia'] },
  { id: 'tan', label: 'Tanning', keywords: ['tan', 'tanning', 'bronze'] },
  { id: 'libido', label: 'Libido & sexual health', keywords: ['libido', 'sex', 'sexual', 'desire', 'erectile', 'ed', 'arousal', 'bedroom'] },
  { id: 'hormones', label: 'Hormones & fertility', keywords: ['testosterone', 'hormone', 'hormones', 'fertility', 'lh', 'estrogen'] },
  { id: 'focus', label: 'Focus & memory', keywords: ['focus', 'memory', 'brain fog', 'fog', 'concentration', 'adhd', 'attention', 'cognitive', 'sharp'] },
  { id: 'mood', label: 'Calm, stress & mood', keywords: ['anxiety', 'anxious', 'stress', 'calm', 'mood', 'depression', 'panic', 'nervous'] },
  { id: 'brain-recovery', label: 'Brain injury & stroke recovery', keywords: ['stroke', 'concussion', 'tbi', 'brain injury', 'head injury'] },
  { id: 'sleep', label: 'Sleep', keywords: ['sleep', 'insomnia', 'melatonin'] },
  { id: 'aging', label: 'Aging & longevity', keywords: ['aging', 'ageing', 'longevity', 'anti-aging', 'youth', 'lifespan', 'older', 'age'] },
  { id: 'energy', label: 'Energy & endurance', keywords: ['energy', 'fatigue', 'tired', 'stamina', 'endurance', 'exhausted', 'cardio'] },
  { id: 'immune', label: 'Immune support', keywords: ['immune', 'immunity', 'sick', 'infection', 'cold', 'flu', 'virus', 'hepatitis'] },
]
export const GOAL_BY_ID = Object.fromEntries(GOALS.map((g) => [g.id, g])) as Record<GoalId, Goal>

/** How far research on a goal has gone, lowest to highest. */
export type Level = 'cells' | 'animals' | 'people' | 'approved'
export const LEVELS: Array<{ id: Level; label: string; short: string }> = [
  { id: 'cells', label: 'Lab studies', short: 'Cells' },
  { id: 'animals', label: 'Animal studies', short: 'Animals' },
  { id: 'people', label: 'Tested in people', short: 'People' },
  { id: 'approved', label: 'Approved use', short: 'Approved' },
]
export const LEVEL_RANK: Record<Level, number> = { cells: 0, animals: 1, people: 2, approved: 3 }

export interface Profile {
  goals: Partial<Record<GoalId, Level>>
  /** How it works, in one short line. */
  how: string
  /** What animal or lab research found. Leads every match. */
  animal: string
  /** Where it stands in people. */
  people: string
}

export const PROFILES: Record<string, Profile> = {
  'bpc-157': { goals: { injury: 'animals', gut: 'animals', inflammation: 'animals', wounds: 'animals' }, how: 'Boosts blood-vessel growth and repair signals', animal: 'In rat studies it sped up healing of tendons, ligaments, muscle and the stomach lining.', people: 'No large human trials yet. Small reports, plus a lot of first-hand stories online.' },
  'tb-500': { goals: { injury: 'animals', wounds: 'animals', inflammation: 'animals' }, how: 'Helps repair cells move into damaged tissue', animal: 'Its parent protein, thymosin beta-4, helped wounds close and heart tissue recover in mice and rats.', people: 'Thymosin beta-4 has had small human trials for eye and skin wounds. TB-500 itself has not.' },
  'wolverine-blend': { goals: { injury: 'animals', wounds: 'animals', gut: 'animals', inflammation: 'animals' }, how: 'BPC-157’s repair signals plus TB-500’s cell movement', animal: 'Each half has its own rat and mouse repair studies. The blend itself has not been studied.', people: 'No trials of the blend. Popular in first-hand recovery stories online.' },
  'ghk-cu': { goals: { skin: 'people', hair: 'cells', wounds: 'animals', aging: 'cells' }, how: 'Carries copper into skin cells to help build collagen', animal: 'In lab and animal studies it boosted collagen and sped up wound repair.', people: 'Small studies of creams and serums found firmer, smoother-looking skin.' },
  'pt-141': { goals: { libido: 'approved' }, how: 'Switches on desire signals in the brain', animal: 'In rats it increased sexual behaviour.', people: 'Approved (Vyleesi) for low sexual desire in some premenopausal women.' },
  'melanotan-ii': { goals: { tan: 'people', libido: 'people' }, how: 'Turns on the skin’s pigment signal and a brain desire signal', animal: 'Darkened skin and increased sexual behaviour in animals.', people: 'Small human studies showed tanning and improved erections.' },
  'ipamorelin': { goals: { gh: 'people', muscle: 'animals' }, how: 'Uses the ghrelin signal to release growth hormone', animal: 'Raised growth hormone in rats and pigs without raising stress hormones.', people: 'Human studies confirm it raises growth hormone. It was also tested for gut recovery after bowel surgery.' },
  'kisspeptin-10': { goals: { hormones: 'people', libido: 'people' }, how: 'Starts the chain that tells the body to make sex hormones', animal: 'Triggered reproductive hormone release in animals.', people: 'In human studies it briefly raised LH and testosterone, and changed how the brain responds to sexual cues.' },
  'cjc-1295': { goals: { gh: 'people', muscle: 'animals' }, how: 'A long-lasting copy of the signal that releases growth hormone', animal: 'Raised growth hormone in animals.', people: 'Early human trials showed growth hormone and IGF-1 stayed higher for days after one dose.' },
  'sermorelin': { goals: { gh: 'people' }, how: 'A short copy of the body’s own growth-hormone release signal', animal: 'Raised growth hormone in animals.', people: 'Was once FDA-approved to test and treat growth hormone deficiency in children.' },
  'tesamorelin': { goals: { weight: 'approved', gh: 'approved' }, how: 'Signals the body to release more of its own growth hormone', animal: 'Raised growth hormone in animals.', people: 'Approved (Egrifta) to reduce belly fat in adults with HIV-related fat buildup.' },
  'hexarelin': { goals: { gh: 'people' }, how: 'A strong trigger of growth hormone release', animal: 'Raised growth hormone and protected heart tissue in rats.', people: 'Small human studies show strong growth hormone release.' },
  'ghrp-2': { goals: { gh: 'people' }, how: 'Uses the ghrelin signal to release growth hormone', animal: 'Raised growth hormone in animals.', people: 'Raises growth hormone and hunger in human studies.' },
  'ghrp-6': { goals: { gh: 'people', muscle: 'animals' }, how: 'Uses the ghrelin signal to release growth hormone and raise hunger', animal: 'Raised growth hormone and food intake in animals.', people: 'Raises growth hormone and hunger in human studies.' },
  'igf-1-lr3': { goals: { muscle: 'cells' }, how: 'A long-lasting version of IGF-1, a growth signal', animal: 'Mostly lab work, where it strongly grows muscle and other cells.', people: 'No human trials.' },
  'follistatin-344': { goals: { muscle: 'animals' }, how: 'Blocks myostatin, the body’s muscle brake', animal: 'In mice and monkeys, raising follistatin (by gene therapy) grew more muscle.', people: 'No human trials of the peptide.' },
  'semax': { goals: { focus: 'people', 'brain-recovery': 'people' }, how: 'Raises BDNF, a brain growth factor', animal: 'Raised brain growth factor and protected nerve cells in rats.', people: 'Used in Russia for stroke recovery and attention; small human studies.' },
  'selank': { goals: { mood: 'people', focus: 'animals' }, how: 'Works on calming brain signals, related to the immune peptide tuftsin', animal: 'Reduced anxious behaviour in rats.', people: 'Russian studies in anxiety found calming effects.' },
  'cerebrolysin': { goals: { 'brain-recovery': 'people', focus: 'people' }, how: 'A mix of brain-derived peptides that support nerve cells', animal: 'Supported nerve cell survival in animal models of brain injury.', people: 'Tested in stroke and brain-injury trials with mixed results; used in several countries.' },
  'p21': { goals: { focus: 'animals' }, how: 'Supports growth of new nerve cells', animal: 'Improved memory and new nerve cell growth in mice.', people: 'No human studies.' },
  'pinealon': { goals: { focus: 'animals', aging: 'animals' }, how: 'A short peptide aimed at brain cells', animal: 'Protected brain cells in rat and lab studies.', people: 'Very little human data.' },
  'epitalon': { goals: { aging: 'animals', sleep: 'animals' }, how: 'Linked to melatonin and telomere activity', animal: 'Lengthened lifespan in some rodent studies and changed melatonin levels.', people: 'Small studies, mostly from one research group.' },
  'mots-c': { goals: { energy: 'animals', weight: 'animals', bloodsugar: 'animals', aging: 'animals' }, how: 'A signal from mitochondria that tunes how cells burn fuel', animal: 'In mice it improved exercise capacity and insulin sensitivity and blocked diet-driven weight gain.', people: 'Levels measured in people; no published treatment trials yet.' },
  'ss-31': { goals: { energy: 'people', aging: 'animals' }, how: 'Protects the inner wall of mitochondria, the cell’s power plants', animal: 'Restored cell energy and muscle function in old mice.', people: 'Tested in trials for rare mitochondrial diseases such as Barth syndrome.' },
  'humanin': { goals: { aging: 'animals', energy: 'animals' }, how: 'A protective signal made by mitochondria', animal: 'Protected cells and improved metabolism in mice.', people: 'Higher levels are linked to healthy aging in people; no treatment trials.' },
  'nad-plus': { goals: { energy: 'people', aging: 'people' }, how: 'A molecule every cell needs to make energy', animal: 'Raising NAD improved energy and aging markers in mice.', people: 'Small human studies show boosters raise NAD levels; effects on aging are still being tested.' },
  'glutathione': { goals: { skin: 'people', aging: 'cells' }, how: 'The body’s main built-in antioxidant', animal: 'Protects cells from oxidative stress in lab studies.', people: 'Small trials showed brighter, more even skin tone.' },
  'thymosin-alpha-1': { goals: { immune: 'approved' }, how: 'Helps train and activate immune cells', animal: 'Strengthened immune response in animal infection models.', people: 'Approved in several countries (Zadaxin) for hepatitis B and as an immune helper.' },
  'thymalin': { goals: { immune: 'people' }, how: 'A thymus extract that supports immune cells', animal: 'Supported immune function in aging animals.', people: 'Used in Russia; studied mostly by one research group.' },
  'thymogen': { goals: { immune: 'people' }, how: 'A two-amino-acid thymus peptide that supports immune cells', animal: 'Supported immune function in animal studies.', people: 'Used in Russia; limited studies outside it.' },
  'll-37': { goals: { immune: 'animals', wounds: 'people' }, how: 'A natural germ-fighting peptide made by the body', animal: 'Killed bacteria and helped wounds heal in animals.', people: 'A small trial on leg ulcers found faster healing.' },
  'kpv': { goals: { gut: 'animals', inflammation: 'animals', skin: 'animals' }, how: 'Calms inflammation signals', animal: 'Calmed gut inflammation (colitis) in mice.', people: 'No human trials yet.' },
  'aod-9604': { goals: { weight: 'people' }, how: 'A fragment of growth hormone aimed at fat', animal: 'Burned fat in obese mice.', people: 'Human trials did not show weight loss beyond placebo.' },
  'semaglutide': { goals: { weight: 'approved', bloodsugar: 'approved' }, how: 'Copies GLP-1, the gut hormone that turns down appetite', animal: 'Cut food intake and weight in animals.', people: 'Approved (Wegovy, Ozempic). About 15% average weight loss in the main trial.' },
  'tirzepatide': { goals: { weight: 'approved', bloodsugar: 'approved' }, how: 'Copies two gut hormones, GLP-1 and GIP', animal: 'Cut food intake and weight in animals.', people: 'Approved (Zepbound, Mounjaro). About 21% average weight loss at the top dose in the main trial.' },
  'retatrutide': { goals: { weight: 'people', bloodsugar: 'people' }, how: 'Copies three gut and metabolism hormones at once', animal: 'Cut food intake and weight in animals.', people: 'About 24% average weight loss at 48 weeks in a phase 2 trial; not approved yet.' },
}

export function profileFor(slug: string): Profile | null { return PROFILES[slug] ?? null }

/** Highest research level a compound reached on any goal. */
export function topLevel(slug: string): Level {
  const p = PROFILES[slug]
  if (!p) return 'cells'
  return (Object.values(p.goals) as Level[]).reduce<Level>((a, b) => (LEVEL_RANK[b] > LEVEL_RANK[a] ? b : a), 'cells')
}

/** Goals mentioned in free text ("bad knee and bloating" → injury, gut). */
export function goalsFromText(text: string): GoalId[] {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9+\- ]/g, ' ')} `
  return GOALS.filter((g) => g.keywords.some((k) => t.includes(` ${k} `) || t.includes(` ${k}s `))).map((g) => g.id)
}

/** Compounds studied for a goal, strongest research first. */
export function matchesFor(goal: GoalId): Array<{ slug: string; level: Level }> {
  return Object.entries(PROFILES)
    .filter(([, p]) => p.goals[goal])
    .map(([slug, p]) => ({ slug, level: p.goals[goal]! }))
    .sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level])
}
