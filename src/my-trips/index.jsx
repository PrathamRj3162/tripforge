import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { toast } from 'sonner'
import { FiPlus, FiTrash2, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import UserTripCardItem from './components/UserTripCardItem'

function MyTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const q = query(collection(db, 'users', user.uid, 'trips'), orderBy('createdAt', 'desc'), limit(50))
    getDocs(q)
      .then((snap) => { if (!cancelled) setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() }))) })
      .catch((err) => { console.error(err); if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [user.uid])

  const onDelete = async (trip) => {
    if (!window.confirm(`Delete trip to ${trip.destination}?`)) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'trips', trip.id))
      setTrips((t) => t.filter((x) => x.id !== trip.id))
      toast('Trip deleted.')
    } catch (err) {
      console.error(err); toast('Could not delete.')
    }
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <div className='border-b border-gray-100'>
        <div className='mx-auto max-w-6xl px-6 md:px-10 py-8 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>My trips</h1>
            <p className='text-sm text-gray-400 mt-1'>
              {trips === null ? 'Loading…'
                : trips?.length === 0 ? 'No trips yet'
                : `${trips.length} saved trip${trips.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            to='/create-trip'
            className='inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all'
          >
            <FiPlus className='h-4 w-4' /> New trip
          </Link>
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-6 md:px-10 py-8 pb-20'>
        {failed && (
          <div className='rounded-xl bg-red-50 border border-red-100 p-6 text-sm text-red-600'>
            Failed to load trips. Please refresh.
          </div>
        )}

        {/* Skeleton */}
        {!failed && trips === null && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className='rounded-2xl overflow-hidden'>
                <div className='h-48 bg-gray-100 animate-pulse' />
                <div className='p-3 space-y-2'>
                  <div className='h-4 bg-gray-100 animate-pulse rounded w-3/4' />
                  <div className='h-3 bg-gray-100 animate-pulse rounded w-1/2' />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {trips?.length === 0 && (
          <div className='flex flex-col items-center justify-center py-32 text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5 text-2xl'>✈️</div>
            <h3 className='font-bold text-gray-900 text-xl mb-2'>No trips yet</h3>
            <p className='text-gray-400 text-sm mb-8 max-w-xs'>Plan your first trip and it'll appear here — takes under a minute.</p>
            <Link to='/create-trip' className='inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all'>
              <FiPlus className='h-4 w-4' /> Plan my first trip
            </Link>
          </div>
        )}

        {/* Grid */}
        {trips?.length > 0 && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {trips.map((trip) => (
              <UserTripCardItem trip={trip} key={trip.id} onDelete={() => onDelete(trip)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTrips
