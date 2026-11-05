import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Header from './Header'

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Toaster />
    </>
  )
}

export default Layout
