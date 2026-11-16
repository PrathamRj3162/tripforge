import { Link } from 'react-router-dom'
import { FiTrash2, FiArrowRight } from 'react-icons/fi'
import PlacePhoto from '@/components/custom/PlacePhoto'
import { BUDGET_OPTIONS, TRAVELER_OPTIONS, optionTitle } from '@/constants/options'

function UserTripCardItem({ trip, onDelete }) {
  const travelerOpt = TRAVELER_OPTIONS.find((t) => t.id === trip.travelers)

  return (
    <div className='group relative rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200'>
      {/* Photo */}
      <Link to={`/view-trip/${trip.id}`} className='block relative overflow-hidden'>
        <PlacePhoto
          query={trip.destination}
          alt={trip.destination}
          className='h-[200px] w-full transition-transform duration-300 group-hover:scale-105'
        />
        {/* Gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />
        {/* Destination on photo */}
        <div className='absolute bottom-3 left-3 right-10'>
          <h2 className='font-bold text-white text-base leading-tight drop-shadow-sm truncate'>
            {trip.destination}
          </h2>
        </div>
        {/* Arrow on hover */}
        <span className='absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity'>
          <FiArrowRight className='h-3.5 w-3.5 text-white' />
        </span>
      </Link>

      {/* Chips */}
      <div className='px-3 py-2.5 flex items-center gap-1.5 flex-wrap'>
        <span className='inline-flex items-center rounded-full bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5'>
          {trip.days}d
        </span>
        <span className='inline-flex items-center rounded-full bg-green-50 text-green-600 text-xs font-medium px-2 py-0.5'>
          {optionTitle(BUDGET_OPTIONS, trip.budget)}
        </span>
        <span className='inline-flex items-center rounded-full bg-purple-50 text-purple-600 text-xs font-medium px-2 py-0.5'>
          {travelerOpt ? travelerOpt.title : trip.travelers}
        </span>
      </div>

      {/* Delete button */}
      <button
        type='button'
        onClick={onDelete}
        aria-label={`Delete trip to ${trip.destination}`}
        className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm text-red-400 hover:text-red-600 hover:bg-red-50 border border-gray-100'
      >
        <FiTrash2 className='h-3.5 w-3.5' />
      </button>
    </div>
  )
}

export default UserTripCardItem
