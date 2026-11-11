import PlaceCardItem from './PlaceCardItem'

function PlacesToVisit({ trip }) {
  if (!trip.plan?.itinerary?.length) return null

  return (
    <div className='my-10'>
      <h2 className='font-bold text-xl text-gray-900 mb-1'>📅 Day-by-Day Itinerary</h2>
      <p className='text-sm text-gray-500 mb-6'>Click any place to open it in Google Maps.</p>

      <div className='flex flex-col gap-10'>
        {trip.plan.itinerary.map((item) => (
          <div key={item.day}>
            <div className='flex items-center gap-3 mb-4'>
              <span className='flex items-center justify-center h-8 w-8 rounded-full bg-[#f56551] text-white text-sm font-bold shrink-0'>
                {item.day}
              </span>
              <div>
                <h3 className='font-semibold text-gray-900'>Day {item.day}</h3>
                {item.theme && <p className='text-sm text-gray-500'>{item.theme}</p>}
              </div>
            </div>
            <div className='grid md:grid-cols-2 gap-4 pl-11'>
              {item.plan?.map((place, index) => (
                <div key={index}>
                  <p className='text-xs font-semibold text-[#f56551] uppercase tracking-wide mb-1'>
                    {place.bestTime}
                  </p>
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
