import { Link } from 'react-router-dom'
export default function Footer() {
  return (
    <footer className='mt-16 border-t border-gray-100 py-8 flex flex-col sm:flex-row items-center justify-between gap-3'>
      <img src='/logo.svg' alt='TripForge' className='h-7' />
      <div className='text-right text-sm text-gray-400'>
        <p>Built by <span className='font-semibold text-gray-700'>Pratham Raj</span></p>
        <p className='text-xs mt-0.5 text-gray-300'>AI-generated — verify details before you travel</p>
      </div>
    </footer>
  )
}
