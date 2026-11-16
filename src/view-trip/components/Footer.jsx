import { Link } from 'react-router-dom'
import { FiGithub, FiLinkedin } from 'react-icons/fi'

function Footer() {
  return (
    <footer className='mt-16 border-t border-gray-100 pt-10 pb-10'>
      <div className='flex flex-col md:flex-row items-center md:items-start justify-between gap-8'>
        {/* Brand */}
        <div className='flex flex-col items-center md:items-start gap-3 text-center md:text-left'>
          <img src='/logo.svg' alt='TripForge' className='h-8' />
          <p className='text-sm text-gray-500 max-w-xs leading-relaxed'>
            AI-powered travel planning. Build your perfect itinerary in seconds.
          </p>
          <p className='text-xs text-gray-400'>
            ⚠️ AI-generated itineraries. Verify hours, prices and availability before you travel.
          </p>
        </div>

        {/* Links */}
        <div className='flex flex-col items-center md:items-end gap-3'>
          <div className='flex items-center gap-4'>
            <a
              href='https://github.com/PrathamRj3162/tripforge'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors'
            >
              <FiGithub className='h-4 w-4' />
              GitHub
            </a>
          </div>
          <p className='text-xs text-gray-400'>
            Built by{' '}
            <strong className='text-gray-600'>Pratham Raj</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
