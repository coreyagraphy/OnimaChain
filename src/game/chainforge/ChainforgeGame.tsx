import {
  Component,
  type ReactNode,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { Link } from '@tanstack/react-router'
import { LEVELS, PIECES, dailyLevel } from './levels'
import { GameSession, PROGRESS_KEY, saveRun, type PlayMode } from './session'
import './chainforge.css'
const Chamber = lazy(() => import('./Chamber'))
class ChamberBoundary extends Component<
  { children: ReactNode; onFail: (reason: string) => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error) {
    this.props.onFail(error.message)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
export default function ChainforgeGame() {
  const [mission, setMission] = useState(LEVELS[0].id),
    [mode, setMode] = useState<PlayMode>('practice'),
    [alternative, setAlternative] = useState(false),
    [backend, setBackend] = useState('Loading local physics…'),
    [failure, setFailure] = useState(''),
    [saved, setSaved] = useState(false)
  const daily = useMemo(() => dailyLevel(), []),
    level = mission === 'daily' ? daily.level : LEVELS.find((l) => l.id === mission)!
  const session = useMemo(
    () => new GameSession(level, mode, mission === 'daily' ? daily.seed : 0),
    [level, mode, mission, daily.seed],
  )
  const [readySession, setReadySession] = useState<GameSession | null>(null)
  const state = useSyncExternalStore(session.subscribe, session.snapshot, session.snapshot)
  useEffect(() => {
    setSaved(false)
    setBackend('Loading local physics…')
    setFailure('')
  }, [session])
  useEffect(() => {
    if (state.phase === 'completed') {
      saveRun(session, alternative)
      setSaved(true)
    }
  }, [state.phase, session, alternative])
  const playing = state.phase === 'playing',
    held = state.held !== null
  function dock() {
    if (alternative && state.held !== null) session.dock(level.target[state.held], 0, 0)
    else session.instrument?.dock()
  }
  return (
    <div className="forge wrap">
      <header className="forge-heading">
        <div>
          <Link to="/learn">← Play & Learn</Link>
          <p className="electric-eyebrow">A SEQUENCE PUZZLE / NOT A CHEMISTRY SIMULATION</p>
          <h1>
            CHAIN<span>FORGE</span>
          </h1>
        </div>
        <p>
          Catch a building block.
          <br />
          Guide it into place.
          <br />
          <strong>Make the letters match.</strong>
        </p>
      </header>
      <div className="forge-settings">
        <label>
          Mission
          <select aria-label="Mission" value={mission} onChange={(e) => setMission(e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
            <option value="daily">Daily chamber · {daily.date} UTC</option>
          </select>
        </label>
        <label>
          Controls
          <select
            aria-label="Controls"
            value={mode}
            onChange={(e) => setMode(e.target.value as PlayMode)}
          >
            <option value="practice">Practice · assisted guide</option>
            <option value="precision">Precision · move it yourself</option>
          </select>
        </label>
        <button
          onClick={() => {
            session.release()
            setAlternative(!alternative)
            session.restart()
          }}
        >
          {alternative ? 'Use 3D chamber' : 'Use no-drag sequence mode'}
        </button>
      </div>
      {mission === 'daily' && (
        <p>
          Authored mission “{level.name}”, daily selection v{daily.version}. Seed {daily.seed}. Not
          a randomly generated level.
        </p>
      )}
      <section className="forge-instrument" aria-label="Chainforge game">
        <div className="forge-target">
          <span>BUILD THIS ORDER →</span>
          <ol>
            {level.target.map((code, i) => (
              <li
                key={i}
                className={
                  i < state.docked.length ? 'connected' : i === state.docked.length ? 'next' : ''
                }
              >
                <b>{code}</b>
                <small>
                  {i + 1}
                  {i < state.docked.length ? ' ✓' : ''}
                </small>
              </li>
            ))}
          </ol>
          <span>
            {state.docked.length}/{level.target.length} CONNECTED
          </span>
        </div>
        <div className="forge-stage">
          {!alternative && !failure ? (
            <ChamberBoundary
              onFail={(reason) => {
                setFailure(reason)
                setAlternative(true)
              }}
            >
              <Suspense fallback={<p className="forge-loading">Preparing the chamber…</p>}>
                <Chamber
                  session={session}
                  onReady={(name) => {
                    setBackend(name)
                    setReadySession(session)
                  }}
                  onFailure={(reason) => {
                    setFailure(reason)
                    setAlternative(true)
                    setBackend('3D unavailable')
                  }}
                />
              </Suspense>
            </ChamberBoundary>
          ) : (
            <div className="sequence-alternative">
              <h2>Build the sequence, at your pace.</h2>
              <p>
                {failure ? '3D could not start. ' : ''}This is the accessible sequence puzzle,
                without movement, collisions or timing. Select → Capture → Dock. The same
                letter-order lesson, separate results.
              </p>
              <div>
                {state.docked.map((id, i) => (
                  <span key={i}>{level.target[id]}</span>
                ))}
              </div>
              {failure && !alternative && (
                <button
                  onClick={() => {
                    setAlternative(true)
                    session.restart()
                  }}
                >
                  Start sequence mode
                </button>
              )}
            </div>
          )}
          {state.phase === 'briefing' && (
            <div className="forge-overlay">
              <span className="electric-eyebrow">
                {level.target.length} BUILDING BLOCKS · NO RUSH
              </span>
              <h2>{level.name}</h2>
              <p>{level.tip}</p>
              <button
                className="forge-primary"
                disabled={!alternative && (!!failure || readySession !== session)}
                onClick={() => session.start()}
              >
                Play Chainforge →
              </button>
            </div>
          )}
          {state.phase === 'paused' && (
            <div className="forge-overlay">
              <h2>Take your time.</h2>
              <p>Movement and the clock are paused.</p>
              <button onClick={() => session.pause()}>Resume</button>
            </div>
          )}
          {state.phase === 'completed' && (
            <div className="forge-overlay">
              <span className="electric-eyebrow">CONNECTION COMPLETE</span>
              <h2>You made the chain.</h2>
              <p>{level.takeaway}</p>
              <p>
                {alternative ? 'Sequence mode' : `${state.elapsed.toFixed(1)} seconds`} ·{' '}
                {state.errors} docking retries. {saved ? 'Result stored in this browser.' : ''}
              </p>
              <button className="forge-primary" onClick={() => session.restart()}>
                Replay this mission ↻
              </button>
              <button
                onClick={() => setMission(LEVELS[(LEVELS.indexOf(level) + 1) % LEVELS.length].id)}
              >
                Next mission →
              </button>
            </div>
          )}
        </div>
        <div className="forge-readout">
          <span>{alternative ? 'SEQUENCE MODE' : backend}</span>
          <span>
            {mode === 'precision' && !alternative ? `${state.elapsed.toFixed(1)}s · ` : ''}
            {state.collisions} contacts · {state.errors} retries
          </span>
          <button
            onClick={() => session.pause()}
            disabled={!['playing', 'paused'].includes(state.phase)}
          >
            {state.phase === 'paused' ? 'Resume' : 'Pause'}
          </button>
        </div>
      </section>
      <p className="forge-status" role="status">
        {state.message}
      </p>
      <div className="forge-console">
        <section>
          <h2>1. Pick a building block</h2>
          <div className="forge-pieces">
            {level.target.map((code, i) => (
              <button
                key={i}
                aria-label={`Select ${PIECES[code].name} piece ${i + 1}`}
                aria-pressed={state.selected === i}
                disabled={!playing || state.docked.includes(i)}
                onClick={() => session.select(i)}
              >
                <b style={{ color: PIECES[code].color }}>{code}</b>
                <span>
                  {PIECES[code].name}
                  <small>
                    Piece {i + 1}
                    {state.docked.includes(i) ? ' · connected' : ''}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2>2. Capture, guide, connect</h2>
          <div className="forge-actions">
            <button
              disabled={!playing || state.selected === null || held}
              onClick={() => session.capture()}
            >
              Capture
            </button>
            <button disabled={!playing || !held} onClick={() => session.release()}>
              Release
            </button>
            {!alternative && (
              <>
                <button
                  disabled={!playing || !held || mode === 'precision'}
                  onClick={() => session.instrument?.guide()}
                >
                  Guide to slot
                </button>
                <button
                  disabled={!playing || !held}
                  aria-pressed={state.braking}
                  onClick={() => session.update({ braking: !state.braking })}
                >
                  Brake {state.braking ? 'on' : 'off'}
                </button>
              </>
            )}
            <button className="forge-primary" disabled={!playing || !held} onClick={dock}>
              Dock
            </button>
          </div>
          {!alternative && (
            <div className="forge-direction" aria-label="Move aim point">
              <button
                aria-label="Move left"
                disabled={!playing || !held}
                onClick={() => session.instrument?.move(-0.35, 0)}
              >
                ←
              </button>
              <button
                aria-label="Move toward slots"
                disabled={!playing || !held}
                onClick={() => session.instrument?.move(0, -0.35)}
              >
                ↓
              </button>
              <button
                aria-label="Move away from slots"
                disabled={!playing || !held}
                onClick={() => session.instrument?.move(0, 0.35)}
              >
                ↑
              </button>
              <button
                aria-label="Move right"
                disabled={!playing || !held}
                onClick={() => session.instrument?.move(0.35, 0)}
              >
                →
              </button>
            </div>
          )}
          <p>
            {alternative
              ? 'Match the next highlighted letter. Incorrect choices can be released and replaced.'
              : 'Mouse or touch: after Capture, drag across the chamber to pull the piece. Keyboard: focus the chamber, use arrows/WASD, Space to brake, Enter to dock. Step buttons work without dragging.'}
          </p>
        </section>
      </div>
      <div className="forge-utilities">
        <button
          onClick={() => session.undo()}
          disabled={!state.docked.length || state.phase === 'paused'}
        >
          Undo last connection
        </button>
        <button onClick={() => session.restart()}>Restart mission</button>
        <button onClick={() => session.instrument?.recenter()} disabled={alternative}>
          Reset view
        </button>
        <button
          onClick={() => {
            try {
              localStorage.removeItem(PROGRESS_KEY)
            } catch {}
            setSaved(false)
          }}
        >
          Clear saved game results
        </button>
      </div>
      <details className="forge-lesson">
        <summary>What does this teach—and what does it not teach?</summary>
        <p>
          {level.takeaway} G = glycine, A = alanine, S = serine, L = leucine. The shapes and colors
          help you distinguish pieces; they are not molecular structures. The sequences are
          fictional puzzles.
        </p>
        <p>
          Tethers, shutters, speeds and docking rules are game mechanics, not synthesis, folding,
          binding, dosing or evidence of health effects.
        </p>
        <a
          href="https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/primary-sequences"
          target="_blank"
          rel="noreferrer"
        >
          Read RCSB PDB-101: primary sequences ↗
        </a>
        <p>
          <Link to="/observatory">Inspect real sequence records in the Observatory →</Link>
        </p>
      </details>
    </div>
  )
}
