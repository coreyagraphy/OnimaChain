import type { CSSProperties } from 'react'
import type { LessonVisual as VisualKind } from '~/data/lessons'

/** Conceptual diagrams, not molecular structures or research figures. */
export function LessonVisual({ kind }: { kind: VisualKind }) {
  return <div className={`lab-visual lab-visual--${kind}`} aria-hidden="true">
    {kind === 'mutation' && <div className="lab-mutation">{['STUDY', 'SUMMARY', 'HEADLINE', 'POST', 'CLAIM'].map((label, i) => <span key={label} style={{ '--step': i } as CSSProperties}>{label}</span>)}</div>}
    {kind === 'species' && <div className="lab-species">{['CELL', 'MOUSE', 'RAT', 'HUMAN'].map((label, i) => <span key={label} className={i === 2 ? 'active' : ''}><b>{['◌', '●', '●', '◇'][i]}</b>{label}</span>)}</div>}
    {kind === 'dish' && <div className="lab-dish"><span className="lab-dish-body">BODY / NOT STUDIED</span><div className="lab-dish-rim">{Array.from({ length: 13 }, (_, i) => <i key={i} style={{ '--n': i } as CSSProperties} />)}</div><span>CELLS OUTSIDE A BODY</span></div>}
    {kind === 'replication' && <div className="lab-replication"><span className="lab-replication-core">LAB 01</span><div>{Array.from({ length: 10 }, (_, i) => <i key={i}>P{i + 1}</i>)}</div><span className="lab-replication-other">LAB 02 ?</span></div>}
    {kind === 'causation' && <div className="lab-causation"><div className="lab-causation-lines"><i/><i/></div><span>AFTER ≠ BECAUSE</span></div>}
    {kind === 'receptor' && <div className="lab-receptor"><span className="lab-receptor-peptide">SIGNAL</span><span className="lab-receptor-well">RECEPTOR</span><i/><i/><i/></div>}
    {kind === 'echo' && <div className="lab-echo"><span>1 SOURCE</span>{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--n': i } as CSSProperties} />)}<b>MANY POSTS</b></div>}
    {kind === 'paper' && <div className="lab-paper"><span>RESEARCH PAPER</span>{['Abstract', 'Methods', 'Results', 'Limitations', 'Conclusion'].map((s) => <i key={s}>{s}</i>)}</div>}
    {kind === 'phases' && <div className="lab-phases">{['I', 'II', 'III'].map((s) => <span key={s}>PHASE <b>{s}</b></span>)}</div>}
    {kind === 'split' && <div className="lab-split"><span>STORY<small>one account</small></span><b>≠</b><span>STUDY<small>tested comparison</small></span></div>}
  </div>
}
