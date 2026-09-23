import {
  getUser,
  handleAuthCallback,
  onAuthChange,
  type User,
} from '@netlify/identity'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type AccountContextValue = {
  user: User | null
  ready: boolean
  recovery: boolean
  callbackMessage: string
  refresh: () => Promise<User | null>
}

const AccountContext = createContext<AccountContextValue | null>(null)

export function AccountProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [callbackMessage, setCallbackMessage] = useState('')

  useEffect(() => {
    let active = true
    const unsubscribe = onAuthChange((event, nextUser) => {
      if (!active) return
      setUser(nextUser)
      if (event === 'recovery') setRecovery(true)
    })

    async function loadAccount() {
      try {
        const callback = await handleAuthCallback()
        if (!active) return
        if (callback?.type === 'recovery') {
          setRecovery(true)
          setCallbackMessage('Choose a new password to finish recovering your account.')
        } else if (callback?.type === 'confirmation') {
          setCallbackMessage('Email confirmed. Your account is ready.')
        } else if (callback?.type === 'oauth') {
          setCallbackMessage('Signed in successfully.')
        }
        setUser(callback?.user ?? await getUser())
      } catch (error) {
        if (active) setCallbackMessage(readableAuthError(error))
      } finally {
        if (active) setReady(true)
      }
    }

    void loadAccount()
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo<AccountContextValue>(() => ({
    user,
    ready,
    recovery,
    callbackMessage,
    refresh: async () => {
      const nextUser = await getUser()
      setUser(nextUser)
      return nextUser
    },
  }), [callbackMessage, ready, recovery, user])

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const account = useContext(AccountContext)
  if (!account) throw new Error('useAccount must be used inside AccountProvider')
  return account
}

export function readableAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (/identity.+not (configured|available)|missing identity/i.test(message)) return 'Accounts are not enabled on this site yet. The site owner needs to enable Netlify Identity.'
  if (/invalid login|invalid.*credential|email.*password/i.test(message)) return 'That email and password combination was not recognized.'
  if (/already registered|already exists/i.test(message)) return 'An account already exists for that email. Sign in or reset your password.'
  if (/password/i.test(message) && /short|characters|length/i.test(message)) return 'Use a password with at least 10 characters.'
  if (/network|fetch/i.test(message)) return 'The account service could not be reached. Check your connection and try again.'
  return message || 'The account service could not complete that request. Try again.'
}
