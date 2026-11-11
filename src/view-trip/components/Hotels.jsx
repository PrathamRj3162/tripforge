import HotelCardItem from './HotelCardItem'

function Hotels({ trip }) {
  if (!trip.plan?.hotels?.length) return null

  return (
    <div className='my-10'>
      <h2 className='font-bold text-xl text-gray-900 mb-1'>🏨 Hotel Recommendations</h2>
      <p className='text-sm text-gray-500 mb-5'>Click any hotel to open it in Google Maps.</p>
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
        {trip.plan.hotels.map((hotel, index) => (
          <HotelCardItem hotel={hotel} destination={trip.destination} key={index} />
        ))}
      </div>
    </div>
  )
}

export default Hotels
