import { FiCalendar, FiDollarSign, FiUsers, FiExternalLink, FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import PlacePhoto from '@/components/custom/PlacePhoto'
import { BUDGET_OPTIONS, optionTitle, travelerText } from '@/constants/options'

function InfoSection({ trip }) {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(trip.destination)

  return (
    <div className='mb-10'>
      {/* Back link */}
      <Link
        to='/my-trips'
        className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors'
      >
        <FiArrowLeft className='h-4 w-4' />
        My Trips
      </Link>

      {/* Hero image */}
      <div className='relative rounded-2xl overflow-hidden shadow-sm'>
        <PlacePhoto
          query={trip.destination}
          alt={trip.destination}
          className='h-[320px] md:h-[420px] w-full'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent' />
        <div className='absolute bottom-6 left-6 right-6'>
          <h1 className='font-extrabold text-3xl md:text-4xl text-white drop-shadow-md leading-tight mb-3'>
            {trip.destination}
          </h1>
          <div className='flex flex-wrap gap-2'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-3 py-1'>
              <FiCalendar className='h-3.5 w-3.5' />
              {trip.days} {trip.days === 1 ? 'Day' : 'Days'}
            </span>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-3 py-1'>
              <FiDollarSign className='h-3.5 w-3.5' />
              {optionTitle(BUDGET_OPTIONS, trip.budget)} Budget
            </span>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-3 py-1'>
              <FiUsers className='h-3.5 w-3.5' />
              {travelerText(trip.travelers)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary + map link */}
      {(trip.plan?.summary || true) && (
        <div className='mt-6 flex items-start justify-between gap-4 flex-wrap'>
          {trip.plan?.summary && (
            <p className='text-gray-600 leading-relaxed max-w-3xl text-sm md:text-base'>
              {trip.plan.summary}
            </p>
          )}
          <a
            href={mapsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:border-[#f56551] hover:text-[#f56551] transition-colors shadow-sm'
          >
            <FiExternalLink className='h-4 w-4' />
            View on Maps
          </a>
        </div>
      )}
    </div>
  )
}

export default InfoSection
