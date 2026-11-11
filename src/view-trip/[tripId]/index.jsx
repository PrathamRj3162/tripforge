import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import Footer from '../components/Footer'
import Hotels from '../components/Hotels'
import InfoSection from '../components/InfoSection'
import PlacesToVisit from '../components/PlacesToVisit'

function ViewTrip() {
  const { tripId } = useParams()
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', trip: null })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', trip: null })
    // Trips live under the signed-in user's own path, and firestore.rules only allow the owner to read them.
    getDoc(doc(db, 'users', user.uid, 'trips', tripId))
      .then((snap) => {
        if (!cancelled) setState(snap.exists() ? { status: 'ready', trip: snap.data() } : { status: 'missing', trip: null })
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setState({ status: 'missing', trip: null })
      })
    return () => {
      cancelled = true
    }
  }, [tripId, user.uid])

  if (state.status === 'loading') {
    return (
      <div className='p-10 md:px-20 lg:px-44 xl:px-56'>
        <div className='h-[380px] w-full animate-pulse rounded-2xl bg-gray-100 mb-8' />
        <div className='flex gap-3 mb-6'>
          <div className='h-5 w-24 bg-gray-100 animate-pulse rounded-full' />
          <div className='h-5 w-24 bg-gray-100 animate-pulse rounded-full' />
          <div className='h-5 w-24 bg-gray-100 animate-pulse rounded-full' />
        </div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className='h-[180px] rounded-2xl bg-gray-100 animate-pulse' />
          ))}
        </div>
      </div>
    )
  }

  if (state.status === 'missing') {
    return (
      <div className='mx-auto mt-20 max-w-md px-5 text-center'>
        <p className='text-5xl mb-4'>🗺️</p>
        <h2 className='text-2xl font-bold'>Trip not found</h2>
        <p className='mt-3 text-gray-500'>It may have been deleted, or it belongs to another account.</p>
        <Link to='/my-trips' className='mt-5 inline-block text-[#f56551] underline'>
          ← Back to My Trips
        </Link>
      </div>
    )
  }

  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56 pb-0'>
      <InfoSection trip={state.trip} />
      <Hotels trip={state.trip} />
      <PlacesToVisit trip={state.trip} />
      <Footer />
    </div>
  )
}

export default ViewTrip
