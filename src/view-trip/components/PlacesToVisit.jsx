import PlaceCardItem from './PlaceCardItem'

function PlacesToVisit({ trip }) {
  if (!trip.plan?.itinerary?.length) return null

  return (
    <div className='my-12'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='font-bold text-xl text-gray-900'>Day-by-Day Itinerary</h2>
          <p className='text-sm text-gray-500 mt-0.5'>Click any place to open it in Google Maps.</p>
        </div>
        <span className='text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-1'>
          {trip.plan.itinerary.length} days
        </span>
      </div>

      <div className='flex flex-col gap-10'>
        {trip.plan.itinerary.map((item) => (
          <div key={item.day}>
            {/* Day header */}
            <div className='flex items-center gap-3 mb-5'>
              <span className='flex items-center justify-center h-9 w-9 rounded-full bg-[#f56551] text-white text-sm font-bold shrink-0 shadow-sm'>
                {item.day}
              </span>
              <div>
                <p className='text-xs font-semibold text-[#f56551] uppercase tracking-wider'>Day {item.day}</p>
                {item.theme && (
                  <h3 className='font-semibold text-gray-900 text-base leading-tight'>{item.theme}</h3>
                )}
              </div>
              <div className='flex-1 h-px bg-gray-100 ml-2' />
            </div>

            {/* Places grid */}
            <div className='grid md:grid-cols-2 gap-3 pl-12'>
              {item.plan?.map((place, index) => (
                <div key={index}>
                  {place.bestTime && (
                    <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5'>
                      {place.bestTime}
                    </p>
                  )}
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

export default PlacesToVisit
