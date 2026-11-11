import { FiMapPin } from 'react-icons/fi'
import PlacePhoto from '@/components/custom/PlacePhoto'

function PlaceCardItem({ place, destination }) {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(`${place.placeName}, ${destination}`)

  return (
    <a href={mapsUrl} target='_blank' rel='noopener noreferrer' className='block group'>
      <div className='flex gap-4 rounded-xl border border-gray-100 p-3 hover:shadow-md transition-shadow hover:border-gray-200'>
        <PlacePhoto
          query={`${place.placeName}, ${destination}`}
          alt={place.placeName}
          className='w-[120px] h-[120px] shrink-0 rounded-xl'
        />
        <div className='min-w-0'>
          <h3 className='font-semibold text-gray-900 group-hover:text-[#f56551] transition-colors leading-snug'>
            {place.placeName}
          </h3>
          <p className='text-xs text-gray-500 mt-1 line-clamp-2'>{place.placeDetails}</p>
          <div className='flex items-center gap-3 mt-2 flex-wrap'>
            <span className='text-xs text-gray-600'>🎟️ {place.ticketPricing}</span>
            <span className='text-xs font-medium text-amber-500'>⭐ {place.rating}</span>
          </div>
          <p className='text-xs text-gray-400 mt-1'>🕙 {place.travelTime}</p>
          <span className='inline-flex items-center gap-1 mt-2 text-xs text-[#f56551] font-medium'>
            <FiMapPin className='h-3 w-3' /> Open in Maps
          </span>
        </div>
      </div>
    </a>
  )
}

export default PlaceCardItem
