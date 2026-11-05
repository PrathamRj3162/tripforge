import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className='mx-auto mt-20 max-w-md px-5 text-center'>
      <h2 className='text-2xl font-bold'>Page not found</h2>
      <Link to='/' className='mt-4 inline-block text-[#f56551] underline'>Back to the home page</Link>
    </div>
  )
}

export default NotFound
