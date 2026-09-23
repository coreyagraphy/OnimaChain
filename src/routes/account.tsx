import {
  login,
  logout,
  requestPasswordRecovery,
  signup,
  updateUser,
  type User,
} from '@netlify/identity'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { readableAuthError, useAccount } from '~/auth/AccountProvider'
import { BRAND } from '~/brand'

export const Route = createFileRoute('/account')({
  head: () => ({ meta: [
    { title: `Account — ${BRAND}` },
    { name: 'description', content: `Create or sign in to your ${BRAND} account.` },
  ] }),
  component: AccountPage,
})

type Mode = 'signin' | 'signup' | 'recover' | 'reset'

function AccountPage() {
  const { user, ready, recovery, callbackMessage, refresh } = useAccount()
  const [mode, setMode] = useState<Mode>('signin')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (recovery) setMode('reset')
  }, [recovery])

  if (!ready) return <AccountLoading />
  if (user && mode !== 'reset') return <AccountHome user={user} refresh={refresh} callbackMessage={callbackMessage} />

  const chooseMode = (next: Mode) => {
    setMode(next)
    setNotice('')
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    setError('')
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      if (mode === 'signin') {
        await login(String(data.get('email')), String(data.get('password')))
        window.location.href = '/account'
        return
      }
      if (mode === 'signup') {
        const fullName = String(data.get('fullName')).trim()
        const email = String(data.get('email')).trim()
        const password = String(data.get('password'))
        const accepted = data.get('accountConsent') === 'yes'
        const marketingConsent = data.get('marketingConsent') === 'yes'
        if (!accepted) throw new Error('Confirm that you are 21 or older and accept the Terms and Privacy Policy.')
        if (password.length < 10) throw new Error('Use a password with at least 10 characters.')
        const nextUser = await signup(email, password, {
          full_name: fullName,
          age_confirmed: true,
          marketing_consent: marketingConsent,
          marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
          account_source: 'onimachain-web',
        })
        if (nextUser.confirmedAt) {
          window.location.href = '/account'
          return
        }
        setNotice(`Check ${email} for a confirmation link. Your account is not active until you confirm it.`)
        form.reset()
      }
      if (mode === 'recover') {
        const email = String(data.get('email')).trim()
        await requestPasswordRecovery(email)
        setNotice(`If an account exists for ${email}, a password-reset link is on its way.`)
      }
      if (mode === 'reset') {
        const password = String(data.get('password'))
        const confirmation = String(data.get('passwordConfirmation'))
        if (password.length < 10) throw new Error('Use a password with at least 10 characters.')
        if (password !== confirmation) throw new Error('The passwords do not match.')
        await updateUser({ password })
        window.location.href = '/account'
      }
    } catch (caught) {
      setError(readableAuthError(caught))
    } finally {
      setBusy(false)
    }
  }

  const title = mode === 'signup' ? 'Create your account.' : mode === 'recover' ? 'Reset your password.' : mode === 'reset' ? 'Choose a new password.' : 'Welcome back.'
  const lede = mode === 'signup'
    ? 'Save your place in the chain with an email-confirmed account.'
    : mode === 'recover'
      ? 'Enter your account email and we’ll send a secure reset link.'
      : mode === 'reset'
        ? 'Use at least 10 characters. A longer, unique password is strongest.'
        : 'Sign in to continue with the account attached to your email.'

  return <div className="account-world pt-[72px]">
    <div className="wrap account-stage">
      <section className="account-intro" aria-labelledby="account-heading">
        <p className="label label-cyan">OnimaChain / member access</p>
        <h1 id="account-heading" className="display account-heading">One identity.<br /><span>Your chain.</span></h1>
        <p className="lede mt-6 max-w-xl">An account keeps your relationship with OnimaChain in one place. Research tools remain available without signing in.</p>
        <div className="account-ledger" aria-label="What an account stores">
          <AccountLedgerItem marker="01" title="Identity" body="Your name and confirmed email address." />
          <AccountLedgerItem marker="02" title="Consent" body="Whether you chose to receive product email. You can change it later." />
          <AccountLedgerItem marker="03" title="Control" body="Request a copy or deletion of your account information at any time." />
        </div>
      </section>

      <section className="account-shell" aria-labelledby="account-form-title">
        {mode !== 'reset' && <div className="account-tabs" role="tablist" aria-label="Account action">
          <button type="button" role="tab" aria-selected={mode === 'signin' || mode === 'recover'} onClick={() => chooseMode('signin')}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => chooseMode('signup')}>Create account</button>
        </div>}
        <div className="account-form-head">
          <p className="label label-cyan">{mode === 'signup' ? 'New member' : mode === 'signin' ? 'Member sign in' : 'Account recovery'}</p>
          <h2 id="account-form-title" className="display-md">{title}</h2>
          <p>{lede}</p>
        </div>
        <form className="account-form" onSubmit={submit}>
          {mode === 'signup' && <AccountField label="Full name" name="fullName" type="text" autoComplete="name" required />}
          {mode !== 'reset' && <AccountField label="Email address" name="email" type="email" autoComplete="email" required />}
          {(mode === 'signin' || mode === 'signup' || mode === 'reset') && <AccountField label={mode === 'reset' ? 'New password' : 'Password'} name="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={10} required />}
          {mode === 'reset' && <AccountField label="Confirm new password" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={10} required />}
          {mode === 'signup' && <>
            <label className="account-check"><input type="checkbox" name="accountConsent" value="yes" required /><span>I am 21 or older and accept the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</span></label>
            <label className="account-check"><input type="checkbox" name="marketingConsent" value="yes" /><span>Send me launch and product emails. Optional; you can turn this off later.</span></label>
          </>}
          {(error || notice || callbackMessage) && <div className={`account-message ${error ? 'is-error' : ''}`} role={error ? 'alert' : 'status'}>{error || notice || callbackMessage}</div>}
          <button type="submit" className="btn btn-primary account-submit" disabled={busy}>{busy ? 'Working…' : mode === 'signup' ? 'Create account' : mode === 'recover' ? 'Send reset link' : mode === 'reset' ? 'Save new password' : 'Sign in'}</button>
          {mode === 'signin' && <button type="button" className="account-text-button" onClick={() => chooseMode('recover')}>Forgot your password?</button>}
          {(mode === 'recover' || (mode === 'reset' && !recovery)) && <button type="button" className="account-text-button" onClick={() => chooseMode('signin')}>Back to sign in</button>}
        </form>
      </section>
    </div>
  </div>
}

