import { Link } from 'react-router-dom'

function Footer() {
  return (
    <div className='mt-16 mb-8 border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-3'>
      <div className='flex items-center gap-2'>
        <img src='/logo.svg' alt='TripForge' className='h-7' />
      </div>
      <div className='text-center sm:text-right'>
        <p className='text-sm text-gray-500'>Built by <strong>Pratham Raj</strong></p>
        <p className='text-xs text-gray-400 mt-0.5'>
          AI-generated itineraries. Verify hours, prices and availability before you travel.
        </p>
      </div>
    </div>
  )
}

export default Footer
