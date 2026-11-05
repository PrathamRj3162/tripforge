import { Link } from 'react-router-dom'
import PlacePhoto from '@/components/custom/PlacePhoto'
import { BUDGET_OPTIONS, optionTitle } from '@/constants/options'

function UserTripCardItem({ trip, onDelete }) {
  return (
    <div className='hover:scale-105 transition-all'>
      <Link to={`/view-trip/${trip.id}`}>
        <PlacePhoto query={trip.destination} alt={trip.destination} className='rounded-xl h-[220px] w-full' />
        <h2 className='font-bold text-lg'>{trip.destination}</h2>
        <h2 className='text-sm text-gray-500'>
          {trip.days} Day trip with {optionTitle(BUDGET_OPTIONS, trip.budget)} Budget
        </h2>
      </Link>
      <button type='button' onClick={onDelete} className='mt-1 text-xs text-red-600 hover:underline'>
        Delete
      </button>
    </div>
  )
}

export default UserTripCardItem
