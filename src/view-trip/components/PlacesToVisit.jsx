import PlaceCardItem from './PlaceCardItem'

function PlacesToVisit({ trip }) {
  return (
    <div>
      <h2 className='font-bold text-lg'>Places to Visit</h2>

      <div>
        {trip.plan?.itinerary?.map((item) => (
          <div className='mt-5' key={item.day}>
            <h2 className='font-medium text-lg'>Day {item.day}: {item.theme}</h2>
            <div className='grid md:grid-cols-2 gap-5'>
              {item.plan?.map((place, index) => (
                <div key={index}>
                  <h2 className='font-medium text-sm text-orange-600'>{place.bestTime}</h2>
                  <PlaceCardItem place={place} destination={trip.destination} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlacesToVisit
