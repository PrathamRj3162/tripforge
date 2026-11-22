import { FiMapPin, FiClock } from 'react-icons/fi'
import PlacePhoto from '@/components/custom/PlacePhoto'

export default function PlaceCardItem({ place, destination }) {
  const url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${place.placeName}, ${destination}`)
  return (
    <a href={url} target='_blank' rel='noopener noreferrer' className='group flex gap-3.5 rounded-xl border border-gray-100 bg-white p-3 hover:border-gray-200 hover:shadow-sm transition-all'>
      <div className='shrink-0 w-24 h-24 rounded-xl overflow-hidden'>
        <PlacePhoto query={`${place.placeName}, ${destination}`} alt={place.placeName} className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105' />
      </div>
      <div className='min-w-0 flex flex-col justify-between py-0.5'>
        <div>
          <p className='font-semibold text-sm text-gray-900 group-hover:text-[#f56551] transition-colors leading-snug'>{place.placeName}</p>
          <p className='text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed'>{place.placeDetails}</p>
        </div>
        <div className='flex items-center flex-wrap gap-x-3 gap-y-1 mt-2'>
          {place.ticketPricing && <span className='text-xs text-gray-500 bg-gray-50 rounded-full px-2 py-0.5'>🎟 {place.ticketPricing}</span>}
          {place.travelTime && <span className='inline-flex items-center gap-1 text-xs text-gray-400'><FiClock className='h-3 w-3' />{place.travelTime}</span>}
          <span className='inline-flex items-center gap-1 text-xs text-[#f56551] font-semibold'><FiMapPin className='h-3 w-3' />Maps</span>
        </div>
      </div>
    </a>
  )
}
