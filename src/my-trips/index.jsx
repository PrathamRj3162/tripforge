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
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10'>
      <h2 className='font-bold text-3xl'>My Trips</h2>

      {failed && <p className='mt-10 text-gray-500'>Could not load your trips. Please refresh the page.</p>}

      {!failed && trips === null && (
        <div className='grid grid-cols-2 mt-10 md:grid-cols-3 gap-5'>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className='h-[250px] w-full bg-slate-200 animate-pulse rounded-xl' />
          ))}
        </div>
      )}

      {trips?.length === 0 && (
        <div className='mt-10 text-gray-500'>
          <p>You have no trips yet.</p>
          <Button asChild className='mt-4'>
            <Link to='/create-trip'>Plan your first trip</Link>
          </Button>
        </div>
      )}

      {trips?.length > 0 && (
        <div className='grid grid-cols-2 mt-10 md:grid-cols-3 gap-5'>
          {trips.map((trip) => (
            <UserTripCardItem trip={trip} key={trip.id} onDelete={() => onDelete(trip)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyTrips
