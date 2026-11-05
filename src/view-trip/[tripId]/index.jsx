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
    return <div className='p-10 md:px-20 lg:px-44 xl:px-56'><div className='h-[340px] w-full animate-pulse rounded-xl bg-slate-200' /></div>
  }

  if (state.status === 'missing') {
    return (
      <div className='mx-auto mt-20 max-w-md px-5 text-center'>
        <h2 className='text-2xl font-bold'>Trip not found</h2>
        <p className='mt-3 text-gray-500'>It may have been deleted, or it belongs to another account.</p>
        <Link to='/my-trips' className='mt-4 inline-block text-[#f56551] underline'>Go to My Trips</Link>
      </div>
    )
  }

  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56'>
      <InfoSection trip={state.trip} />
      <Hotels trip={state.trip} />
      <PlacesToVisit trip={state.trip} />
      <Footer />
    </div>
  )
}

export default ViewTrip
