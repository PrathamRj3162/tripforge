import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FiMenu, FiX, FiPlusCircle, FiMapPin, FiLogOut, FiChevronDown } from 'react-icons/fi'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/context/AuthContext'

function Header() {
  const { user, loading, signIn, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  const isHome = pathname === '/'

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`text-sm font-medium transition-colors ${
        pathname === to
          ? 'text-[#f56551]'
          : isHome
          ? 'text-gray-700 hover:text-gray-900'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className='sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm'>
      <div className='mx-auto max-w-7xl px-5 md:px-10'>
        <div className='flex h-16 items-center justify-between gap-6'>

          {/* Logo */}
          <Link to='/' className='flex items-center gap-2 shrink-0'>
            <img src='/logo.svg' alt='TripForge' className='h-9 w-auto' />
          </Link>

          {/* Desktop nav */}
          <nav className='hidden md:flex items-center gap-6'>
            {navLink('/', 'Home')}
            {user && navLink('/create-trip', 'Plan a Trip')}
            {user && navLink('/my-trips', 'My Trips')}
          </nav>

          {/* Desktop right */}
          <div className='hidden md:flex items-center gap-3'>
            {loading ? (
              <div className='h-9 w-9 rounded-full bg-gray-100 animate-pulse' />
            ) : user ? (
              <div className='flex items-center gap-3'>
                <Link
                  to='/create-trip'
                  className='inline-flex items-center gap-1.5 rounded-xl bg-[#f56551] hover:bg-[#e0533f] text-white text-sm font-semibold px-4 py-2 transition-all'
                >
                  <FiPlusCircle className='h-4 w-4' />
                  New Trip
                </Link>
                <Popover>
                  <PopoverTrigger className='flex items-center gap-1.5 rounded-xl border border-gray-200 hover:border-gray-300 px-2 py-1.5 transition-colors hover:bg-gray-50'>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=''
                        referrerPolicy='no-referrer'
                        className='h-7 w-7 rounded-full'
                      />
                    ) : (
                      <span className='flex h-7 w-7 items-center justify-center rounded-full bg-[#f56551] text-xs font-bold text-white'>
                        {(user.displayName || user.email || '?')[0].toUpperCase()}
                      </span>
                    )}
                    <FiChevronDown className='h-3.5 w-3.5 text-gray-400' />
                  </PopoverTrigger>
                  <PopoverContent className='w-56 p-0 shadow-xl rounded-2xl overflow-hidden border-0' align='end'>
                    <div className='bg-gradient-to-br from-[#f56551]/10 to-orange-50 px-4 py-3.5'>
                      <p className='text-sm font-bold text-gray-900 truncate'>{user.displayName || 'User'}</p>
                      <p className='text-xs text-gray-500 truncate mt-0.5'>{user.email}</p>
                    </div>
                    <div className='p-2 bg-white'>
                      <Link
                        to='/my-trips'
                        className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors'
                      >
                        <FiMapPin className='h-4 w-4 text-gray-400' />
                        My Trips
                      </Link>
                      <button
                        type='button'
                        onClick={signOut}
                        className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 rounded-xl hover:bg-red-50 transition-colors'
                      >
                        <FiLogOut className='h-4 w-4' />
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <button
                type='button'
                onClick={signIn}
                className='inline-flex items-center gap-2 rounded-xl border border-gray-200 hover:border-[#f56551]/40 bg-white hover:bg-[#fff5f3] text-gray-700 hover:text-[#f56551] text-sm font-semibold px-4 py-2 transition-all'
              >
                <FcGoogle className='h-4 w-4' />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type='button'
            className='md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors'
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label='Toggle menu'
          >
            {mobileOpen ? <FiX className='h-5 w-5' /> : <FiMenu className='h-5 w-5' />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className='md:hidden border-t border-gray-100 bg-white px-5 py-5 flex flex-col gap-4'>
          {navLink('/', 'Home')}
          {user && navLink('/create-trip', 'Plan a Trip')}
          {user && navLink('/my-trips', 'My Trips')}
          <div className='pt-3 border-t border-gray-100'>
            {loading ? null : user ? (
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt='' referrerPolicy='no-referrer' className='h-8 w-8 rounded-full' />
                  ) : (
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-[#f56551] text-sm font-bold text-white'>
                      {(user.displayName || '?')[0].toUpperCase()}
                    </span>
                  )}
                  <span className='text-sm font-medium text-gray-900 truncate max-w-[150px]'>
                    {user.displayName}
                  </span>
                </div>
                <button type='button' onClick={signOut} className='text-xs font-medium text-red-500 hover:underline'>
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type='button'
                onClick={signIn}
                className='w-full flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all'
              >
                <FcGoogle className='h-5 w-5' />
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
