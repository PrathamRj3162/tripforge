import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { toast } from 'sonner'
import { FiPlus, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import UserTripCardItem from './components/UserTripCardItem'

function MyTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState(null) // null = loading
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
    return () => { cancelled = true }
  }, [user.uid])

  const onDelete = async (trip) => {
    if (!window.confirm(`Delete your trip to ${trip.destination}?`)) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'trips', trip.id))
      setTrips((current) => current.filter((t) => t.id !== trip.id))
      toast('Trip deleted.')
    } catch (err) {
      console.error(err)
      toast('Could not delete the trip.')
    }
  }

  return (
    <div className='min-h-screen bg-gray-50/40'>
      {/* Page header */}
      <div className='bg-white border-b border-gray-100'>
        <div className='mx-auto max-w-6xl px-5 md:px-10 py-8 flex items-center justify-between gap-4'>
          <div>
            <h1 className='font-bold text-2xl text-gray-900'>My Trips</h1>
            <p className='text-sm text-gray-500 mt-1'>
              {trips === null ? 'Loading…' : trips?.length === 0 ? 'No trips yet — plan your first one.' : `${trips.length} saved itinerar${trips.length === 1 ? 'y' : 'ies'}`}
            </p>
          </div>
          <Link
            to='/create-trip'
            className='inline-flex items-center gap-2 rounded-xl bg-[#f56551] hover:bg-[#e0533f] text-white font-semibold text-sm px-5 py-2.5 transition-all shadow-sm hover:shadow-md active:scale-[0.98]'
          >
            <FiPlus className='h-4 w-4' />
            New Trip
          </Link>
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-5 md:px-10 py-8 pb-20'>
        {/* Error */}
        {failed && (
          <div className='flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600 mb-6'>
            <FiAlertCircle className='h-5 w-5 shrink-0' />
            Could not load your trips. Please refresh the page.
          </div>
        )}

        {/* Skeleton */}
        {!failed && trips === null && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className='flex flex-col gap-2.5'>
                <div className='h-[200px] w-full bg-gray-200 animate-pulse rounded-2xl' />
                <div className='h-4 w-3/4 bg-gray-200 animate-pulse rounded-full' />
                <div className='h-3 w-1/2 bg-gray-100 animate-pulse rounded-full' />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!failed && trips?.length === 0 && (
          <div className='flex flex-col items-center justify-center py-28 text-center'>
            <div className='h-20 w-20 rounded-full bg-[#f56551]/10 flex items-center justify-center mb-5 text-4xl'>
              ✈️
            </div>
            <h3 className='font-semibold text-lg text-gray-900 mb-2'>No trips yet</h3>
            <p className='text-gray-500 text-sm mb-7 max-w-xs'>
              Plan your first adventure and it will appear here. Takes less than a minute.
            </p>
            <Link
              to='/create-trip'
              className='inline-flex items-center gap-2 rounded-xl bg-[#f56551] hover:bg-[#e0533f] text-white font-semibold px-6 py-3 transition-all shadow-md'
            >
              <FiPlus className='h-4 w-4' />
              Plan my first trip
            </Link>
          </div>
        )}

        {/* Grid */}
        {trips?.length > 0 && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
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
