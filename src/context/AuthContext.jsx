import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { toast } from 'sonner'
import { auth, firebaseReady, googleProvider } from '@/lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(firebaseReady)

  useEffect(() => {
    if (!auth) return undefined

    // Pick up user after a redirect sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setUser(result.user)
      })
      .catch((err) => {
        const ignored = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/no-auth-event']
        if (!ignored.includes(err?.code)) {
          console.error('[Auth] redirect result error:', err?.code, err?.message)
          toast('Sign-in failed. Please try again.')
        }
      })

    return onAuthStateChanged(auth, (next) => {
      setUser(next)
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(async () => {
    if (!auth) {
      toast('Firebase is not configured yet.')
      return
    }
    // Try popup first (fastest UX). If the browser blocks popups, fall back to redirect.
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const silentCodes = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']
      if (silentCodes.includes(err?.code)) return
      // popup-blocked or any other issue → use redirect flow
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, googleProvider)
        } catch (redirectErr) {
          console.error('[Auth] redirect fallback error:', redirectErr)
          toast('Sign-in failed. Please try again.')
        }
      } else {
        console.error('[Auth] popup error:', err?.code, err?.message)
        toast('Sign-in failed. Please try again.')
      }
    }
  }, [])

  const signOut = useCallback(() => (auth ? firebaseSignOut(auth) : Promise.resolve()), [])

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, configMissing: !firebaseReady }),
    [user, loading, signIn, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
