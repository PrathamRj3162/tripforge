import { Outlet } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FiLock, FiShield, FiUser } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import ConfigMissing from './ConfigMissing'

const TRUST_POINTS = [
  { icon: <FiLock className='h-4 w-4 text-[#f56551]' />, text: 'Trips are private — only you can access them' },
  { icon: <FiShield className='h-4 w-4 text-[#f56551]' />, text: 'Secured by Firebase + Google OAuth' },
  { icon: <FiUser className='h-4 w-4 text-[#f56551]' />, text: 'No passwords — just your Google account' },
]

function RequireAuth() {
  const { user, loading, signIn, configMissing } = useAuth()

  if (configMissing) return <ConfigMissing />

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-10 w-10 rounded-full border-4 border-[#f56551]/30 border-t-[#f56551] animate-spin' />
          <p className='text-sm text-gray-500'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='min-h-[80vh] flex items-center justify-center px-4 py-16'
        style={{ background: 'linear-gradient(135deg, #fff5f3 0%, #fff 50%, #f0f4ff 100%)' }}
      >
        <div className='w-full max-w-sm'>
          {/* Card */}
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
            {/* Logo + heading */}
            <div className='flex flex-col items-center text-center mb-8'>
              <img src='/logo.svg' alt='TripForge' className='h-10 mb-5' />
              <h2 className='text-2xl font-bold text-gray-900 leading-tight'>Sign in to continue</h2>
              <p className='text-sm text-gray-500 mt-2'>
                Your AI-planned trips are saved securely to your account.
              </p>
            </div>

            {/* Google button */}
            <button
              type='button'
              onClick={signIn}
              className='w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all'
            >
              <FcGoogle className='h-5 w-5 shrink-0' />
              Continue with Google
            </button>

            {/* Trust signals */}
            <ul className='mt-7 flex flex-col gap-3'>
              {TRUST_POINTS.map((p, i) => (
                <li key={i} className='flex items-center gap-3 text-sm text-gray-600'>
                  {p.icon}
                  {p.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Below-card note */}
          <p className='mt-5 text-center text-xs text-gray-400'>
            By signing in you agree to use TripForge responsibly.
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default RequireAuth
