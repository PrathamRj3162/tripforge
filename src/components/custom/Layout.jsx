import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Header from './Header'

function Layout() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}

export default Layout
