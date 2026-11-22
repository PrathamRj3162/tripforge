import HotelCardItem from './HotelCardItem'
export default function Hotels({ trip }) {
  if (!trip.plan?.hotels?.length) return null
  return (
    <div className='mb-12'>
      <div className='flex items-center gap-3 mb-5'>
        <h2 className='font-bold text-lg text-gray-900'>Hotels</h2>
        <span className='text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-1'>{trip.plan.hotels.length} options</span>
        <p className='text-xs text-gray-400 ml-1'>Click to open in Google Maps</p>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
        {trip.plan.hotels.map((hotel, i) => <HotelCardItem hotel={hotel} destination={trip.destination} key={i} />)}
      </div>
    </div>
  )
}
