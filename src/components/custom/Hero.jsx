import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FiMapPin, FiCalendar, FiShield } from 'react-icons/fi'

const FEATURES = [
  {
    icon: <FiMapPin className='h-6 w-6 text-[#f56551]' />,
    title: 'Smart Destination Search',
    desc: 'Powered by Google Places API — real autocomplete, real photos.',
  },
  {
    icon: <FiCalendar className='h-6 w-6 text-[#f56551]' />,
    title: 'Day-by-Day Itineraries',
    desc: 'Hotels, attractions and time slots crafted by Gemini AI for your budget.',
  },
  {
    icon: <FiShield className='h-6 w-6 text-[#f56551]' />,
    title: 'Secure & Private',
    desc: 'Firebase Auth + Firestore rules — only you can read your trips.',
  },
]

function Hero() {
  return (
    <div className='flex flex-col items-center'>
      {/* Hero text */}
      <div className='flex flex-col items-center gap-6 mx-5 md:mx-20 xl:mx-56 mt-16'>
        <span className='inline-flex items-center gap-2 rounded-full border border-[#f56551]/30 bg-[#f56551]/10 px-4 py-1.5 text-sm font-medium text-[#f56551]'>
          ✈️ AI-powered travel planning
        </span>
        <h1 className='font-extrabold text-4xl md:text-[52px] text-center leading-tight'>
          Forge Your Perfect Trip{' '}
          <span className='text-[#f56551]'>in Seconds</span>
        </h1>
        <p className='text-lg md:text-xl text-gray-500 text-center max-w-2xl'>
          Tell us where, how long, and your budget — TripForge generates a complete personalized itinerary with hotels, attractions and photos.
        </p>
        <div className='flex flex-col sm:flex-row gap-3 mt-2'>
          <Button asChild size='lg' className='px-8'>
            <Link to='/create-trip'>Plan My Trip →</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link to='/my-trips'>My Trips</Link>
          </Button>
        </div>
      </div>

      {/* Landing screenshot */}
      <div className='relative mt-12 w-full max-w-5xl px-5 md:px-10'>
        <div className='absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-full pointer-events-none' />
        <img
          src='/landing.png'
          alt='TripForge itinerary preview'
          className='w-full rounded-2xl shadow-2xl border border-gray-100'
        />
      </div>

      {/* Feature pills */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mx-5 md:mx-20 xl:mx-56 mt-16 mb-20'>
        {FEATURES.map((f) => (
          <div key={f.title} className='flex flex-col gap-3 p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-md transition-shadow'>
            <div className='flex items-center gap-3'>
              {f.icon}
              <h3 className='font-semibold text-gray-900'>{f.title}</h3>
            </div>
            <p className='text-sm text-gray-500'>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Hero
