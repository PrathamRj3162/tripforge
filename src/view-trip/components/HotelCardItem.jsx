import { FiMapPin, FiStar } from 'react-icons/fi'
import PlacePhoto from '@/components/custom/PlacePhoto'

export default function HotelCardItem({ hotel, destination }) {
  const url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${hotel.hotelName}, ${hotel.hotelAddress}`)
  return (
    <a href={url} target='_blank' rel='noopener noreferrer' className='group block rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden bg-white hover:shadow-md transition-all'>
      <div className='overflow-hidden relative'>
        <PlacePhoto query={`${hotel.hotelName}, ${destination}`} alt={hotel.hotelName} className='h-40 w-full transition-transform duration-500 group-hover:scale-105' />
        {hotel.rating && (
          <span className='absolute top-2.5 right-2.5 inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-gray-700 shadow-sm'>
            <FiStar className='h-3 w-3 text-amber-400 fill-amber-400' /> {hotel.rating}
          </span>
        )}
      </div>
      <div className='p-3.5'>
        <p className='font-semibold text-sm text-gray-900 group-hover:text-[#f56551] transition-colors line-clamp-1'>{hotel.hotelName}</p>
        <p className='flex items-center gap-1 text-xs text-gray-400 mt-1 truncate'>
          <FiMapPin className='h-3 w-3 shrink-0' /> {hotel.hotelAddress}
        </p>
        <div className='flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50'>
          <span className='text-sm font-bold text-gray-900'>{hotel.price}</span>
          <span className='text-xs text-[#f56551] font-semibold'>View on Maps →</span>
        </div>
      </div>
    </a>
  )
}
