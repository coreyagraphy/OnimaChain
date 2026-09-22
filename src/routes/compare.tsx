import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { computedMW, displayName } from '~/data/compounds'
import { DOMAIN_BY_ID } from '~/data/domains'
import { claimsForCompound, TRANSLATION_STAGES } from '~/data/claims'
import { distributionFor, evidenceGenome, latestChangeFor, themesFor, translationFor } from '~/data/evidence'
import { distinctGroups, studiesForCompound } from '~/data/studies'
import { longestSharedSubsequence, CLASS_COLORS, buildResidues } from '~/scenes/chain/geometry'
import { CORPUS } from '~/data/signal'
import { provenanceText } from '~/components/SourceBadge'
import { BRAND } from '~/brand'
import { RESEARCH_ENTITIES, RESEARCH_ENTITY_BY_ID, REGULATORY_RECORDS, TARGETS, commerceLabelFor, coreCompoundFor, entityTypeLabel, type ResearchEntity } from '~/data/research-entities'

export const Route = createFileRoute('/compare')({
  validateSearch: (s: Record<string, unknown>) => ({ a: typeof s.a === 'string' ? s.a : undefined, b: typeof s.b === 'string' ? s.b : undefined }),
  head: () => ({ meta: [{ title: `Compare — ${BRAND}` }] }),
  component: Compare,
})

const targetName = Object.fromEntries(TARGETS.map((target) => [target.id, target.label]))

function detail(entity: ResearchEntity) {
  const legacy = coreCompoundFor(entity)
  const studies = legacy ? studiesForCompound(legacy.slug) : []
  const combination = entity.type !== 'COMPOUND' ? entity : null
  const claims = claimsForCompound(entity.id)
  const legal = REGULATORY_RECORDS.filter((record) => record.compoundId === entity.id)
  return {
    identity: legacy ? `${legacy.name}${legacy.displayName ? ` (displayed as ${legacy.displayName})` : ''} · ${legacy.sequence ? `${legacy.sequence.length} aa` : 'sequence pending'} · MW ${(legacy.mw ?? computedMW(legacy)) ?? '—'}` : combination ? `${combination.name} · ${combination.componentIds.length} separate components; no single sequence or molecular weight` : `${entity.name} · structure not verified in this library`,
    type: entityTypeLabel(entity),
    aliases: entity.aliases.join(' · ') || 'None listed',
    components: combination ? combination.componentIds.map((id) => RESEARCH_ENTITY_BY_ID[id]?.name ?? id).join(' + ') : 'Not a combination',
    targets: entity.type === 'COMPOUND' ? entity.targets.map((id) => targetName[id]).join(' · ') || 'No target mapped here' : 'See the separate component profiles',
    research: entity.type === 'COMPOUND' ? entity.stage ?? (entity.researchStatus === 'CORE_LIBRARY' ? 'Core research library' : 'Watchlist') : combination?.type === 'COMMUNITY_STACK' ? 'Community stack; not a clinical programme' : 'Clinical combination; see source',
    commerce: commerceLabelFor(entity),
    topic: legacy ? DOMAIN_BY_ID[legacy.domain].name : 'No browsing topic assigned',
    studyKinds: legacy ? (() => { const groups = evidenceGenome(legacy.slug).filter((item) => (item.count ?? 0) > 0 && item.id !== 'research-age'); return groups.length ? groups.map((item) => `${item.label} ${item.value ?? item.count}`).join(' · ') : `No qualifying record is currently indexed in ${BRAND}'s corpus` })() : 'No studies indexed to this exact record',
    translation: legacy ? (() => { const track = translationFor(legacy.slug); return track.length ? track.map((row) => `${row.outcome}: ${row.stages.length ? TRANSLATION_STAGES.filter((stage) => row.stages.includes(stage.id)).map((stage) => stage.label).join(' → ') : 'not tested yet'}`).join(' · ') : 'No outcome mapped' })() : 'Not mapped to this exact record',
    human: legacy && distributionFor(legacy.slug).human ? `${distributionFor(legacy.slug).human} checked studies` : 'None indexed to this exact record',
    teams: studies.length ? `${distinctGroups(studies).length} senior author(s) across ${studies.length} studies` : 'Not checked yet',
    themes: legacy ? themesFor(legacy.slug).filter((theme) => theme.kind === 'research').map((theme) => theme.label).join(' · ') || 'No topics yet' : 'No topics indexed to this exact record',
    claims: claims.map((claim) => claim.id).join(' · ') || 'None indexed to this exact record',
    legal: legal.length ? legal.map((record) => `${record.jurisdiction}: ${record.status}`).join(' · ') : 'No regulator decision listed for this exact record',
    provenance: legacy ? provenanceText(legacy).primary : combination ? 'Separate component structures; no single combination structure' : 'Conceptual profile; no verified structure rendered',
    update: legacy ? (() => { const change = latestChangeFor(legacy.slug); return change ? `${change.date} — ${change.change}` : 'No claim change recorded' })() : entity.type === 'COMPOUND' && entity.statusAsOf ? `Research status checked ${entity.statusAsOf}` : 'No dated change recorded',
  }
}

function Compare() {
  const search = Route.useSearch()
  const [ids, setIds] = useState<string[]>([search.a && RESEARCH_ENTITY_BY_ID[search.a] ? search.a : 'bpc-157', search.b && RESEARCH_ENTITY_BY_ID[search.b] ? search.b : 'tb-500'])
  const entities = ids.map((id) => RESEARCH_ENTITY_BY_ID[id])
  const details = entities.map(detail)
  const rows = [
    ['Identity', 'identity'], ['Record type', 'type'], ['Aliases', 'aliases'], ['Components', 'components'], ['Mapped receptors / targets', 'targets'], ['Research status', 'research'], ['Commerce', 'commerce'], ['Topic', 'topic'],
    ['Kinds of studies checked', 'studyKinds'], ['How far it has been tested', 'translation'], ['Studies in people', 'human'], ['Real-world reports', 'reports'], ['How trustworthy is the chatter', 'chatter'], ['Separate research teams', 'teams'], ['What the studies looked at', 'themes'], ['Claims tracked', 'claims'], ['Legal status', 'legal'], ['Where the 3D shape comes from', 'provenance'], ['Last update', 'update'],
  ] as const
  const legacy = entities.slice(0, 2).map(coreCompoundFor)
  const shared = legacy[0]?.sequence && legacy[1]?.sequence ? longestSharedSubsequence(legacy[0].sequence, legacy[1].sequence) : null

  return (
    <div className="pt-28 wrap">
      <p className="label label-cyan">Compare</p>
      <h1 className="display text-[clamp(2.6rem,7vw,6.4rem)] mt-3">Side by side. No hype.</h1>
      <p className="lede mt-5 max-w-2xl">Compare up to four records. Compounds, Watchlist entries and combinations retain their separate research and inventory status. We never pick a winner.</p>
      <div className="mt-8 flex flex-wrap gap-2 items-end">
        {ids.map((id, i) => (
          <label key={i} className="grid gap-1"><span className="label">Record {i + 1}</span>
            <select value={id} onChange={(event) => setIds(ids.map((value, index) => index === i ? event.target.value : value))}>
              {RESEARCH_ENTITIES.map((entity) => <option key={entity.id} value={entity.id}>{entity.name} · {entityTypeLabel(entity)}</option>)}
            </select>
          </label>
        ))}
        {ids.length < 4 && <button className="btn btn-sm" onClick={() => { const next = RESEARCH_ENTITIES.find((entity) => !ids.includes(entity.id)); if (next) setIds([...ids, next.id]) }}>+ Add</button>}
        {ids.length > 2 && <button className="btn btn-sm" onClick={() => setIds(ids.slice(0, -1))}>− Remove</button>}
      </div>
      <div className="mt-8 panel-flat overflow-x-auto">
        <table className="data min-w-[720px]">
          <thead><tr><th className="w-[180px]">Row</th>{entities.map((entity, i) => <th key={`${entity.id}-${i}`}>{entity.name}</th>)}</tr></thead>
          <tbody>{rows.map(([label, key]) => <tr key={key}><td className="label !normal-case !tracking-normal !text-[12px] text-bone/70">{label}</td>{details.map((item, i) => <td key={i} className="text-[13px] text-bone/85">{key === 'reports' ? CORPUS.header : key === 'chatter' ? 'Not measured yet — no reports collected' : item[key]}</td>)}</tr>)}</tbody>
        </table>
      </div>

      {entities.length >= 2 && (
        <section className="mt-12">
          <p className="label label-cyan">Residue diff — {entities[0].name} vs {entities[1].name}</p>
          <p className="mt-2 text-sm muted">{shared ? shared.text.length >= 2 ? `Longest shared subsequence: ${shared.text} (${shared.text.length} residues, positions ${shared.ai + 1} / ${shared.bi + 1})` : 'No shared subsequence' : 'Residue diff requires two verified, listed single-compound sequences. A stack has no single sequence.'}</p>
          {legacy[0] && legacy[1] && <div className="mt-4 grid md:grid-cols-2 gap-4">
            {legacy.map((compound, index) => {
              if (!compound) return null
              const residues = buildResidues(compound)
              const start = index === 0 ? shared?.ai ?? -1 : shared?.bi ?? -1
              const length = shared?.text.length ?? 0
              return <div key={compound.slug} className="panel-flat p-4 overflow-x-auto">
                <p className="label mb-3">{displayName(compound)}</p>
                {residues.length ? <div className="flex flex-wrap gap-1">{residues.map((residue) => { const hit = length >= 2 && residue.index >= start && residue.index < start + length; return <span key={residue.index} className={`mono text-[12px] w-7 h-7 grid place-items-center rounded ${hit ? 'ring-1 ring-cyan' : ''}`} style={{ background: `${CLASS_COLORS[residue.cls]}22`, color: CLASS_COLORS[residue.cls] }} title={`${residue.name} ${residue.pos}`}>{residue.code}</span> })}</div> : <p className="text-sm muted">Sequence pending verification</p>}
              </div>
            })}
          </div>}
        </section>
      )}
    </div>
  )
}
