import PlacePhoto from '@/components/custom/PlacePhoto'

function HotelCardItem({ hotel, destination }) {
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query='
    + encodeURIComponent(`${hotel.hotelName}, ${hotel.hotelAddress}`)

  return (
    <a href={mapsUrl} target='_blank' rel='noopener noreferrer'>
      <div className='hover:scale-110 transition-all cursor-pointer mt-5 mb-8'>
        <PlacePhoto query={`${hotel.hotelName}, ${destination}`} alt={hotel.hotelName} className='rounded-xl h-[180px] w-full' />
        <div className='my-2'>
          <h2 className='font-medium'>{hotel.hotelName}</h2>
          <h2 className='text-xs text-gray-500'>📍 {hotel.hotelAddress}</h2>
          <h2 className='text-sm'>💰 {hotel.price}</h2>
          <h2 className='text-sm'>⭐ {hotel.rating}</h2>
        </div>
      </div>
    </a>
  )
}

export default HotelCardItem
