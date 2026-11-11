import { Link } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/context/AuthContext'

function Header() {
  const { user, loading, signIn, signOut } = useAuth()

  return (
    <header className='sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-5 py-3 flex justify-between items-center'>
      <Link to='/' className='flex items-center gap-2 shrink-0'>
        <img src='/logo.svg' alt='TripForge' className='h-9' />
      </Link>

      <div>
        {loading ? null : user ? (
          <div className='flex flex-wrap items-center justify-end gap-2 sm:gap-3'>
            <Button asChild variant='ghost' size='sm' className='rounded-full hidden sm:inline-flex'>
              <Link to='/create-trip'>+ New Trip</Link>
            </Button>
            <Button asChild variant='outline' size='sm' className='rounded-full'>
              <Link to='/my-trips'>My Trips</Link>
            </Button>
            <Popover>
              <PopoverTrigger aria-label='Account menu'>
                {user.photoURL ? (
                  <img src={user.photoURL} alt='' referrerPolicy='no-referrer' className='h-9 w-9 rounded-full ring-2 ring-[#f56551]/30' />
                ) : (
                  <span className='flex h-9 w-9 items-center justify-center rounded-full bg-[#f56551] text-sm font-bold text-white'>
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent className='w-56 p-3'>
                <p className='truncate text-sm font-semibold'>{user.displayName}</p>
                <p className='truncate text-xs text-gray-500 mt-0.5'>{user.email}</p>
                <div className='mt-3 border-t pt-3'>
                  <button type='button' className='text-sm text-red-600 hover:underline' onClick={signOut}>
                    Sign out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button onClick={signIn} className='flex gap-2 items-center'>
            <FcGoogle className='h-5 w-5' />
            Sign In with Google
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header
