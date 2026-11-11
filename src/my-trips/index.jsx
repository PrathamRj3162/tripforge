import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import UserTripCardItem from './components/UserTripCardItem'

function MyTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState(null) // null = still loading
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const q = query(collection(db, 'users', user.uid, 'trips'), orderBy('createdAt', 'desc'), limit(50))
    getDocs(q)
      .then((snap) => {
        if (!cancelled) setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [user.uid])

  const onDelete = async (trip) => {
    if (!window.confirm(`Delete your trip to ${trip.destination}?`)) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'trips', trip.id))
      setTrips((current) => current.filter((t) => t.id !== trip.id))
      toast('Trip deleted')
    } catch (err) {
      console.error(err)
      toast('Could not delete the trip.')
    }
  }

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10 pb-20'>
      {/* Page header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='font-bold text-3xl text-gray-900'>My Trips</h2>
          <p className='text-gray-500 text-sm mt-1'>Your saved itineraries — click any trip to view or share it.</p>
        </div>
        <Button asChild>
          <Link to='/create-trip'>+ New Trip</Link>
        </Button>
      </div>

      {failed && (
        <div className='rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600'>
          Could not load your trips. Please refresh the page.
        </div>
      )}

      {/* Skeletons */}
      {!failed && trips === null && (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-5'>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className='flex flex-col gap-2'>
              <div className='h-[220px] w-full bg-gray-100 animate-pulse rounded-2xl' />
              <div className='h-4 w-3/4 bg-gray-100 animate-pulse rounded' />
              <div className='h-3 w-1/2 bg-gray-100 animate-pulse rounded' />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {trips?.length === 0 && (
        <div className='flex flex-col items-center justify-center py-24 text-center'>
          <p className='text-5xl mb-4'>✈️</p>
          <h3 className='font-semibold text-lg text-gray-800'>No trips yet</h3>
          <p className='text-gray-500 text-sm mt-2 mb-6'>Plan your first adventure and it will appear here.</p>
          <Button asChild>
            <Link to='/create-trip'>Plan my first trip</Link>
          </Button>
        </div>
      )}

      {/* Trip grid */}
      {trips?.length > 0 && (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-5'>
          {trips.map((trip) => (
            <UserTripCardItem trip={trip} key={trip.id} onDelete={() => onDelete(trip)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyTrips
