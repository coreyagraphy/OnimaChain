import { createFileRoute, Link, type SearchSchemaInput } from '@tanstack/react-router'
import { COMPOUND_OPTIONS, EXPERIENCES, OTHER, OUTCOMES, PEPTIDES, REVIEWED, type Experience } from '~/data/experiences'
import { compoundName, DEFAULT_FILTERS, interpretQuery, searchExperiences, TOPICS, validateFilters, type Filters } from '~/data/experience-search'
import experienceCss from '~/styles/experiences.css?url'

export const Route = createFileRoute('/experiences')({
  validateSearch: (raw: Partial<Filters> & SearchSchemaInput) => validateFilters(raw),
  head: () => ({
    meta: [
      { title: 'Human experiences — OnimaChain' },
      { name: 'description', content: 'Explore sourced injectable experiences across 21 peptides, plus a separate 5-Amino-1MQ collection. Search conditions, benefits, mixed results and unwanted effects.' },
    ],
    links: [{ rel: 'stylesheet', href: experienceCss }],
  }),
  component: Experiences,
})

function Experiences() {
  const filters = Route.useSearch()
  const navigate = Route.useNavigate()
  const update = (patch: Partial<Filters>) => navigate({ search: { ...filters, ...patch }, replace: true, resetScroll: false })
  const showResults = async (patch: Partial<Filters>) => {
    await update(patch)
    const heading = document.getElementById('ex-results-title')
    heading?.focus({ preventScroll: true })
    heading?.scrollIntoView({ block: 'start' })
  }
  const results = searchExperiences(filters)
  const interpreted = interpretQuery(filters.q)
  const matchedTopics = [...new Set([...interpreted.topics, ...(filters.topic ? [filters.topic] : [])])]
  const topicLabels = matchedTopics.map(id => TOPICS[id].label).join(' + ')
  const other = filters.group === 'other'
  const options = other ? [OTHER] : PEPTIDES
  const total = EXPERIENCES.filter(r => r.compounds.includes(OTHER[0]) === other).length
  const hasFilters = Boolean(filters.q || filters.compound || filters.topic || filters.outcome)
  return <div className="ex-page wrap">
    <header className="ex-hero">
      <div>
        <p className="label label-cyan">The experience index / 01</p>
        <h1>HUMAN STORIES.<br /><span>THE FULL PICTURE.</span></h1>
        <p className="ex-intro">What people noticed. What went wrong. What didn’t change. Explore firsthand accounts of injectable use, with a source behind every story.</p>
        <div className="ex-metrics"><span><b>21</b> peptides</span><span><b>+1</b> non-peptide</span><span><b>{EXPERIENCES.length}</b> sourced accounts</span></div>
      </div>
      <aside className="ex-note"><span className="ex-star" aria-hidden>✳</span><p className="label">Read the experience.<br />Keep the context.</p><p>These are unverified human self-reports, not clinical findings or instructions for use. A reported change does not prove a compound caused it.</p><a href="#ex-method">How we select accounts ↘</a></aside>
    </header>

    <section className="ex-search" aria-labelledby="ex-search-title">
      <div className="ex-section-head"><h2 id="ex-search-title">Start with what you’re curious about.</h2><span className="ex-reviewed">Sources reviewed <time dateTime={REVIEWED}>Nov 8, 2026</time></span></div>
      <div className="ex-groups" aria-label="Collection">
        <button type="button" aria-pressed={!other} onClick={() => update({ group: 'peptides', compound: '' })}>21 peptides <span>01—21</span></button>
        <button type="button" aria-pressed={other} onClick={() => update({ group: 'other', compound: '' })}>5-Amino-1MQ <span>Non-peptide</span></button>
      </div>
      {other && <p className="ex-other-note">5-Amino-1MQ is a small molecule, kept separate from the peptide collection. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11622326/" target="_blank" rel="noopener noreferrer">Research context ↗</a></p>}
      <label className="ex-query-label" htmlFor="experience-query">Search a condition, symptom or compound</label>
      <form className="ex-query" role="search" onSubmit={event => {
        event.preventDefault()
        const q = new FormData(event.currentTarget).get('q')
        void showResults({ q: typeof q === 'string' ? q : '' })
      }}>
        <span aria-hidden>⌕</span>
        <input id="experience-query" name="q" type="search" enterKeyHint="search" value={filters.q} maxLength={180} placeholder="Try “my knee hurts” or “my leg is swollen”…" onChange={e => update({ q: e.target.value })} aria-describedby="ex-search-help" />
        {filters.q && <button type="button" aria-label="Clear search text" onClick={() => update({ q: '' })}>×</button>}
        <button type="submit">Search</button>
      </form>
      <p id="ex-search-help" className="ex-help">Describe it in your own words. We match reviewed topics and everyday phrases, including reports of relief and worsening symptoms. Multiple conditions must occur in the same account. Results are not treatment recommendations.</p>
      <div className="ex-examples" aria-label="Try a symptom search"><span>Try saying</span>{['my knee hurts', 'my leg is swollen', 'pinch nerve', 'I can’t sleep', 'I’m tired all the time'].map(q => <button key={q} type="button" aria-pressed={filters.q === q} onClick={() => void showResults({ ...DEFAULT_FILTERS, q })}>{q}</button>)}</div>
      <div className="ex-search-feedback">
        <p role="status" aria-live="polite" aria-atomic="true">{results.length ? `${results.length} matching account${results.length === 1 ? '' : 's'}` : 'No reviewed accounts match this search.'}</p>
        <a href="#ex-results-title">{results.length ? 'View results ↓' : 'See coverage details ↓'}</a>
      </div>
      {matchedTopics.length > 0 && <p className="ex-understood"><b>Searching related accounts for:</b> {topicLabels}. {interpreted.words.length > 0 && <>Also requiring: {interpreted.words.join(', ')}.</>}</p>}
      {interpreted.ambiguousNegation && <p className="ex-understood">We can’t reliably interpret this negative phrase. Search the symptom by itself, then use the reported-outcome filter and read each account’s context.</p>}
      <div className="ex-filters">
        <label>Compound<select aria-label="Compound" value={filters.compound} onChange={e => update({ compound: e.target.value })}><option value="">{other ? '5-Amino-1MQ' : 'All 21 peptides'}</option>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label>Condition / topic<select aria-label="Condition / topic" value={filters.topic} onChange={e => update({ topic: e.target.value })}><option value="">All topics</option>{Object.entries(TOPICS).map(([id, topic]) => <option key={id} value={id}>{topic.label}</option>)}</select></label>
        <label>Reported outcome<select aria-label="Reported outcome" value={filters.outcome} onChange={e => update({ outcome: e.target.value as Filters['outcome'] })}><option value="">Every outcome</option>{Object.entries(OUTCOMES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      </div>
      <div className="ex-quick" aria-label="Explore topics"><span>Explore</span>{['knee', 'leg-swelling', 'pinched-nerve', 'cholesterol', 'sleep', 'anxiety', 'gut', 'skin', 'energy'].map(topic => <button key={topic} type="button" aria-pressed={filters.topic === topic} onClick={() => update({ topic: filters.topic === topic ? '' : topic })}>{TOPICS[topic].label}</button>)}</div>
    </section>

    <section className="ex-results" aria-labelledby="ex-results-title">
      <div className="ex-result-head"><div><p className="label label-cyan">{other ? 'Separate collection / Non-peptide' : 'Field notes / Injectable accounts'}</p><h2 id="ex-results-title" tabIndex={-1}>{topicLabels || (filters.compound ? compoundName(filters.compound) : other ? '5-Amino-1MQ experiences' : 'Every experience has another side.')}</h2></div><div className="ex-result-count"><p>{results.length} of {total} accounts</p>{hasFilters && <button type="button" onClick={() => update({ ...DEFAULT_FILTERS, group: filters.group })}>Clear filters ↺</button>}</div></div>
      {matchedTopics.includes('leg-swelling') && <aside className="ex-symptom-note"><b>If this is happening now:</b> Unexplained swelling in one leg, sudden or severe swelling, or a red or hot area needs urgent medical assessment. With chest pain or trouble breathing, seek emergency help. <a href="https://www.nhs.uk/conditions/oedema/" target="_blank" rel="noopener noreferrer">NHS guidance ↗</a></aside>}
      <p className="ex-help">“Mixed” includes both helpful and unwanted changes, or an effect that faded. Counts describe this collection, not success rates or how common a reaction is.</p>
      {results.length ? <div className="ex-cards">{results.map(record => <ExperienceCard key={record.id} record={record} matchedTopics={matchedTopics} />)}</div> : <div className="ex-empty"><span aria-hidden>∅</span><h3>No reviewed account matches these filters.</h3><p>This is a gap in our collection, not evidence that a compound works or doesn’t work for this condition. Try a shorter term or clear a filter.</p>{filters.group === 'peptides' && /5.?amino|1mq/i.test(filters.q) && <button className="btn btn-primary" type="button" onClick={() => update({ group: 'other', compound: '' })}>Search the 5-Amino-1MQ collection →</button>}<Link to="/claims">Explore the research library →</Link></div>}
    </section>

    <details className="ex-coverage"><summary>Browse all 21 peptides + the separate compound <span>Coverage, not a popularity ranking</span></summary><div className="ex-coverage-grid">{COMPOUND_OPTIONS.map(([id, name]) => {
      const accounts = EXPERIENCES.filter(r => r.compounds.includes(id))
      return <button key={id} type="button" onClick={() => { update({ ...DEFAULT_FILTERS, group: id === OTHER[0] ? 'other' : 'peptides', compound: id }); document.getElementById('ex-search-title')?.scrollIntoView({ block: 'start' }) }}><b>{name}</b><span>{accounts.length} account{accounts.length === 1 ? '' : 's'}{id === OTHER[0] ? ' · Non-peptide' : ''}</span></button>
    })}</div></details>

    <section id="ex-method" className="ex-method" aria-labelledby="ex-method-title"><p className="label label-cyan">Behind the index</p><h2 id="ex-method-title">The source matters as much as the story.</h2><div className="ex-method-grid"><div><h3>Firsthand, injection-specific</h3><p>Cards summarize public Reddit accounts and creator-written accounts linked to YouTube videos. The reporter must explicitly describe injecting. Oral, cream and nasal-only experiences are excluded. Some linked threads discuss other routes; the card identifies the exact account used.</p></div><div><h3>Good, bad and inconclusive</h3><p>We sought benefits, unwanted effects and no-effect accounts for every compound. Coverage is uneven. Mixed reports keep their downsides, and combinations stay labeled. CJC formulations and products sold as TB-500 can differ; names here follow the reports.</p></div><div><h3>A reviewed collection</h3><p>This is a manually assembled snapshot, not a live feed or a representative sample. Sources may change or disappear. Identities, products, diagnoses and outcomes are unverified. YouTube cards identify the material actually reviewed. A linked video is not counted as a second person; an accompanying article is not presented as a verified transcript. Commercial interests are noted when visible.</p></div><div><h3>Human accounts ≠ clinical evidence</h3><p>Animal findings do not establish human benefit. A discussion of a condition does not show that it was treated. Compare these stories with the <Link to="/claims">research library</Link> and its study context.</p></div></div><p className="ex-corrections">Found a source problem? <Link to="/corrections">Request a correction →</Link></p></section>
  </div>
}

function ExperienceCard({ record, matchedTopics }: { record: Experience; matchedTopics: string[] }) {
  const community = new URL(record.source).pathname.split('/')[2]
  return <article className="ex-card" data-outcome={record.outcome} aria-labelledby={`title-${record.id}`}>
    <div className="ex-card-top">
      <p className="ex-compounds">{record.compounds.map(compoundName).join(' + ')}</p>
      <span className="ex-outcome"><i aria-hidden />{OUTCOMES[record.outcome]}</span>
    </div>
    <p className="ex-source-kind">{record.video ? 'YouTube + creator article' : 'Reddit · Self-report'}</p>
    {record.compounds.length > 1 && <p className="ex-combination">Combination account · individual effects cannot be separated</p>}
    <h3 id={`title-${record.id}`}>{record.title}</h3><p className="ex-summary">{record.summary}</p>
    {matchedTopics.length > 0 && <div className="ex-match"><b>Why this matches</b>{matchedTopics.filter(id => record.topics.includes(id)).map(id => <p key={id}><strong>{TOPICS[id].label}:</strong> {record.topicNotes?.[id] ?? 'Discussed in this account. Read the reported outcome and context above.'}</p>)}</div>}
    <div className="ex-tags">{record.topics.map(topic => <span key={topic}>{TOPICS[topic].label}</span>)}</div>
    <p className="ex-context">{record.context}</p>
    <details className="ex-provenance"><summary>Injection & source details</summary><p>{record.route}</p><p><b>Find it:</b> {record.locator}</p>{record.supportingSources?.map(source => <p key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></p>)}<p>Public source text reviewed Nov 8, 2026. This is the review date, not the post date.</p></details>
    {record.video && <div className="ex-video"><p>{record.video.reviewBasis}</p><a href={record.video.url} target="_blank" rel="noopener noreferrer">Watch on YouTube · {record.video.creator} ↗</a></div>}
    <a className="ex-source-link" href={record.source} target="_blank" rel="noopener noreferrer" aria-label={`Read source for ${record.title} (opens a new tab)`}><span>{record.video ? 'Read the creator’s account' : 'Read the original'} <small>{record.video ? record.video.creator : `r/${community}`}</small></span><span aria-hidden>↗</span></a>
  </article>
}
