import { Link } from 'react-router-dom'
import { FiTrash2 } from 'react-icons/fi'
import PlacePhoto from '@/components/custom/PlacePhoto'
import { BUDGET_OPTIONS, TRAVELER_OPTIONS, optionTitle } from '@/constants/options'

function UserTripCardItem({ trip, onDelete }) {
  const travelerOpt = TRAVELER_OPTIONS.find((t) => t.id === trip.travelers)

  return (
    <div className='group relative rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200'>
      <Link to={`/view-trip/${trip.id}`} className='block'>
        <PlacePhoto query={trip.destination} alt={trip.destination} className='h-[200px] w-full' />
        <div className='p-3'>
          <h2 className='font-bold text-base text-gray-900 leading-snug'>{trip.destination}</h2>
          <p className='text-xs text-gray-500 mt-1'>
            {trip.days} day{trip.days !== 1 ? 's' : ''} · {optionTitle(BUDGET_OPTIONS, trip.budget)} ·{' '}
            {travelerOpt ? travelerOpt.title : trip.travelers}
          </p>
        </div>
      </Link>
      <button
        type='button'
        onClick={onDelete}
        aria-label={`Delete trip to ${trip.destination}`}
        className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-red-50 text-red-500 rounded-full p-1.5 shadow'
      >
        <FiTrash2 className='h-4 w-4' />
      </button>
    </div>
  )
}

export default UserTripCardItem
