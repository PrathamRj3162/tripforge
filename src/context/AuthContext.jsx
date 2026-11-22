import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { toast } from 'sonner'
import { auth, firebaseReady, googleProvider } from '@/lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(firebaseReady)

  useEffect(() => {
    if (!auth) { setLoading(false); return }
    return onAuthStateChanged(auth, (next) => {
      setUser(next)
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(async () => {
    if (!auth) { toast('Firebase not configured.'); return }
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const silent = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']
      if (silent.includes(err?.code)) return
      console.error('[signIn]', err?.code, err?.message)
      toast(err?.message ?? 'Sign-in failed — please try again.')
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
