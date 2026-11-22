import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FiMenu, FiX, FiLogOut, FiMap, FiPlus } from 'react-icons/fi'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/context/AuthContext'

function Header() {
  const { user, loading, signIn, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const link = (to, label) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`text-sm font-medium transition-colors ${pathname === to ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
    >
      {label}
    </Link>
  )

  return (
    <header className='sticky top-0 z-50 bg-white border-b border-gray-100'>
      <div className='mx-auto max-w-6xl px-5 md:px-10 h-15 flex items-center justify-between gap-4 py-3'>
        <Link to='/' className='shrink-0'>
          <img src='/logo.svg' alt='TripForge' className='h-8 w-auto' />
        </Link>

        {/* Desktop nav */}
        <nav className='hidden md:flex items-center gap-7'>
          {link('/', 'Home')}
          {user && link('/create-trip', 'Plan a trip')}
          {user && link('/my-trips', 'My trips')}
        </nav>

        {/* Desktop right */}
        <div className='hidden md:flex items-center gap-3'>
          {loading ? (
            <div className='h-8 w-8 rounded-full bg-gray-100 animate-pulse' />
          ) : user ? (
            <div className='flex items-center gap-2'>
              <Link
                to='/create-trip'
                className='inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 rounded-lg px-3.5 py-2 hover:border-gray-300 transition-all'
              >
                <FiPlus className='h-4 w-4' /> New trip
              </Link>
              <Popover>
                <PopoverTrigger className='flex items-center gap-2 rounded-lg border border-gray-200 hover:border-gray-300 pl-1.5 pr-3 py-1.5 transition-all'>
                  {user.photoURL
                    ? <img src={user.photoURL} referrerPolicy='no-referrer' alt='' className='h-6 w-6 rounded-full' />
                    : <span className='h-6 w-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center'>{(user.displayName||'U')[0]}</span>
                  }
                  <span className='text-sm font-medium text-gray-700 max-w-[100px] truncate'>{user.displayName?.split(' ')[0]}</span>
                </PopoverTrigger>
                <PopoverContent className='w-52 p-0 shadow-xl rounded-xl border-0 overflow-hidden' align='end'>
                  <div className='px-4 py-3 border-b border-gray-100 bg-gray-50'>
                    <p className='text-sm font-semibold text-gray-900 truncate'>{user.displayName}</p>
                    <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                  </div>
                  <div className='p-1.5'>
                    <Link to='/my-trips' className='flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
                      <FiMap className='h-4 w-4 text-gray-400' /> My trips
                    </Link>
                    <button onClick={signOut} className='w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 rounded-lg hover:bg-red-50 transition-colors'>
                      <FiLogOut className='h-4 w-4' /> Sign out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <button
              type='button'
              onClick={signIn}
              className='inline-flex items-center gap-2 text-sm font-semibold border border-gray-200 hover:border-gray-400 rounded-lg px-4 py-2 transition-all text-gray-700 hover:text-gray-900'
            >
              <FcGoogle className='h-4 w-4' /> Sign in
            </button>
          )}
        </div>

        {/* Mobile */}
        <button
          type='button'
          onClick={() => setOpen(!open)}
          className='md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100'
        >
          {open ? <FiX className='h-5 w-5' /> : <FiMenu className='h-5 w-5' />}
        </button>
      </div>

      {open && (
        <div className='md:hidden bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-4'>
          {link('/', 'Home')}
          {user && link('/create-trip', 'Plan a trip')}
          {user && link('/my-trips', 'My trips')}
          <div className='pt-3 border-t border-gray-100'>
            {loading ? null : user ? (
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  {user.photoURL
                    ? <img src={user.photoURL} referrerPolicy='no-referrer' alt='' className='h-7 w-7 rounded-full' />
                    : <span className='h-7 w-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center'>{(user.displayName||'U')[0]}</span>
                  }
                  <span className='text-sm font-medium text-gray-900'>{user.displayName}</span>
                </div>
                <button onClick={signOut} className='text-xs text-red-500 font-medium'>Sign out</button>
              </div>
            ) : (
              <button onClick={signIn} className='w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700'>
                <FcGoogle className='h-5 w-5' /> Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
