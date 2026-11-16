import PlacePhoto from '@/components/custom/PlacePhoto'
import { FiMapPin, FiStar } from 'react-icons/fi'

function HotelCardItem({ hotel, destination }) {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(`${hotel.hotelName}, ${hotel.hotelAddress}`)

  return (
    <a href={mapsUrl} target='_blank' rel='noopener noreferrer' className='block group'>
      <div className='rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200'>
        {/* Photo */}
        <div className='overflow-hidden relative'>
          <PlacePhoto
            query={`${hotel.hotelName}, ${destination}`}
            alt={hotel.hotelName}
            className='h-[160px] w-full transition-transform duration-300 group-hover:scale-105'
          />
          {/* Rating badge */}
          {hotel.rating && (
            <span className='absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-xs font-semibold text-amber-500 shadow-sm'>
              <FiStar className='h-3 w-3 fill-amber-400 stroke-amber-400' />
              {hotel.rating}
            </span>
          )}
        </div>

        {/* Info */}
        <div className='p-3.5'>
          <h3 className='font-semibold text-sm text-gray-900 leading-snug group-hover:text-[#f56551] transition-colors line-clamp-1'>
            {hotel.hotelName}
          </h3>
          <p className='flex items-center gap-1 text-xs text-gray-400 mt-1 truncate'>
            <FiMapPin className='h-3 w-3 shrink-0' />
            {hotel.hotelAddress}
          </p>
          <div className='flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50'>
            <span className='text-sm font-semibold text-gray-800'>{hotel.price}</span>
            <span className='text-xs text-[#f56551] font-medium'>View on Maps →</span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default HotelCardItem
