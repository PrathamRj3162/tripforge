import { Link } from 'react-router-dom'
import { FiTrash2 } from 'react-icons/fi'
import PlacePhoto from '@/components/custom/PlacePhoto'
import { BUDGET_OPTIONS, TRAVELER_OPTIONS, optionTitle } from '@/constants/options'

export default function UserTripCardItem({ trip, onDelete }) {
  const trav = TRAVELER_OPTIONS.find((t) => t.id === trip.travelers)
  return (
    <div className='group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all hover:shadow-md'>
      <Link to={`/view-trip/${trip.id}`} className='block'>
        <div className='relative overflow-hidden'>
          <PlacePhoto query={trip.destination} alt={trip.destination} className='h-48 w-full transition-transform duration-500 group-hover:scale-105' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
          <p className='absolute bottom-3 left-3 font-bold text-white text-sm drop-shadow truncate pr-8'>{trip.destination}</p>
        </div>
        <div className='p-3 flex flex-wrap gap-1.5'>
          <span className='text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5'>{trip.days}d</span>
          <span className='text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5'>{optionTitle(BUDGET_OPTIONS, trip.budget)}</span>
          <span className='text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5'>{trav?.title ?? trip.travelers}</span>
        </div>
      </Link>
      <button
        type='button'
        onClick={onDelete}
        className='absolute top-2.5 right-2.5 h-7 w-7 flex items-center justify-center rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-white shadow-sm'
      >
        <FiTrash2 className='h-3.5 w-3.5' />
      </button>
    </div>
  )
}
