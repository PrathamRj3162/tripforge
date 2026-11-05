import { FaMapLocationDot } from 'react-icons/fa6'
import PlacePhoto from '@/components/custom/PlacePhoto'
import { Button } from '@/components/ui/button'

function PlaceCardItem({ place, destination }) {
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query='
    + encodeURIComponent(`${place.placeName}, ${destination}`)

  return (
    <a href={mapsUrl} target='_blank' rel='noopener noreferrer'>
      <div className='shadow-sm border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 transition-all hover:shadow-md cursor-pointer'>
        <PlacePhoto query={`${place.placeName}, ${destination}`} alt={place.placeName} className='w-[130px] h-[130px] shrink-0 rounded-xl' />
        <div>
          <h2 className='font-bold text-lg'>{place.placeName}</h2>
          <p className='text-sm text-gray-500'>{place.placeDetails}</p>
          <p className='mt-1 text-sm'>🎟️ {place.ticketPricing} · ⭐ {place.rating}</p>
          <h2 className='mt-2'>🕙 {place.travelTime}</h2>
          <Button size='sm' tabIndex={-1} aria-hidden='true'><FaMapLocationDot /></Button>
        </div>
      </div>
    </a>
  )
}

export default PlaceCardItem
