import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { toast } from 'sonner'
import { auth, firebaseReady, googleProvider } from '@/lib/firebase'

const AuthContext = createContext(null)

// Firebase Auth is the single source of truth for "who is logged in".
// Our code stores nothing about the user in the browser itself; Firebase manages the session.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(firebaseReady)

  useEffect(() => {
    if (!auth) return undefined
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
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') return
      console.error(err)
      toast('Sign-in failed. Check that Google sign-in is enabled in Firebase and that this domain is authorized.')
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
