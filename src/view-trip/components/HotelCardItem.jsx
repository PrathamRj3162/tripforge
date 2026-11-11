import PlacePhoto from '@/components/custom/PlacePhoto'

function HotelCardItem({ hotel, destination }) {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(`${hotel.hotelName}, ${hotel.hotelAddress}`)

  return (
    <a href={mapsUrl} target='_blank' rel='noopener noreferrer' className='block group'>
      <div className='rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'>
        <PlacePhoto
          query={`${hotel.hotelName}, ${destination}`}
          alt={hotel.hotelName}
          className='h-[160px] w-full'
        />
        <div className='p-3'>
          <h3 className='font-semibold text-sm text-gray-900 leading-snug group-hover:text-[#f56551] transition-colors'>
            {hotel.hotelName}
          </h3>
          <p className='text-xs text-gray-400 mt-1 truncate'>📍 {hotel.hotelAddress}</p>
          <div className='flex items-center justify-between mt-2'>
            <span className='text-xs text-gray-600'>💰 {hotel.price}</span>
            <span className='text-xs font-medium text-amber-500'>⭐ {hotel.rating}</span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default HotelCardItem
