import { Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { DiscoveryStage } from '~/components/DiscoveryStage'
import { useCanvasAllowed, useReducedMotion } from '~/motion/useReducedMotion'
import '../styles/observatory.css'
const EvidenceScene = lazy(() => import('~/scenes/EvidenceBridgeScene'))
const stations = [
  {
    id: 'evidence',
    number: '01',
    title: 'Can you spot the leap?',
    short: 'Spot the leap',
    subtitle: 'Read what happened. Pick the statement that does not exaggerate it.',
  },
  {
    id: 'scale',
    number: '02',
    title: 'How small is small?',
    short: 'Zoom in',
    subtitle: 'Explore four sizes. Then put them in order, smallest first.',
  },
  {
    id: 'report',
    number: '03',
    title: 'What does 96% mean?',
    short: 'Read a report',
    subtitle: 'Tap a field in the report. Find out what that number actually tells you.',
  },
  {
    id: 'constellation',
    number: '04',
    title: 'Three stories. One study?',
    short: 'Connect stories',
    subtitle: 'Follow three articles back to the experiment they came from.',
  },
  {
    id: 'molecule',
    number: '05',
    title: 'Meet a molecule',
    short: 'Turn a molecule',
    subtitle: 'Drag to turn the chain. Choose a part to learn how it fits together.',
  },
  {
    id: 'history',
    number: '06',
    title: 'Rewind the discoveries',
    short: 'Travel in time',
    subtitle: 'Choose a year. See the discovery and check the original source.',
  },
] as const
type StationId = (typeof stations)[number]['id']

const cases = [
  {
    tag: 'CELL MODEL',
    title: 'A signal changes in a dish.',
    source:
      'Imagine researchers adding a peptide to cells in a lab dish. One signal they measure inside the cells changes. This is a made-up example.',
    question: 'What can we honestly say?',
    choices: [
      {
        text: 'The peptide improves outcomes in people.',
        correct: false,
        why: 'Cells in a dish are not a whole person. This experiment cannot tell us whether people would benefit.',
      },
      {
        text: 'A signal changed in the cells in the dish.',
        correct: true,
        why: 'That is what the researchers saw. We still need to know whether it happens again, and what happens outside the dish.',
      },
      {
        text: 'The peptide is safe for people to use.',
        correct: false,
        why: 'A cell signal cannot establish human safety.',
      },
    ],
  },
  {
    tag: 'STUDY DESIGN',
    title: 'A score rises after a program.',
    source:
      'In a fictional teaching example, one group reports a higher score afterward. There is no comparison group.',
    question: 'What do we know for sure?',
    choices: [
      {
        text: 'The program caused the improvement.',
        correct: false,
        why: 'Without a comparison group, other explanations remain open.',
      },
      {
        text: 'Scores changed in the observed group.',
        correct: true,
        why: 'The before-and-after difference is an observation, not proof of cause.',
      },
      {
        text: 'Everyone would improve with the program.',
        correct: false,
        why: 'One group cannot establish a result for everyone.',
      },
    ],
  },
  {
    tag: 'EVIDENCE COUNTING',
    title: 'Three articles. One experiment.',
    source:
      'A fictional experiment appears in an original paper, a conference summary, and a later analysis of the same data.',
    question: 'How many independent experiments are there?',
    choices: [
      {
        text: 'Three, because there are three publications.',
        correct: false,
        why: 'Publication count is not experiment count.',
      },
      {
        text: 'One underlying experiment.',
        correct: true,
        why: 'The three reports share the same participants and data.',
      },
      {
        text: 'None, because summaries do not count.',
        correct: false,
        why: 'The original experiment still exists.',
      },
    ],
  },
  {
    tag: 'WHAT CHANGED?',
    title: 'Two ingredients. One changed outcome.',
    source:
      'In a fictional teaching experiment, Group A receives an inactive comparison. Group B receives compounds X and Y together. No X-only or Y-only groups are included.',
    question: 'Can we tell which ingredient made the difference?',
    choices: [
      {
        text: 'X caused the entire difference.',
        correct: false,
        why: 'There is no X-only group, so this design cannot isolate X.',
      },
      {
        text: 'The group changed. We do not know which ingredient was responsible.',
        correct: true,
        why: 'The group comparison may describe a difference, but it cannot assign it to a particular ingredient.',
      },
      {
        text: 'X and Y are a suitable combination for people.',
        correct: false,
        why: 'A fictional group comparison gives no personal-use or safety guidance.',
      },
    ],
  },
]

function OrbitStage({
  state,
  molecule = false,
  focus = 0,
}: {
  state?: 'correct' | 'incorrect' | null
  molecule?: boolean
  focus?: number
}) {
  const allowed = useCanvasAllowed()
  const calm = useReducedMotion()
  const [view3D, setView3D] = useState(true)
  const [yaw, setYaw] = useState(0)
  const [onScreen, setOnScreen] = useState(true)
  const fieldRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = fieldRef.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => setOnScreen(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: '300px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const showScene = allowed && view3D
  return (
    <div className={`obs-stage ${state || ''} ${molecule ? 'is-molecule' : ''}`}>
      <div className="obs-stage-top">
        <span>
          <i /> {showScene ? 'INTERACTIVE MODEL' : 'ILLUSTRATIVE MODEL'}
        </span>
        <span>CONCEPTUAL VISUALIZATION</span>
      </div>
      <div ref={fieldRef} className={`obs-orbit-field ${showScene ? 'has-canvas' : ''}`}>
        {showScene ? (
          <div className="obs-canvas">
            <Suspense fallback={<div className="obs-canvas-fallback">Opening the model…</div>}>
              <EvidenceScene
                mode={molecule ? 'molecule' : 'evidence'}
                result={state}
                calm={calm}
                yaw={yaw}
                active={onScreen}
                focus={focus}
              />
            </Suspense>
          </div>
        ) : (
          <div
            className="obs-static-model"
            role="img"
            aria-label={
              molecule
                ? 'Illustrative chain of amino acid residues connected by peptide bonds'
                : `Conceptual model of a source connected to a claim; ${state === 'correct' ? 'supported' : state === 'incorrect' ? 'unsupported' : 'not yet evaluated'}`
            }
          >
            <div className="obs-orbit obs-orbit-a" />
            <div className="obs-orbit obs-orbit-b" />
            <div className="obs-orbit obs-orbit-c" />
            {molecule ? (
              <div className="obs-chain">
                {['A', 'A', 'A', 'A', 'A'].map((item, i) => (
                  <span key={i}>
                    {item}
                    <small>{i + 1}</small>
                  </span>
                ))}
              </div>
            ) : (
              <div className="obs-bridge">
                <div className="obs-sphere source">
                  <span>SOURCE</span>
                </div>
                <div className="obs-bridge-line">
                  <i />
                </div>
                <div className="obs-sphere claim">
                  <span>CLAIM</span>
                </div>
              </div>
            )}
          </div>
        )}
        {allowed && (
          <div className="obs-view-controls">
            {showScene && (
              <>
                <button
                  type="button"
                  onClick={() => setYaw((value) => value - Math.PI / 8)}
                  aria-label="Rotate model left"
                >
                  ↶
                </button>
                <button
                  type="button"
                  onClick={() => setYaw((value) => value + Math.PI / 8)}
                  aria-label="Rotate model right"
                >
                  ↷
                </button>
                <span>DRAG TO ROTATE</span>
              </>
            )}
            <button type="button" onClick={() => setView3D((value) => !value)}>
              {showScene ? 'Use static view' : 'Show 3D view'}
            </button>
          </div>
        )}
      </div>
      <div className="obs-stage-bottom">
        {molecule
          ? 'A VISUAL METAPHOR / NOT A MEASURED STRUCTURE'
          : 'WHAT HAPPENED → WHAT WE CAN SAY'}
        <span>
          {state === 'correct'
            ? 'SUPPORTED CONNECTION'
            : state === 'incorrect'
              ? 'EVIDENCE GAP'
              : 'CHOOSE AN ANSWER TO CONNECT'}
        </span>
      </div>
    </div>
  )
}

function EvidenceWorlds({ initialCase = 0 }: { initialCase?: number }) {
  const [index, setIndex] = useState(
    initialCase >= 0 && initialCase < cases.length ? initialCase : 0,
  )
  const [answer, setAnswer] = useState<number | null>(null)
  const [completed, setCompleted] = useState<number[]>([])
  const [progressLoaded, setProgressLoaded] = useState(false)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('onimachain:evidence-worlds:v1') || '[]')
      if (Array.isArray(saved))
        setCompleted(
          saved.filter(
            (value): value is number =>
              Number.isInteger(value) && value >= 0 && value < cases.length,
          ),
        )
    } catch {
      /* storage may be disabled */
    }
    setProgressLoaded(true)
  }, [])
  useEffect(() => {
    if (!progressLoaded) return
    try {
      localStorage.setItem('onimachain:evidence-worlds:v1', JSON.stringify(completed))
    } catch {
      /* storage may be disabled */
    }
  }, [completed, progressLoaded])
  const item = cases[index]
  const choice = answer === null ? null : item.choices[answer]
  const finished = completed.length === cases.length
  function selectChoice(choiceIndex: number) {
    setAnswer(choiceIndex)
    if (item.choices[choiceIndex].correct)
      setCompleted((current) => (current.includes(index) ? current : [...current, index]))
  }
  function reset() {
    setIndex(0)
    setAnswer(null)
    setCompleted([])
  }
  return (
    <div className="obs-workspace">
      <OrbitStage state={choice ? (choice.correct ? 'correct' : 'incorrect') : null} />
      <div className="obs-panel">
        <div className="obs-panel-meta">
          <span>
            CASE {index + 1} / {cases.length} · {completed.length} COMPLETE
          </span>
          <span>FICTIONAL TEACHING EXAMPLE</span>
        </div>
        <div
          className="obs-progress"
          role="progressbar"
          aria-label="Evidence Worlds missions completed"
          aria-valuenow={completed.length}
          aria-valuemin={0}
          aria-valuemax={cases.length}
        >
          <i style={{ width: `${(completed.length / cases.length) * 100}%` }} />
        </div>
        <h3>{item.title}</h3>
        <div className="obs-source">
          <small>WHAT HAPPENED</small>
          <p>{item.source}</p>
        </div>
        <h4>{item.question}</h4>
        <div className="obs-options">
          {item.choices.map((option, i) => (
            <button
              className={
                answer === i ? (option.correct ? 'selected correct' : 'selected incorrect') : ''
              }
              onClick={() => selectChoice(i)}
              key={option.text}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {option.text}
            </button>
          ))}
        </div>
        <div
          className={`obs-feedback ${choice?.correct ? 'right' : choice ? 'wrong' : ''}`}
          aria-live="polite"
        >
          {choice ? (
            <>
              <strong>
                {choice.correct
                  ? 'You got it. That matches the study.'
                  : 'That goes further than the study.'}
              </strong>
              <p>{choice.why}</p>
            </>
          ) : (
            <p>Choose an answer. Watch the connection change.</p>
          )}
          {finished && (
            <p className="obs-complete">
              All {cases.length} missions complete. You can revisit any explanation or replay the
              set.
            </p>
          )}
        </div>
        <div className="obs-panel-actions">
          <button
            onClick={() => {
              setIndex(index - 1)
              setAnswer(null)
            }}
            disabled={index === 0}
            aria-label="Previous case"
          >
            ←
          </button>
          <span>
            {String(index + 1).padStart(2, '0')} / {String(cases.length).padStart(2, '0')}
          </span>
          {index < cases.length - 1 ? (
            <button
              onClick={() => {
                setIndex(index + 1)
                setAnswer(null)
              }}
              disabled={!completed.includes(index)}
              aria-label="Next case"
            >
              →
            </button>
          ) : (
            <button onClick={reset} disabled={!finished} aria-label="Replay all cases">
              ↺
            </button>
          )}
        </div>
        {finished && (
          <button className="obs-reset obs-replay" onClick={reset}>
            Try the four challenges again
          </button>
        )}
      </div>
    </div>
  )
}

const scaleOrder = [
  {
    id: 'molecule',
    number: '01',
    title: 'Molecular feature · nanometres',
    detail:
      'A nanometre is one billionth of a metre. Molecular dimensions vary with shape and sequence.',
  },
  {
    id: 'cell',
    number: '02',
    title: 'Cell · micrometres',
    detail: 'A micrometre is one millionth of a metre. Cell sizes vary.',
  },
  {
    id: 'sample',
    number: '03',
    title: 'Tissue sample · millimetres',
    detail: 'A millimetre is one thousandth of a metre. This is an illustrative sample scale.',
  },
  {
    id: 'person',
    number: '04',
    title: 'Whole person · metres',
    detail: 'A metre-scale object is much larger than the structures above.',
  },
] as const
function ScaleLab() {
  const [order, setOrder] = useState([3, 1, 0, 2])
  const [checked, setChecked] = useState(false)
  const [zoom, setZoom] = useState(0)
  const correct = order.every((value, index) => value === index)
  function move(from: number, by: number) {
    const to = from + by
    if (to < 0 || to >= order.length) return
    const next = [...order]
    ;[next[from], next[to]] = [next[to], next[from]]
    setOrder(next)
    setChecked(false)
  }
  return (
    <>
      <DiscoveryStage mode="scale" selected={zoom} onSelect={setZoom} />
      <div className="obs-simple-layout">
        <div className="obs-simple-intro">
          <span className="obs-kicker">SCALE LAB / ORDER THE LEVELS</span>
          <h3>
            Tiny. Small.
            <br />
            Bigger. You.
          </h3>
          <p>
            Tap the objects above to explore them. Then use the arrows to put these four things in
            order, smallest first. The models show categories, not exact sizes.
          </p>
          <div className="obs-insight">
            A cell observation and a human outcome also sit at different levels of evidence.
            Physical size alone does not bridge that gap.
          </div>
        </div>
        <div className="obs-sort-card">
          <div className="obs-sort-heading">
            SMALLEST AT THE TOP <span>USE THE ARROWS</span>
          </div>
          {order.map((value, index) => {
            const item = scaleOrder[value]
            return (
              <div className="obs-sort-row" key={item.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
                <div className="obs-sort-buttons">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${item.title} up`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === order.length - 1}
                    aria-label={`Move ${item.title} down`}
                  >
                    ↓
                  </button>
                </div>
              </div>
            )
          })}
          <button className="obs-primary" onClick={() => setChecked(true)}>
            Check the order →
          </button>
          <div className={`obs-result ${checked && correct ? 'right' : ''}`} aria-live="polite">
            {checked
              ? correct
                ? 'Exactly. Nanometres, micrometres, millimetres, then metres; each step is one thousand times the unit before it.'
                : 'Not quite. Start with the molecular feature, then move toward the whole person.'
              : 'Build the sequence to explore relative scale.'}
          </div>
        </div>
      </div>
    </>
  )
}

const annotations = [
  {
    key: 'identity',
    label: 'Identity',
    value: 'Expected mass peak: present',
    detail:
      'Does the sample match what the test was looking for? That is the identity question. A match does not tell us what it does in a person.',
  },
  {
    key: 'purity',
    label: 'Purity',
    value: 'Main chromatographic peak: 96%',
    detail:
      '96% describes the main peak in this particular lab test. It does not mean 96% safe, and the test may not detect every impurity.',
  },
  {
    key: 'concentration',
    label: 'Concentration',
    value: 'Measured: 0.8 mg/mL',
    detail:
      'This tells us how much material was measured in a volume of the fictional sample. It is not a dose or a recommendation for people.',
  },
] as const
function ReportDetective() {
  const [active, setActive] = useState<(typeof annotations)[number]['key']>('identity')
  const [answer, setAnswer] = useState<'safe' | 'limited' | null>(null)
  const current = annotations.find((item) => item.key === active)!
  return (
    <>
      <DiscoveryStage
        mode="report"
        selected={annotations.findIndex((item) => item.key === active)}
        onSelect={(index) => setActive(annotations[index].key)}
      />
      <div className="obs-report-layout">
        <div className="obs-report-paper">
          <div className="obs-paper-top">
            FICTIONAL ANALYTICAL REPORT <span>OC–TR–01</span>
          </div>
          <h3>
            Three fields.
            <br />
            Three questions.
          </h3>
          <p className="obs-paper-deck">
            A fabricated teaching sample, not a certificate for any real material. Numbers are
            invented solely to practice reading report scope.
          </p>
          <hr />
          {annotations.map((item) => (
            <p key={item.key}>
              <button
                className={active === item.key ? 'active' : ''}
                onClick={() => setActive(item.key)}
              >
                {item.label}: {item.value}
              </button>
            </p>
          ))}
          <small>SELECT A FIELD TO INSPECT WHAT IT CAN ANSWER</small>
        </div>
        <div className="obs-detective">
          <span className="obs-kicker">REPORT DETECTIVE</span>
          <h3>
            Read beyond
            <br />
            the number.
          </h3>
          <div className="obs-annotation-tabs">
            {annotations.map((item) => (
              <button
                key={item.key}
                className={active === item.key ? 'active' : ''}
                onClick={() => setActive(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="obs-annotation">
            <span>INSPECT / {current.label.toUpperCase()}</span>
            <h4>{current.label}</h4>
            <p>{current.detail}</p>
          </div>
          <h4>What remains unanswered?</h4>
          <div className="obs-options">
            <button
              className={answer === 'safe' ? 'selected incorrect' : ''}
              onClick={() => setAnswer('safe')}
            >
              The report proves this material is safe for people.
            </button>
            <button
              className={answer === 'limited' ? 'selected correct' : ''}
              onClick={() => setAnswer('limited')}
            >
              These tests do not tell us whether it is safe, germ-free, or helpful for people.
            </button>
          </div>
          <div className={`obs-result ${answer === 'limited' ? 'right' : ''}`} aria-live="polite">
            {answer
              ? answer === 'limited'
                ? 'Exactly. An analytical field answers a specific laboratory question, not every quality or medical question.'
                : 'The listed tests have a narrower scope. Several important questions remain untested.'
              : 'Inspect each field, then name the limits.'}
          </div>
        </div>
      </div>
    </>
  )
}

const reports = [
  {
    type: 'ORIGINAL PAPER',
    title: 'Experiment A: full report',
    detail: 'Methods, participants, and measurements are described here.',
  },
  {
    type: 'CONFERENCE SUMMARY',
    title: 'Experiment A: short abstract',
    detail: 'A shorter presentation of the same participants and measurements.',
  },
  {
    type: 'LATER ARTICLE',
    title: 'Experiment A: another analysis',
    detail: 'A later article using the same original data set.',
  },
]
function Constellation() {
  const [selected, setSelected] = useState(0)
  const [linked, setLinked] = useState<number[]>([])
  return (
    <>
      <DiscoveryStage
        mode="constellation"
        selected={selected}
        onSelect={setSelected}
        linked={linked}
      />
      <div className="obs-constellation">
        <div className="obs-constellation-stage">
          <span className="obs-kicker">SOURCE MAP / FICTIONAL TEACHING EXAMPLE</span>
          <div className="obs-orbits" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="obs-study-core">
            <small>UNDERLYING DATA</small>
            <strong>Experiment A</strong>
            <small>One participant group</small>
          </div>
          {reports.map((report, index) => (
            <button
              key={report.type}
              className={`obs-report-node node-${index} ${selected === index ? 'active' : ''} ${linked.includes(index) ? 'linked' : ''}`}
              onClick={() => setSelected(index)}
            >
              <small>{report.type}</small>
              <strong>{report.title}</strong>
            </button>
          ))}
        </div>
        <div className="obs-constellation-copy">
          <span className="obs-kicker">EVIDENCE CONSTELLATION</span>
          <h3>
            Count studies,
            <br />
            not headlines.
          </h3>
          <p>
            Three articles do not always mean three studies. Choose an article, then connect it to
            the experiment it describes.
          </p>
          <div className="obs-publication">
            <small>{reports[selected].type}</small>
            <h4>{reports[selected].title}</h4>
            <p>{reports[selected].detail}</p>
            <button
              className="obs-primary"
              disabled={linked.includes(selected)}
              onClick={() => setLinked((current) => [...current, selected])}
            >
              {linked.includes(selected)
                ? 'Connected to Experiment A'
                : 'Connect to Experiment A →'}
            </button>
          </div>
          <div className="obs-source-count">
            <strong>{linked.length} / 3</strong>
            <span>REPORTS TRACED</span>
          </div>
          <div className="obs-result" aria-live="polite">
            {linked.length === 3
              ? 'Three reports, one underlying experiment. Repeating the reports as independent studies would count the same data more than once.'
              : 'Trace every report to reveal the independent study count.'}
          </div>
          <button
            className="obs-reset"
            onClick={() => {
              setLinked([])
              setSelected(0)
            }}
          >
            ↺ Replay map
          </button>
        </div>
      </div>
    </>
  )
}

const moleculeFacts = [
  {
    title: 'The building blocks',
    text: 'Each bead stands for an amino acid: one of the small building blocks in a peptide. The order of the blocks helps define which peptide it is.',
  },
  {
    title: 'The connections',
    text: 'The highlighted links stand for peptide bonds. These chemical connections join one amino acid to the next.',
  },
  {
    title: 'The shape',
    text: 'A chain can bend into a three-dimensional shape. Watch this illustration change shape. It is a teaching model, not the measured shape of a real peptide.',
  },
]
function MoleculeExplorer() {
  const [focus, setFocus] = useState(0)
  return (
    <div className="obs-workspace">
      <OrbitStage molecule focus={focus} />
      <div className="obs-panel obs-molecule-panel">
        <span className="obs-kicker">MOLECULE EXPLORER</span>
        <h3>
          A chain is more
          <br />
          than a line.
        </h3>
        <p className="obs-panel-lead">
          Peptides are built from amino acids linked by peptide bonds. The model shows repeated
          units; it does not depict a particular compound or predict a biological effect.
        </p>
        <div className="obs-annotation-tabs" role="tablist" aria-label="Molecule concepts">
          {moleculeFacts.map((fact, index) => (
            <button
              key={fact.title}
              role="tab"
              aria-selected={focus === index}
              className={focus === index ? 'active' : ''}
              onClick={() => setFocus(index)}
            >
              {fact.title}
            </button>
          ))}
        </div>
        <div className="obs-annotation" role="tabpanel">
          <span>INSPECT / {moleculeFacts[focus].title.toUpperCase()}</span>
          <h4>{moleculeFacts[focus].title}</h4>
          <p>{moleculeFacts[focus].text}</p>
        </div>
        <p className="obs-caveat">
          ILLUSTRATIVE GEOMETRY ONLY / NO ATOM POSITIONS OR BIOLOGICAL EFFECTS REPRESENTED.
        </p>
        <a href="https://www.ncbi.nlm.nih.gov/mesh/68010455" target="_blank" rel="noreferrer">
          Read the NCBI definition ↗
        </a>
      </div>
    </div>
  )
}

const milestones = [
  {
    year: '1953',
    title: 'Oxytocin synthesis reported',
    text: 'A published report describes preparation and reconversion of oxytocin derivatives, part of the early era of peptide synthesis.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/13134269/',
  },
  {
    year: '1955',
    title: 'Insulin sequence reported',
    text: 'Frederick Sanger established the amino-acid sequence of insulin, helping show that a protein has a definite sequence.',
    url: 'https://www.nobelprize.org/prizes/themes/the-nobel-prize-in-chemistry-the-development-of-modern-chemistry/',
  },
  {
    year: '1963',
    title: 'Solid-phase synthesis takes shape',
    text: 'Bruce Merrifield described an approach to building peptide chains while anchored to a solid support.',
    url: 'https://pubs.acs.org/doi/10.1021/ja00897a025',
  },
  {
    year: '1982',
    title: 'Recombinant human insulin approved',
    text: 'The FDA approved Humulin, the first approved medical product derived from recombinant DNA technology.',
    url: 'https://www.fda.gov/about-fda/fda-history-exhibits/100-years-insulin',
  },
]
function TimeMachine() {
  const [selected, setSelected] = useState(0)
  const milestone = milestones[selected]
  return (
    <>
      <DiscoveryStage mode="history" selected={selected} onSelect={setSelected} />
      <div className="obs-time">
        <span className="obs-kicker">RESEARCH TIME MACHINE</span>
        <h3>
          Ideas become tools.
          <br />
          Tools change what we can ask.
        </h3>
        <p>
          Four documented moments in peptide and protein science. Select a year and open its source.
        </p>
        <div className="obs-time-track">
          {milestones.map((item, index) => (
            <button
              key={item.year}
              className={selected === index ? 'active' : ''}
              onClick={() => setSelected(index)}
            >
              <i />
              <strong>{item.year}</strong>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
        <div className="obs-time-detail">
          <strong>{milestone.year}</strong>
          <div>
            <small>DOCUMENTED MILESTONE</small>
            <h4>{milestone.title}</h4>
            <p>{milestone.text}</p>
            <a href={milestone.url} target="_blank" rel="noreferrer">
              View source ↗
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export function LearningActivities({
  station = 'evidence',
  initialCase = 0,
}: {
  station?: string
  initialCase?: number
}) {
  const current = stations.find((item) => item.id === station) || stations[0]
  return (
    <section className="observatory-page optional-activities">
      <div className="obs-container">
        <header className="obs-heading">
          <div>
            <span>OPTIONAL LESSON / NO SCORE REQUIRED</span>
            <h2>{current.title}</h2>
          </div>
          <p>{current.subtitle}</p>
        </header>
        <nav className="lesson-switcher" aria-label="Optional lessons">
          {stations
            .filter((item) => item.id !== 'molecule')
            .map((item) => (
              <Link
                key={item.id}
                to="/learn"
                search={{ activity: item.id }}
                aria-current={current.id === item.id ? 'page' : undefined}
              >
                {item.short}
              </Link>
            ))}
        </nav>
        {current.id === 'evidence' && <EvidenceWorlds initialCase={initialCase} />}
        {current.id === 'scale' && <ScaleLab />}
        {current.id === 'report' && <ReportDetective />}
        {current.id === 'constellation' && <Constellation />}
        {current.id === 'history' && <TimeMachine />}
        {current.id === 'molecule' && <MoleculeExplorer />}
        <p className="obs-boundary">
          Fictional teaching examples. The illustrations are not measured biology, medical advice,
          or recommendations.
        </p>
      </div>
    </section>
  )
}
