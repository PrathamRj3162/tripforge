import PlacePhoto from '@/components/custom/PlacePhoto'
import { BUDGET_OPTIONS, optionTitle, travelerText } from '@/constants/options'

function InfoSection({ trip }) {
  const chip = 'p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md'
  return (
    <div>
      <PlacePhoto query={trip.destination} alt={trip.destination} className='h-[340px] w-full rounded-xl' />

      <div className='my-5 flex flex-col gap-2'>
        <h2 className='font-bold text-2xl'>{trip.destination}</h2>
        <div className='flex flex-wrap gap-3'>
          <h2 className={chip}>📅 {trip.days} {trip.days === 1 ? 'Day' : 'Days'}</h2>
          <h2 className={chip}>💰 {optionTitle(BUDGET_OPTIONS, trip.budget)} Budget</h2>
          <h2 className={chip}>🥂 {travelerText(trip.travelers)}</h2>
        </div>
        {trip.plan?.summary && <p className='mt-2 text-gray-600'>{trip.plan.summary}</p>}
      </div>
    </div>
  )
}

export default InfoSection
