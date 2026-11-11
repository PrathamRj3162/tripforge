import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function NotFound() {
  return (
    <div className='mx-auto mt-32 max-w-md px-5 text-center'>
      <p className='text-7xl font-black text-gray-100 select-none'>404</p>
      <h2 className='text-2xl font-bold text-gray-900 -mt-4'>Page not found</h2>
      <p className='mt-3 text-gray-500 text-sm'>The page you are looking for does not exist or may have been moved.</p>
      <Button asChild className='mt-6'>
        <Link to='/'>Back to Home</Link>
      </Button>
    </div>
  )
}

export default NotFound
