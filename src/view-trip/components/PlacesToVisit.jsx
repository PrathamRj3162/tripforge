import PlaceCardItem from './PlaceCardItem'
export default function PlacesToVisit({ trip }) {
  if (!trip.plan?.itinerary?.length) return null
  return (
    <div className='mb-12'>
      <div className='flex items-center gap-3 mb-6'>
        <h2 className='font-bold text-lg text-gray-900'>Itinerary</h2>
        <span className='text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-1'>{trip.plan.itinerary.length} days</span>
      </div>
      <div className='flex flex-col gap-10'>
        {trip.plan.itinerary.map((item) => (
          <div key={item.day}>
            <div className='flex items-center gap-3 mb-4'>
              <span className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-bold shrink-0'>{item.day}</span>
              <div>
                <p className='text-[11px] font-bold uppercase tracking-widest text-gray-400'>Day {item.day}</p>
                {item.theme && <p className='font-semibold text-gray-900 text-sm leading-tight'>{item.theme}</p>}
              </div>
              <div className='flex-1 h-px bg-gray-100 ml-1' />
            </div>
            <div className='grid md:grid-cols-2 gap-3 pl-11'>
              {item.plan?.map((place, i) => (
                <div key={i}>
                  {place.bestTime && <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5'>{place.bestTime}</p>}
                  <PlaceCardItem place={place} destination={trip.destination} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