function AccountHome({ user, refresh, callbackMessage }: { user: User; refresh: () => Promise<User | null>; callbackMessage: string }) {
  const metadata = user.userMetadata ?? {}
  const [fullName, setFullName] = useState(String(metadata.full_name ?? user.name ?? ''))
  const [marketingConsent, setMarketingConsent] = useState(metadata.marketing_consent === true)
  const [message, setMessage] = useState(callbackMessage)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setError('')
    try {
      await updateUser({ data: {
        ...metadata,
        full_name: fullName.trim(),
        marketing_consent: marketingConsent,
        marketing_consent_at: marketingConsent ? String(metadata.marketing_consent_at ?? new Date().toISOString()) : null,
      } })
      await refresh()
      setMessage('Account preferences saved.')
    } catch (caught) {
      setError(readableAuthError(caught))
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    setBusy(true)
    try {
      await logout()
      window.location.href = '/'
    } catch (caught) {
      setError(readableAuthError(caught))
      setBusy(false)
    }
  }

  async function deleteAccount() {
    if (deleteConfirmation !== 'DELETE') return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/.netlify/functions/account-delete', { method: 'POST' })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'The account could not be deleted.')
      try { await logout() } catch { /* logout clears local cookies even if the deleted remote user is gone */ }
      window.location.href = '/'
    } catch (caught) {
      setError(readableAuthError(caught))
      setBusy(false)
    }
  }

  return <div className="account-world pt-[72px]">
    <div className="wrap account-home">
      <header>
        <p className="label label-cyan">Account / active member</p>
        <h1 className="display account-heading">Your link in<br /><span>the chain.</span></h1>
        <p className="lede mt-5">Signed in as <strong>{user.email}</strong>.</p>
      </header>
      <div className="account-home-grid">
        <form className="account-shell account-form" onSubmit={saveProfile}>
          <div className="account-form-head">
            <p className="label label-cyan">Profile</p>
            <h2 className="display-md">Your information</h2>
            <p>This is the information attached to your OnimaChain account.</p>
          </div>
          <AccountField label="Full name" name="fullName" type="text" autoComplete="name" value={fullName} onChange={setFullName} required />
          <div className="account-readonly"><span>Email address</span><strong>{user.email}</strong><small>Email changes require confirmation.</small></div>
          <label className="account-check"><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} /><span>Send me launch and product emails.</span></label>
          {(error || message) && <div className={`account-message ${error ? 'is-error' : ''}`} role={error ? 'alert' : 'status'}>{error || message}</div>}
          <div className="account-actions"><button type="submit" className="btn btn-primary" disabled={busy}>Save changes</button><button type="button" className="btn" onClick={signOut} disabled={busy}>Sign out</button></div>
        </form>
        <aside className="account-data-card">
          <p className="label label-violet">Data control</p>
          <h2 className="display-md">You own the exit.</h2>
          <p>Edit your profile here, delete the account yourself, or contact us from this account’s email to request a copy of the information we hold.</p>
          <Link to="/contact" className="btn btn-sm">Contact OnimaChain</Link>
          <button type="button" className="account-delete-toggle" onClick={() => setShowDelete((visible) => !visible)} aria-expanded={showDelete}>Delete my account</button>
          {showDelete && <div className="account-delete-panel">
            <strong>Deletion is permanent.</strong>
            <p>Your Identity account and profile metadata will be removed. Type DELETE to confirm.</p>
            <label className="account-field"><span>Confirmation</span><input type="text" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" /></label>
            <button type="button" className="btn account-delete-button" disabled={busy || deleteConfirmation !== 'DELETE'} onClick={deleteAccount}>Permanently delete account</button>
          </div>}
          {user.createdAt && <p className="account-created">Account created {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
        </aside>
      </div>
    </div>
  </div>
}

function AccountLoading() {
  return <div className="account-world pt-[72px]"><div className="wrap account-loading"><span className="account-loading-dot" /><p className="label">Checking account…</p></div></div>
}

function AccountLedgerItem({ marker, title, body }: { marker: string; title: string; body: string }) {
  return <div><span>{marker}</span><p><strong>{title}</strong>{body}</p></div>
}

function AccountField({ label, name, type, autoComplete, minLength, required, value, onChange }: { label: string; name: string; type: 'text' | 'email' | 'password'; autoComplete: string; minLength?: number; required?: boolean; value?: string; onChange?: (value: string) => void }) {
  return <label className="account-field"><span>{label}</span><input name={name} type={type} autoComplete={autoComplete} minLength={minLength} required={required} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} /></label>
}
