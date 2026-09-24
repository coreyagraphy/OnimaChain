import { useEffect, useState, type FormEvent } from 'react'
import { publicOperator } from '~/operator'

type Channel = { ready: boolean; operator?: string; email?: string }

export function EditorialIntake({ page = '' }: { page?: string }) {
  const [channel, setChannel] = useState<Channel>({ ready: false, operator: publicOperator.name, email: publicOperator.email })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  useEffect(() => { let active = true; fetch('/api/editorial').then(response => response.ok ? response.json() as Promise<Channel> : { ready: false } as Channel).then(value => { if (active) setChannel({ ...value, operator: value.operator || publicOperator.name, email: value.email || publicOperator.email }) }).catch(() => { if (active) setChannel({ ready: false, operator: publicOperator.name, email: publicOperator.email }) }); return () => { active = false } }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!channel?.ready) return
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setState('sending'); setError('')
    try {
      const response = await fetch('/api/editorial', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Delivery failed.')
      setState('sent'); form.reset()
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Delivery failed.'); setState('error') }
  }
  return <section className="panel glass relative p-6 md:p-8 max-w-3xl" aria-labelledby="editorial-intake-title">
    <p className="relative label label-cyan">Editorial contact</p><h2 id="editorial-intake-title" className="relative display-md text-2xl mt-3">Report an error or suggest a source</h2>
    <p className="relative text-sm text-bone/80 mt-3">Include the page, the statement you want reviewed, and an original source if available. Do not send medical records or personal treatment questions. We cannot recommend compounds, doses or combinations.</p>
    {channel?.operator && channel.email && <p className="relative text-sm muted mt-3">Operator: <span className="mv-operator-name">{channel.operator}</span> · Editorial inbox: <a href={`mailto:${channel.email}`} className="underline">{channel.email}</a></p>}
    {channel?.ready ? <><form onSubmit={submit} className="relative grid gap-4 mt-7">
      <label className="grid gap-1 text-sm">Site page<input name="page" required maxLength={250} defaultValue={page || (typeof window !== 'undefined' ? window.location.pathname : '')} placeholder="/compound/example" /></label>
      <label className="grid gap-1 text-sm">Statement or correction<textarea name="statement" required minLength={10} maxLength={4000} rows={5} /></label>
      <label className="grid gap-1 text-sm">Original source URL (optional)<input name="source" type="url" maxLength={500} placeholder="https://…" /></label>
      <label className="grid gap-1 text-sm">Reply email (optional)<input name="reply" type="email" maxLength={200} /></label>
      <label className="sr-only">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="btn btn-primary justify-self-start" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send for editorial review'}</button>
      <p role="status" aria-live="polite" className="text-sm">{state === 'sent' ? 'Submission accepted for delivery to the configured editorial inbox.' : state === 'error' ? error : ''}</p>
    </form></> : <p className="relative text-sm text-bone/70 mt-6" role="status">The online form is closed until its sender and inbox delivery are tested. {channel?.email ? <>For now, email corrections directly to <a className="underline" href={`mailto:${channel.email}`}>{channel.email}</a>.</> : 'Public contact details are pending configuration.'}</p>}
  </section>
}
