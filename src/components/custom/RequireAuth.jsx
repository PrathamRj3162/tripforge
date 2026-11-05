import { Outlet } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import ConfigMissing from './ConfigMissing'

// Wraps the pages that need a login. After signing in, the page appears in place (no redirect dance).
function RequireAuth() {
  const { user, loading, signIn, configMissing } = useAuth()

  if (configMissing) return <ConfigMissing />
  if (loading) return <p className='mt-20 text-center text-gray-500'>Loading...</p>
  if (!user) {
    return (
      <div className='mx-auto mt-20 max-w-md px-5 text-center'>
        <h2 className='text-2xl font-bold'>Sign in to continue</h2>
        <p className='mt-3 text-gray-500'>Your trips are private and are saved to your Google account.</p>
        <Button onClick={signIn} className='mt-6 flex w-full items-center gap-3'>
          <FcGoogle className='h-6 w-6' />
          Sign In With Google
        </Button>
      </div>
    )
  }
  return <Outlet />
}

export default RequireAuth
