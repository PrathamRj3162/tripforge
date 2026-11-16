import { FiMapPin, FiClock } from 'react-icons/fi'
import PlacePhoto from '@/components/custom/PlacePhoto'

function PlaceCardItem({ place, destination }) {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(`${place.placeName}, ${destination}`)

  return (
    <a href={mapsUrl} target='_blank' rel='noopener noreferrer' className='block group'>
      <div className='flex gap-4 rounded-xl border border-gray-100 bg-white p-3.5 hover:shadow-md hover:border-gray-200 transition-all duration-200'>
        {/* Photo */}
        <div className='shrink-0 w-[110px] h-[110px] rounded-xl overflow-hidden'>
          <PlacePhoto
            query={`${place.placeName}, ${destination}`}
            alt={place.placeName}
            className='w-full h-full transition-transform duration-300 group-hover:scale-105'
          />
        </div>

        {/* Details */}
        <div className='min-w-0 flex flex-col justify-between'>
          <div>
            <h3 className='font-semibold text-sm text-gray-900 group-hover:text-[#f56551] transition-colors leading-snug mb-1'>
              {place.placeName}
            </h3>
            <p className='text-xs text-gray-500 leading-relaxed line-clamp-2'>{place.placeDetails}</p>
          </div>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-2'>
            {place.ticketPricing && (
              <span className='text-xs text-gray-600 bg-gray-50 rounded-full px-2 py-0.5'>
                🎟️ {place.ticketPricing}
              </span>
            )}
            {place.travelTime && (
              <span className='inline-flex items-center gap-1 text-xs text-gray-400'>
                <FiClock className='h-3 w-3' />
                {place.travelTime}
              </span>
            )}
            <span className='inline-flex items-center gap-1 text-xs text-[#f56551] font-medium mt-0.5'>
              <FiMapPin className='h-3 w-3' />
              Open in Maps
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default PlaceCardItem
