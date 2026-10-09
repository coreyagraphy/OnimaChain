export type PieceCode = 'G' | 'A' | 'S' | 'L'
export const PIECES: Record<PieceCode, { name: string; color: string; sides: number }> = {
  G: { name: 'Glycine', color: '#edff59', sides: 3 },
  A: { name: 'Alanine', color: '#ff762e', sides: 4 },
  S: { name: 'Serine', color: '#73edff', sides: 5 },
  L: { name: 'Leucine', color: '#b8a2ff', sides: 6 },
}
export interface Level {
  id: string
  version: number
  name: string
  target: PieceCode[]
  gate: boolean
  doubleGate: boolean
  tip: string
  takeaway: string
}
export const LEVELS: Level[] = [
  {
    id: 'first-connection',
    version: 1,
    name: 'First Connection',
    target: ['G', 'A', 'S', 'G'],
    gate: false,
    doubleGate: false,
    tip: 'Select a piece, capture it, then guide it to the glowing slot. Brake before you dock.',
    takeaway:
      'The letters stand for amino-acid building blocks. Their order is called the sequence.',
  },
  {
    id: 'crosscurrent',
    version: 1,
    name: 'Crosscurrent',
    target: ['A', 'G', 'S', 'L', 'G', 'A'],
    gate: true,
    doubleGate: false,
    tip: 'A shutter crosses the middle. Wait for it or take the clear route around either end.',
    takeaway:
      'A chain can contain the same amino acid more than once. Position matters when you read a sequence.',
  },
  {
    id: 'sequence-shift',
    version: 1,
    name: 'Sequence Shift',
    target: ['L', 'S', 'G', 'A', 'S', 'A', 'G', 'L'],
    gate: true,
    doubleGate: true,
    tip: 'Two shutters, a longer sequence. Choose a clear route and take your time.',
    takeaway:
      'Changing the order changes the sequence. This puzzle does not predict the shape or effects of a real peptide.',
  },
]
export function dailyLevel(date = new Date().toISOString().slice(0, 10)) {
  let seed = 2166136261
  for (const ch of 'chainforge-v1:' + date)
    seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0
  return { date, seed, version: 1, level: LEVELS[seed % LEVELS.length] }
}
export function slotPosition(index: number, count: number): [number, number] {
  return [(index - (count - 1) / 2) * Math.min(1.35, 6.5 / (count - 1)), -2.65]
}
export function startPosition(index: number, count: number): [number, number] {
  return [-3.6 + (index % 4) * 2.4, 1.2 + Math.floor(index / 4) * 1.15]
}
export function validateDock(input: {
  actual: PieceCode
  expected: PieceCode
  distance: number
  speed: number
  assisted: boolean
}) {
  if (input.distance > (input.assisted ? 0.6 : 0.4))
    return { ok: false, reason: 'Move closer to the glowing slot, then try Dock again.' }
  if (input.speed > (input.assisted ? 1.2 : 0.55))
    return {
      ok: false,
      reason: 'You are moving too fast. Use Brake, let the piece settle, then Dock.',
    }
  if (input.actual !== input.expected)
    return {
      ok: false,
      reason: `This slot needs ${PIECES[input.expected].name} (${input.expected}). Your piece is ${PIECES[input.actual].name} (${input.actual}). Release it and try another; nothing is lost.`,
    }
  return { ok: true, reason: 'Connected. Select the next building block.' }
}
