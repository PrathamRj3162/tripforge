import { FiCalendar, FiDollarSign, FiUsers, FiExternalLink } from 'react-icons/fi'
import PlacePhoto from '@/components/custom/PlacePhoto'
import { BUDGET_OPTIONS, optionTitle, travelerText } from '@/constants/options'

function InfoSection({ trip }) {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(trip.destination)

  return (
    <div className='mb-8'>
      <PlacePhoto
        query={trip.destination}
        alt={trip.destination}
        className='h-[380px] w-full rounded-2xl shadow-sm'
      />

      <div className='mt-6'>
        <div className='flex items-start justify-between gap-4 flex-wrap'>
          <h1 className='font-bold text-3xl text-gray-900'>{trip.destination}</h1>
          <a
            href={mapsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1.5 text-sm text-[#f56551] hover:underline shrink-0'
          >
            <FiExternalLink className='h-4 w-4' />
            View on Maps
          </a>
        </div>

        <div className='flex flex-wrap gap-3 mt-3'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm font-medium'>
            <FiCalendar className='h-3.5 w-3.5' />
            {trip.days} {trip.days === 1 ? 'Day' : 'Days'}
          </span>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 px-3 py-1 text-sm font-medium'>
            <FiDollarSign className='h-3.5 w-3.5' />
            {optionTitle(BUDGET_OPTIONS, trip.budget)} Budget
          </span>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 px-3 py-1 text-sm font-medium'>
            <FiUsers className='h-3.5 w-3.5' />
            {travelerText(trip.travelers)}
          </span>
        </div>

        {trip.plan?.summary && (
          <p className='mt-4 text-gray-600 leading-relaxed max-w-3xl'>{trip.plan.summary}</p>
        )}
      </div>
    </div>
  )
}

export default InfoSection
