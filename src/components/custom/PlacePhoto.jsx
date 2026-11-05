import { useEffect, useState } from 'react'
import { loadPhoto } from '@/lib/photos'

// Shows a real photo of a place, or the placeholder. The lookup goes through our server (no key in the browser).
// Google requires the photo author to be credited whenever a photo is shown, so the credit is rendered too.
function PlacePhoto({ query, alt = '', className = '' }) {
  const [photo, setPhoto] = useState(null)

  useEffect(() => {
    let cancelled = false
    setPhoto(null)
    if (query) {
      loadPhoto(query).then((result) => {
        if (!cancelled) setPhoto(result)
      })
    }
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={photo?.url || '/placeholder.jpg'}
        alt={alt}
        loading='lazy'
        referrerPolicy='no-referrer'
        className='h-full w-full object-cover'
      />
      {photo?.attribution && (
        <span className='absolute bottom-1 left-1 max-w-[90%] truncate rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white'>
          Photo: {photo.attribution}
        </span>
      )}
    </div>
  )
}

export default PlacePhoto
