import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LEVELS, dailyLevel, validateDock } from '../src/game/chainforge/levels.ts'
import { GameSession } from '../src/game/chainforge/session.ts'
test('three authored inventories are solvable; daily selection is deterministic and versioned', () => {
  assert.deepEqual(
    LEVELS.map((l) => l.target.length),
    [4, 6, 8],
  )
  assert.deepEqual(dailyLevel('2026-09-24'), dailyLevel('2026-09-24'))
  assert.equal(dailyLevel().version, 1)
})
test('position, speed and identity are independently required', () => {
  const base = { actual: 'G', expected: 'G', distance: 0, speed: 0, assisted: false } as const
  assert.equal(validateDock({ ...base, distance: 2 }).ok, false)
  assert.equal(validateDock({ ...base, speed: 2 }).ok, false)
  assert.equal(validateDock({ ...base, actual: 'A' }).ok, false)
  assert.equal(validateDock(base).ok, true)
})
test('wrong piece is recoverable; complete, undo and replay preserve inventory', () => {
  const g = new GameSession()
  g.start()
  g.select(1)
  g.capture()
  assert.equal(g.dock('A', 0, 0), false)
  assert.equal(g.state.held, 1)
  g.release()
  for (let i = 0; i < 4; i++) {
    g.select(i)
    g.capture()
    assert.equal(g.dock(g.level.target[i], 0, 0), true)
  }
  assert.equal(g.state.phase, 'completed')
  g.undo()
  assert.equal(g.state.phase, 'playing')
  assert.equal(g.state.docked.length, 3)
  g.restart()
  assert.equal(g.state.docked.length, 0)
  assert.equal(g.state.errors, 0)
})
test('pause prevents capture and docking', () => {
  const g = new GameSession()
  g.start()
  g.select(0)
  g.capture()
  g.pause()
  assert.equal(g.dock('G', 0, 0), false)
  g.pause()
  assert.equal(g.dock('G', 0, 0), true)
})
