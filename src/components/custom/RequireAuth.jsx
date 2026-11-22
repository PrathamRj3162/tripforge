import { Outlet } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FiLock, FiDatabase } from 'react-icons/fi'
import { useAuth } from '@/context/AuthContext'
import ConfigMissing from './ConfigMissing'

export default function RequireAuth() {
  const { user, loading, signIn, configMissing } = useAuth()
  if (configMissing) return <ConfigMissing />
  if (loading) return (
    <div className='min-h-[70vh] flex items-center justify-center'>
      <div className='h-9 w-9 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin' />
    </div>
  )
  if (!user) return (
    <div className='relative min-h-[88vh] flex items-center justify-center'>
      <img src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80&auto=format&fit=crop' alt='' className='absolute inset-0 h-full w-full object-cover' />
      <div className='absolute inset-0 bg-black/60' />
      <div className='relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-8'>
        <img src='/logo.svg' alt='TripForge' className='h-9 mb-6' />
        <h2 className='text-xl font-bold text-gray-900 mb-1'>Sign in to continue</h2>
        <p className='text-sm text-gray-500 mb-7'>Your plans are private — sign in with Google to access them.</p>
        <button type='button' onClick={signIn} className='w-full flex items-center justify-center gap-3 border-2 border-gray-100 hover:border-gray-200 bg-white rounded-xl py-3.5 text-sm font-bold text-gray-800 transition-all hover:bg-gray-50'>
          <FcGoogle className='h-5 w-5' /> Continue with Google
        </button>
        <ul className='mt-6 space-y-2.5'>
          {[
            [<FiLock className='h-3.5 w-3.5' />, 'Only you can access your trips'],
            [<FiDatabase className='h-3.5 w-3.5' />, 'Saved permanently to your account'],
          ].map(([icon, text], i) => (
            <li key={i} className='flex items-center gap-2.5 text-xs text-gray-500'>
              <span className='text-gray-400'>{icon}</span> {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
  return <Outlet />
}
