import { LEVELS, PIECES, slotPosition, validateDock, type Level, type PieceCode } from './levels.ts'
export type PlayMode = 'practice' | 'precision'
export type Phase = 'briefing' | 'playing' | 'paused' | 'completed'
export interface Snapshot {
  phase: Phase
  selected: number | null
  held: number | null
  docked: number[]
  elapsed: number
  errors: number
  collisions: number
  braking: boolean
  assisted: boolean
  message: string
  revision: number
}
export interface Instrument {
  capture: (id: number) => void
  release: () => void
  move: (x: number, z: number) => void
  guide: () => void
  dock: () => void
  undo: (id: number) => void
  restart: () => void
  recenter: () => void
}
export class GameSession {
  readonly level: Level
  readonly mode: PlayMode
  readonly seed: number
  state: Snapshot = {
    phase: 'briefing',
    selected: null,
    held: null,
    docked: [],
    elapsed: 0,
    errors: 0,
    collisions: 0,
    braking: false,
    assisted: true,
    message: 'Select a piece, then Capture. The target sequence stays visible.',
    revision: 0,
  }
  instrument: Instrument | null = null
  listeners = new Set<() => void>()
  constructor(level = LEVELS[0], mode: PlayMode = 'practice', seed = 0) {
    this.level = level
    this.mode = mode
    this.seed = seed
    this.state.assisted = mode === 'practice'
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
  snapshot = () => this.state
  update(patch: Partial<Snapshot>) {
    this.state = { ...this.state, ...patch, revision: this.state.revision + 1 }
    this.listeners.forEach((fn) => fn())
  }
  start() {
    this.update({ phase: 'playing', message: this.level.tip })
  }
  pause() {
    if (this.state.phase === 'playing') this.update({ phase: 'paused', braking: false })
    else if (this.state.phase === 'paused') this.update({ phase: 'playing' })
  }
  select(id: number) {
    if (this.state.phase !== 'playing' || this.state.docked.includes(id)) return
    if (this.state.held !== null) this.release()
    this.update({
      selected: id,
      message: `${PIECES[this.level.target[id]].name} selected. Press Capture to attach the tether.`,
    })
  }
  capture() {
    if (this.state.phase !== 'playing' || this.state.selected === null) return
    this.update({
      held: this.state.selected,
      message: 'Tether attached. Move the aim point, use arrow steps, or choose Guide to slot.',
    })
    this.instrument?.capture(this.state.selected)
  }
  release() {
    this.instrument?.release()
    this.update({
      held: null,
      braking: false,
      message: 'Piece released. You can capture it again.',
    })
  }
  dock(actual: PieceCode, distance: number, speed: number) {
    if (this.state.phase !== 'playing' || this.state.held === null) return false
    const result = validateDock({
      actual,
      expected: this.level.target[this.state.docked.length],
      distance,
      speed,
      assisted: this.state.assisted,
    })
    if (!result.ok) {
      this.update({ errors: this.state.errors + 1, message: result.reason })
      return false
    }
    const docked = [...this.state.docked, this.state.held]
    this.update({
      docked,
      held: null,
      selected: null,
      braking: false,
      phase: docked.length === this.level.target.length ? 'completed' : 'playing',
      message:
        docked.length === this.level.target.length
          ? 'Chain complete. Every piece is in the target order.'
          : result.reason,
    })
    return true
  }
  undo() {
    if (!this.state.docked.length || this.state.phase === 'paused') return
    this.instrument?.release()
    const docked = [...this.state.docked],
      id = docked.pop()!
    this.instrument?.undo(id)
    this.update({
      docked,
      phase: 'playing',
      selected: id,
      held: null,
      message: 'Last connection undone. Capture the piece to try again.',
    })
  }
  restart() {
    this.instrument?.restart()
    this.update({
      phase: 'playing',
      selected: null,
      held: null,
      docked: [],
      elapsed: 0,
      errors: 0,
      collisions: 0,
      braking: false,
      message: this.level.tip,
    })
  }
  target() {
    return slotPosition(this.state.docked.length, this.level.target.length)
  }
}
export interface SavedProgress {
  version: 1
  completed: string[]
  best: Record<string, { seconds: number; errors: number }>
}
export const PROGRESS_KEY = 'onimachain:chainforge:v1'
export function readProgress(): SavedProgress {
  try {
    const value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null')
    if (
      value?.version === 1 &&
      Array.isArray(value.completed) &&
      value.best &&
      typeof value.best === 'object'
    )
      return value
  } catch {}
  return { version: 1, completed: [], best: {} }
}
export function saveRun(session: GameSession, alternative: boolean) {
  const progress = readProgress()
  const key = `${session.level.id}:v${session.level.version}:${session.mode}:${alternative ? 'sequence' : '3d'}:seed${session.seed}`
  const run = { seconds: Math.round(session.state.elapsed * 10) / 10, errors: session.state.errors }
  const prior = progress.best[key]
  if (
    !prior ||
    run.errors < prior.errors ||
    (run.errors === prior.errors && run.seconds < prior.seconds)
  )
    progress.best[key] = run
  if (!progress.completed.includes(session.level.id)) progress.completed.push(session.level.id)
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {}
  return progress
}
