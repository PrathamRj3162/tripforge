import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
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

    // Handle the redirect result when the user comes back from Google
    getRedirectResult(auth).catch((err) => {
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request'
      ) {
        console.error(err)
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
      toast('Firebase is not configured yet. See the README.')
      return
    }
    try {
      await signInWithRedirect(auth, googleProvider)
    } catch (err) {
      console.error(err)
      toast('Sign-in failed. Please try again.')
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
