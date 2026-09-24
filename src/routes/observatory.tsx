import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { BRAND } from '~/brand'
import '../styles/observatory.css'

export const Route = createFileRoute('/observatory')({
  head: () => ({ meta: [
    { title: `Evidence Observatory — ${BRAND}` },
    { name: 'description', content: 'Six immersive, interactive learning stations about peptides, research scale, and evidence literacy.' },
  ] }),
  component: Observatory,
})

const stations = [
  { id: 'evidence', number: '01', title: 'Evidence Worlds', short: 'Evidence', subtitle: 'Build a claim that the source can carry.' },
  { id: 'scale', number: '02', title: 'Scale Lab', short: 'Scale', subtitle: 'Follow an observation across levels of biology.' },
  { id: 'report', number: '03', title: 'Report Detective', short: 'Report', subtitle: 'See what a study actually measured.' },
  { id: 'constellation', number: '04', title: 'Evidence Constellation', short: 'Sources', subtitle: 'Trace publications to their underlying data.' },
  { id: 'molecule', number: '05', title: 'Molecule Explorer', short: 'Molecule', subtitle: 'Inspect a conceptual peptide chain.' },
  { id: 'history', number: '06', title: 'Research Time Machine', short: 'History', subtitle: 'Explore documented moments in peptide science.' },
] as const
type StationId = typeof stations[number]['id']

const cases = [
  { tag: 'CELL MODEL', title: 'A signal changes in a dish.', source: 'Researchers expose cultured cells to a fictional research peptide. One measured cellular signal changes.', question: 'Which conclusion can this observation support?', choices: [
    { text: 'The peptide improves outcomes in people.', correct: false, why: 'A cell model can suggest a mechanism. It cannot establish a human outcome.' },
    { text: 'The measured signal changed in this cell model.', correct: true, why: 'This statement stays within what was observed. Replication and other models remain open questions.' },
    { text: 'The peptide is safe for people to use.', correct: false, why: 'A cell signal cannot establish human safety.' },
  ] },
  { tag: 'STUDY DESIGN', title: 'A score rises after a program.', source: 'In a fictional teaching example, one group reports a higher score afterward. There is no comparison group.', question: 'What does the design let us say?', choices: [
    { text: 'The program caused the improvement.', correct: false, why: 'Without a comparison group, other explanations remain open.' },
    { text: 'Scores changed in the observed group.', correct: true, why: 'The before-and-after difference is an observation, not proof of cause.' },
    { text: 'Everyone would improve with the program.', correct: false, why: 'One group cannot establish a result for everyone.' },
  ] },
  { tag: 'EVIDENCE COUNTING', title: 'Three articles. One experiment.', source: 'A fictional experiment appears in an original paper, a conference summary, and a later analysis of the same data.', question: 'How many independent experiments are there?', choices: [
    { text: 'Three, because there are three publications.', correct: false, why: 'Publication count is not experiment count.' },
    { text: 'One underlying experiment.', correct: true, why: 'The three reports share the same participants and data.' },
    { text: 'None, because summaries do not count.', correct: false, why: 'The original experiment still exists.' },
  ] },
]

function OrbitStage({ state, molecule = false }: { state?: 'correct' | 'incorrect' | null; molecule?: boolean }) {
  return <div className={`obs-stage ${state || ''} ${molecule ? 'is-molecule' : ''}`} role="img" aria-label={molecule ? 'Illustrative chain of amino acid residues connected by peptide bonds' : `Conceptual model of a source connected to a claim; ${state === 'correct' ? 'supported' : state === 'incorrect' ? 'unsupported' : 'not yet evaluated'}`}>
    <div className="obs-stage-top"><span><i/> INTERACTIVE MODEL</span><span>CONCEPTUAL VISUALIZATION</span></div>
    <div className="obs-orbit-field" aria-hidden="true"><div className="obs-orbit obs-orbit-a"/><div className="obs-orbit obs-orbit-b"/><div className="obs-orbit obs-orbit-c"/>{molecule ? <div className="obs-chain">{['A','A','A','A','A'].map((item, i) => <span key={i}>{item}<small>{i + 1}</small></span>)}</div> : <div className="obs-bridge"><div className="obs-sphere source"><span>SOURCE</span></div><div className="obs-bridge-line"><i/></div><div className="obs-sphere claim"><span>CLAIM</span></div></div>}</div>
    <div className="obs-stage-bottom">{molecule ? 'A VISUAL METAPHOR / NOT A MEASURED STRUCTURE' : 'OBSERVATION → INFERENCE'}<span>{state === 'correct' ? 'SUPPORTED CONNECTION' : state === 'incorrect' ? 'EVIDENCE GAP' : 'WAITING FOR YOUR REASONING'}</span></div>
  </div>
}

function EvidenceWorlds() {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  const item = cases[index]
  const choice = answer === null ? null : item.choices[answer]
  return <div className="obs-workspace"><OrbitStage state={choice ? choice.correct ? 'correct' : 'incorrect' : null}/><div className="obs-panel"><div className="obs-panel-meta"><span>CASE {index + 1} / {cases.length}</span><span>FICTIONAL TEACHING EXAMPLE</span></div><div className="obs-progress"><i style={{ width: `${((index + 1) / cases.length) * 100}%` }}/></div><h3>{item.title}</h3><div className="obs-source"><small>THE OBSERVATION</small><p>{item.source}</p></div><h4>{item.question}</h4><div className="obs-options">{item.choices.map((option, i) => <button className={answer === i ? option.correct ? 'selected correct' : 'selected incorrect' : ''} onClick={() => setAnswer(i)} key={option.text}><span>{String.fromCharCode(65 + i)}</span>{option.text}</button>)}</div><div className={`obs-feedback ${choice?.correct ? 'right' : choice ? 'wrong' : ''}`} aria-live="polite">{choice ? <><strong>{choice.correct ? 'Within the evidence.' : 'The claim travels too far.'}</strong><p>{choice.why}</p></> : <p>Choose a conclusion to test the connection.</p>}</div><div className="obs-panel-actions"><button onClick={() => { setIndex((index + cases.length - 1) % cases.length); setAnswer(null) }} aria-label="Previous case">←</button><span>{String(index + 1).padStart(2, '0')} / {String(cases.length).padStart(2, '0')}</span><button onClick={() => { setIndex((index + 1) % cases.length); setAnswer(null) }} aria-label="Next case">→</button></div></div></div>
}

const scaleOrder = [
  { id: 'sequence', number: '01', title: 'Amino-acid sequence', detail: 'Which residues are linked, and in what order?' },
  { id: 'cell', number: '02', title: 'Cell response', detail: 'What changes in a controlled cell model?' },
  { id: 'organism', number: '03', title: 'Whole organism', detail: 'What happens across connected biological systems?' },
  { id: 'person', number: '04', title: 'Human outcome', detail: 'What was measured in people?' },
] as const
function ScaleLab() {
  const [order, setOrder] = useState([3, 1, 0, 2])
  const [checked, setChecked] = useState(false)
  const correct = order.every((value, index) => value === index)
  function move(from: number, by: number) { const to = from + by; if (to < 0 || to >= order.length) return; const next = [...order]; [next[from], next[to]] = [next[to], next[from]]; setOrder(next); setChecked(false) }
  return <div className="obs-simple-layout"><div className="obs-simple-intro"><span className="obs-kicker">SCALE LAB / ORDER THE LEVELS</span><h3>One chain.<br/>Many levels of evidence.</h3><p>Arrange these levels from a chemical description toward a human outcome. An observation at one level does not automatically answer questions at another.</p><div className="obs-insight">A cell result can be meaningful and still leave human effects unknown.</div></div><div className="obs-sort-card"><div className="obs-sort-heading">DRAG-FREE / KEYBOARD FRIENDLY <span>USE THE ARROWS</span></div>{order.map((value, index) => { const item = scaleOrder[value]; return <div className="obs-sort-row" key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div><div className="obs-sort-buttons"><button onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${item.title} up`}>↑</button><button onClick={() => move(index, 1)} disabled={index === order.length - 1} aria-label={`Move ${item.title} down`}>↓</button></div></div> })}<button className="obs-primary" onClick={() => setChecked(true)}>Check the order →</button><div className={`obs-result ${checked && correct ? 'right' : ''}`} aria-live="polite">{checked ? correct ? 'Exactly. Each level calls for its own evidence.' : 'Not quite. Start with the molecule, then move toward the whole person.' : 'Build the sequence to see the evidence boundary.'}</div></div></div>
}

const annotations = [
  { key: 'sample', label: 'The sample', detail: 'Twelve volunteers are described. That is the observed group, not a basis for assuming everyone would respond similarly.' },
  { key: 'outcome', label: 'The measure', detail: 'The score is self-reported. It records what participants said at two time points.' },
  { key: 'comparison', label: 'The comparison', detail: 'There was no separate group to help distinguish an effect of the program from other explanations.' },
] as const
function ReportDetective() {
  const [active, setActive] = useState<(typeof annotations)[number]['key']>('sample')
  const [answer, setAnswer] = useState<'caused' | 'observed' | null>(null)
  const current = annotations.find(item => item.key === active)!
  return <div className="obs-report-layout"><div className="obs-report-paper"><div className="obs-paper-top">TEACHING REPORT / FICTIONAL <span>OC–TR–01</span></div><h3>One group,<br/>two time points.</h3><p className="obs-paper-deck">A fictional example made for practicing evidence appraisal. No real participants, treatment, or finding is described.</p><hr/><p><button className={active === 'sample' ? 'active' : ''} onClick={() => setActive('sample')}>Twelve volunteers</button> completed a four-week program. A survey was given before and after participation.</p><p>The average <button className={active === 'outcome' ? 'active' : ''} onClick={() => setActive('outcome')}>self-reported score</button> was higher at the end. <button className={active === 'comparison' ? 'active' : ''} onClick={() => setActive('comparison')}>No separate comparison group</button> was included.</p><small>SELECT A HIGHLIGHT TO INSPECT THE METHOD</small></div><div className="obs-detective"><span className="obs-kicker">REPORT DETECTIVE</span><h3>Read beyond<br/>the result.</h3><div className="obs-annotation-tabs">{annotations.map(item => <button key={item.key} className={active === item.key ? 'active' : ''} onClick={() => setActive(item.key)}>{item.label}</button>)}</div><div className="obs-annotation"><span>INSPECT / {current.label.toUpperCase()}</span><h4>{current.label}</h4><p>{current.detail}</p></div><h4>Which statement fits this report?</h4><div className="obs-options"><button className={answer === 'caused' ? 'selected incorrect' : ''} onClick={() => setAnswer('caused')}>The program caused the score change.</button><button className={answer === 'observed' ? 'selected correct' : ''} onClick={() => setAnswer('observed')}>The group’s reported score changed over time.</button></div><div className={`obs-result ${answer === 'observed' ? 'right' : ''}`} aria-live="polite">{answer ? answer === 'observed' ? 'Yes. The report describes a change but cannot isolate its cause.' : 'The missing comparison group leaves other explanations open.' : 'Inspect the method, then choose a statement.'}</div></div></div>
}

const reports = [
  { type: 'ORIGINAL PAPER', title: 'Experiment A: full report', detail: 'Methods, participants, and measurements are described here.' },
  { type: 'CONFERENCE SUMMARY', title: 'Experiment A: short abstract', detail: 'A shorter presentation of the same participants and measurements.' },
  { type: 'LATER ARTICLE', title: 'Experiment A: another analysis', detail: 'A later article using the same original data set.' },
]
function Constellation() {
  const [selected, setSelected] = useState(0)
  const [linked, setLinked] = useState<number[]>([])
  return <div className="obs-constellation"><div className="obs-constellation-stage"><span className="obs-kicker">SOURCE MAP / FICTIONAL TEACHING EXAMPLE</span><div className="obs-orbits" aria-hidden="true"><i/><i/><i/></div><div className="obs-study-core"><small>UNDERLYING DATA</small><strong>Experiment A</strong><small>One participant group</small></div>{reports.map((report, index) => <button key={report.type} className={`obs-report-node node-${index} ${selected === index ? 'active' : ''} ${linked.includes(index) ? 'linked' : ''}`} onClick={() => setSelected(index)}><small>{report.type}</small><strong>{report.title}</strong></button>)}</div><div className="obs-constellation-copy"><span className="obs-kicker">EVIDENCE CONSTELLATION</span><h3>Count studies,<br/>not headlines.</h3><p>Three publications can orbit one experiment. Select each report and connect it to its underlying data.</p><div className="obs-publication"><small>{reports[selected].type}</small><h4>{reports[selected].title}</h4><p>{reports[selected].detail}</p><button className="obs-primary" disabled={linked.includes(selected)} onClick={() => setLinked(current => [...current, selected])}>{linked.includes(selected) ? 'Connected to Experiment A' : 'Connect to Experiment A →'}</button></div><div className="obs-source-count"><strong>{linked.length} / 3</strong><span>REPORTS TRACED</span></div><div className="obs-result" aria-live="polite">{linked.length === 3 ? 'Three reports, one underlying experiment. Repeating the reports as independent studies would count the same data more than once.' : 'Trace every report to reveal the independent study count.'}</div><button className="obs-reset" onClick={() => { setLinked([]); setSelected(0) }}>↺ Replay map</button></div></div>
}

const moleculeFacts = [
  { title: 'Sequence', text: 'A peptide is made of amino acid residues joined in an order. That order is part of its chemical identity.' },
  { title: 'Peptide bond', text: 'Adjacent amino acids are joined through a peptide bond—the repeating connection along the chain.' },
  { title: 'Structure', text: 'A chain can take on a three-dimensional shape. This artwork is conceptual, not a measured structure of a specific peptide.' },
]
function MoleculeExplorer() {
  const [focus, setFocus] = useState(0)
  return <div className="obs-workspace"><OrbitStage molecule/><div className="obs-panel obs-molecule-panel"><span className="obs-kicker">MOLECULE EXPLORER</span><h3>A chain is more<br/>than a line.</h3><p className="obs-panel-lead">Peptides are built from amino acids linked by peptide bonds. The model shows repeated units; it does not depict a particular compound or predict a biological effect.</p><div className="obs-annotation-tabs" role="tablist" aria-label="Molecule concepts">{moleculeFacts.map((fact, index) => <button key={fact.title} role="tab" aria-selected={focus === index} className={focus === index ? 'active' : ''} onClick={() => setFocus(index)}>{fact.title}</button>)}</div><div className="obs-annotation" role="tabpanel"><span>INSPECT / {moleculeFacts[focus].title.toUpperCase()}</span><h4>{moleculeFacts[focus].title}</h4><p>{moleculeFacts[focus].text}</p></div><p className="obs-caveat">ILLUSTRATIVE GEOMETRY ONLY / NO ATOM POSITIONS OR BIOLOGICAL EFFECTS REPRESENTED.</p><a href="https://www.ncbi.nlm.nih.gov/mesh/68010455" target="_blank" rel="noreferrer">Read the NCBI definition ↗</a></div></div>
}

const milestones = [
  { year: '1953', title: 'Oxytocin synthesis reported', text: 'A published report describes preparation and reconversion of oxytocin derivatives, part of the early era of peptide synthesis.', url: 'https://pubmed.ncbi.nlm.nih.gov/13134269/' },
  { year: '1955', title: 'Insulin sequence reported', text: 'Frederick Sanger established the amino-acid sequence of insulin, helping show that a protein has a definite sequence.', url: 'https://www.nobelprize.org/prizes/themes/the-nobel-prize-in-chemistry-the-development-of-modern-chemistry/' },
  { year: '1963', title: 'Solid-phase synthesis takes shape', text: 'Bruce Merrifield described an approach to building peptide chains while anchored to a solid support.', url: 'https://pubs.acs.org/doi/10.1021/ja00897a025' },
  { year: '1982', title: 'Recombinant human insulin approved', text: 'The FDA approved Humulin, the first approved medical product derived from recombinant DNA technology.', url: 'https://www.fda.gov/about-fda/fda-history-exhibits/100-years-insulin' },
]
function TimeMachine() {
  const [selected, setSelected] = useState(0)
  const milestone = milestones[selected]
  return <div className="obs-time"><span className="obs-kicker">RESEARCH TIME MACHINE</span><h3>Ideas become tools.<br/>Tools change what we can ask.</h3><p>Four documented moments in peptide and protein science. Select a year and open its source.</p><div className="obs-time-track">{milestones.map((item, index) => <button key={item.year} className={selected === index ? 'active' : ''} onClick={() => setSelected(index)}><i/><strong>{item.year}</strong><span>{item.title}</span></button>)}</div><div className="obs-time-detail"><strong>{milestone.year}</strong><div><small>DOCUMENTED MILESTONE</small><h4>{milestone.title}</h4><p>{milestone.text}</p><a href={milestone.url} target="_blank" rel="noreferrer">View source ↗</a></div></div></div>
}

function Observatory() {
  const [station, setStation] = useState<StationId>('evidence')
  const current = stations.find(item => item.id === station)!
  return <div className="observatory-page"><div className="obs-container"><header className="obs-intro"><div><p className="obs-kicker"><span/> AN INTERACTIVE FIELD GUIDE TO PEPTIDE SCIENCE</p><h1>Look closer.<br/><em>Think clearer.</em></h1></div><p>Explore molecules, scale, and the distance between an observation and a claim. Six stations. One guiding question: what did the source actually show?</p></header><nav className="obs-nav" aria-label="Observatory stations">{stations.map(item => <button key={item.id} className={station === item.id ? 'active' : ''} aria-current={station === item.id ? 'step' : undefined} onClick={() => setStation(item.id)}><small>{item.number}</small><span>{item.short}</span></button>)}</nav><div className="obs-heading"><div><span>NOW EXPLORING / {current.number}</span><h2>{current.title}</h2></div><p>{current.subtitle}</p></div>{station === 'evidence' && <EvidenceWorlds/>}{station === 'scale' && <ScaleLab/>}{station === 'report' && <ReportDetective/>}{station === 'constellation' && <Constellation/>}{station === 'molecule' && <MoleculeExplorer/>}{station === 'history' && <TimeMachine/>}<div className="obs-after"><span className="obs-kicker">THE QUESTION TO KEEP ASKING</span><h2>What did the source<br/><em>actually</em> show?</h2><p>Good scientific thinking keeps the observation, the inference, and the unanswered question in view at the same time.</p><div><Link to="/learn">Explore more lessons ↗</Link><Link to="/methodology">Read our method ↗</Link></div></div><div className="obs-boundary">Educational content only. Cases are fictional; molecule and evidence visuals are conceptual. No medical advice, product recommendation, dosing, or human-use guidance.</div></div></div>
}
