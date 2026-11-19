import { Outlet } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FiLock, FiDatabase, FiEye } from 'react-icons/fi'
import { useAuth } from '@/context/AuthContext'
import ConfigMissing from './ConfigMissing'

const TRUST = [
  { icon: <FiLock className='h-4 w-4' />, text: 'Only you can see your trips — secured by Firebase' },
  { icon: <FiDatabase className='h-4 w-4' />, text: 'Trips saved permanently to your account' },
  { icon: <FiEye className='h-4 w-4' />, text: 'No passwords — sign in with your Google account' },
]

function RequireAuth() {
  const { user, loading, signIn, configMissing } = useAuth()

  if (configMissing) return <ConfigMissing />

  if (loading) {
    return (
      <div className='min-h-[70vh] flex items-center justify-center'>
        <div className='h-10 w-10 rounded-full border-4 border-[#f56551]/30 border-t-[#f56551] animate-spin' />
      </div>
    )
  }

  if (!user) {
    return (
      <div className='relative min-h-[88vh] flex items-center justify-center overflow-hidden'>
        {/* Background photo */}
        <img
          src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80&auto=format&fit=crop'
          alt='travel'
          className='absolute inset-0 h-full w-full object-cover object-center'
        />
        <div className='absolute inset-0 bg-black/55' />

        {/* Sign-in card */}
        <div className='relative z-10 w-full max-w-sm mx-4'>
          <div className='bg-white rounded-3xl shadow-2xl px-8 py-10'>
            <div className='text-center mb-8'>
              <img src='/logo.svg' alt='TripForge' className='h-10 mx-auto mb-5' />
              <h2 className='text-2xl font-extrabold text-gray-900'>Sign in to continue</h2>
              <p className='text-sm text-gray-500 mt-2 leading-relaxed'>
                Your AI travel plans are saved securely to your Google account.
              </p>
            </div>

            <button
              type='button'
              onClick={signIn}
              className='w-full flex items-center justify-center gap-3 rounded-xl border-2 border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm active:scale-[0.98] transition-all'
            >
              <FcGoogle className='h-5 w-5 shrink-0' />
              Continue with Google
            </button>

            <ul className='mt-7 flex flex-col gap-3'>
              {TRUST.map((p, i) => (
                <li key={i} className='flex items-center gap-3 text-xs text-gray-500'>
                  <span className='text-[#f56551] shrink-0'>{p.icon}</span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default RequireAuth
