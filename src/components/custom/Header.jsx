import { Link } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/context/AuthContext'

function Header() {
  const { user, loading, signIn, signOut } = useAuth()

  return (
    <header className='p-3 shadow-sm flex justify-between items-center px-5'>
      <Link to='/'>
        <img src='/logo.svg' alt='TripForge' />
      </Link>

      <div>
        {loading ? null : user ? (
          <div className='flex flex-wrap items-center justify-end gap-2 sm:gap-3'>
            <Button asChild variant='outline' className='rounded-full'>
              <Link to='/create-trip'>+ Create Trip</Link>
            </Button>
            <Button asChild variant='outline' className='rounded-full'>
              <Link to='/my-trips'>My Trips</Link>
            </Button>
            <Popover>
              <PopoverTrigger aria-label='Account menu'>
                {user.photoURL ? (
                  <img src={user.photoURL} alt='' referrerPolicy='no-referrer' className='h-[35px] w-[35px] rounded-full' />
                ) : (
                  <span className='flex h-[35px] w-[35px] items-center justify-center rounded-full bg-gray-200 text-sm font-medium'>
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent className='w-56'>
                <p className='truncate text-sm font-medium'>{user.displayName}</p>
                <p className='truncate text-xs text-gray-500'>{user.email}</p>
                <button type='button' className='mt-3 text-sm text-red-600' onClick={signOut}>Logout</button>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button onClick={signIn} className='flex gap-2 items-center'>
            <FcGoogle className='h-5 w-5' />
            Sign In
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header
