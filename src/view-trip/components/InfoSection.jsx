import { FiCalendar, FiDollarSign, FiUsers, FiExternalLink, FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import PlacePhoto from '@/components/custom/PlacePhoto'
import { BUDGET_OPTIONS, optionTitle, travelerText } from '@/constants/options'

export default function InfoSection({ trip }) {
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(trip.destination)
  return (
    <div className='mb-10'>
      <Link to='/my-trips' className='inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 mb-5 transition-colors'>
        <FiArrowLeft className='h-4 w-4' /> All trips
      </Link>
      <div className='relative rounded-2xl overflow-hidden'>
        <PlacePhoto query={trip.destination} alt={trip.destination} className='h-72 md:h-96 w-full' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
        <div className='absolute bottom-6 left-6 right-6'>
          <h1 className='font-black text-3xl md:text-4xl text-white mb-3 drop-shadow-lg'>{trip.destination}</h1>
          <div className='flex flex-wrap gap-2'>
            {[
              [<FiCalendar className='h-3.5 w-3.5'/>, `${trip.days} ${trip.days===1?'day':'days'}`],
              [<FiDollarSign className='h-3.5 w-3.5'/>, `${optionTitle(BUDGET_OPTIONS, trip.budget)} budget`],
              [<FiUsers className='h-3.5 w-3.5'/>, travelerText(trip.travelers)],
            ].map(([icon, text], i) => (
              <span key={i} className='inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold rounded-full px-3 py-1.5'>
                {icon}{text}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className='mt-5 flex items-start justify-between gap-4 flex-wrap'>
        {trip.plan?.summary && <p className='text-sm text-gray-500 leading-relaxed max-w-3xl'>{trip.plan.summary}</p>}
        <a href={mapsUrl} target='_blank' rel='noopener noreferrer' className='shrink-0 inline-flex items-center gap-1.5 text-sm font-medium border border-gray-200 rounded-lg px-3 py-2 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all'>
          <FiExternalLink className='h-4 w-4' /> Open in Maps
        </a>
      </div>
    </div>
  )
}
