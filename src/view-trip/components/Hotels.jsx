import HotelCardItem from './HotelCardItem'

function Hotels({ trip }) {
  if (!trip.plan?.hotels?.length) return null

  return (
    <div className='my-12'>
      <div className='flex items-center justify-between mb-5'>
        <div>
          <h2 className='font-bold text-xl text-gray-900'>Hotel Recommendations</h2>
          <p className='text-sm text-gray-500 mt-0.5'>Click any hotel to open it in Google Maps.</p>
        </div>
        <span className='text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-1'>
          {trip.plan.hotels.length} hotels
        </span>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
        {trip.plan.hotels.map((hotel, index) => (
          <HotelCardItem hotel={hotel} destination={trip.destination} key={index} />
        ))}
      </div>
    </div>
  )
}

export default Hotels
