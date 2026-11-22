import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FiLoader, FiMapPin, FiUsers, FiSend } from 'react-icons/fi'
import { BsCurrencyDollar } from 'react-icons/bs'
import { MdWeekend, MdFamilyRestroom } from 'react-icons/md'
import { IoPeopleOutline } from 'react-icons/io5'
import { BiSolidPlane } from 'react-icons/bi'
import PlacesAutocomplete from '@/components/custom/PlacesAutocomplete'
import { Input } from '@/components/ui/input'
import { BUDGET_OPTIONS, TRAVELER_OPTIONS } from '@/constants/options'
import { generateTrip } from '@/lib/api'
import { MAX_DAYS, MIN_DAYS } from '../../shared/limits.js'

const BUDGET_META = {
  cheap:    { icon: <BsCurrencyDollar className='h-5 w-5'/>, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Budget', hint: 'Hostels, street food, local transport' },
  moderate: { icon: <><BsCurrencyDollar className='h-5 w-5'/><BsCurrencyDollar className='h-5 w-5 -ml-2'/></>, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Standard', hint: '3-star hotels, cafes, mixed transport' },
  luxury:   { icon: <><BsCurrencyDollar className='h-5 w-5'/><BsCurrencyDollar className='h-5 w-5 -ml-2'/><BsCurrencyDollar className='h-5 w-5 -ml-2'/></>, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Luxury', hint: '5-star hotels, fine dining, private transfers' },
}

const TRAVELER_META = {
  solo:    { icon: <BiSolidPlane className='h-6 w-6'/>, color: 'text-violet-600', bg: 'bg-violet-50' },
  couple:  { icon: <MdWeekend className='h-6 w-6'/>, color: 'text-pink-600', bg: 'bg-pink-50' },
  family:  { icon: <MdFamilyRestroom className='h-6 w-6'/>, color: 'text-orange-600', bg: 'bg-orange-50' },
  friends: { icon: <IoPeopleOutline className='h-6 w-6'/>, color: 'text-cyan-600', bg: 'bg-cyan-50' },
}

function CreateTrip() {
  const [destination, setDestination] = useState(null)
  const [days, setDays] = useState('')
  const [budget, setBudget] = useState('')
  const [travelers, setTravelers] = useState('')
  const [fresh, setFresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onGenerate = async () => {
    if (!destination || !days || !budget || !travelers) {
      toast('Fill all fields and select destination from the dropdown.')
      return
    }
    const n = Number(days)
    if (!Number.isInteger(n) || n < MIN_DAYS || n > MAX_DAYS) {
      toast(`Days must be ${MIN_DAYS}–${MAX_DAYS}`)
      return
    }
    setLoading(true)
    try {
      const result = await generateTrip({ destination: destination.label, days: n, budget, travelers, fresh })
      if (!result.cached && typeof result.remainingToday === 'number') {
        toast(`Done! ${result.remainingToday} AI plans left today.`)
      }
      navigate(`/view-trip/${result.tripId}`)
    } catch (err) {
      console.error(err)
      toast(err?.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  const isReady = destination && days && budget && travelers

  return (
    <div className='min-h-screen bg-white'>
      {/* Top bar */}
      <div className='border-b border-gray-100 bg-white'>
        <div className='mx-auto max-w-2xl px-5 py-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Plan a trip</h1>
          <p className='text-sm text-gray-400 mt-1'>Fill in your details — we'll build the full itinerary.</p>
        </div>
      </div>

      <div className='mx-auto max-w-2xl px-5 py-8 pb-24 space-y-10'>

        {/* Destination */}
        <div>
          <div className='flex items-center gap-2 mb-3'>
            <FiMapPin className='h-4 w-4 text-gray-400' />
            <span className='text-sm font-semibold text-gray-700 uppercase tracking-wider'>Destination</span>
          </div>
          <PlacesAutocomplete onChange={setDestination} />
          {destination && (
            <p className='mt-2 text-xs text-emerald-600'>✓ {destination.label}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <div className='flex items-center gap-2 mb-3'>
            <span className='text-sm font-semibold text-gray-700 uppercase tracking-wider'>Duration</span>
            <span className='text-xs text-gray-400'>({MIN_DAYS}–{MAX_DAYS} days)</span>
          </div>
          <div className='flex items-center gap-3'>
            <Input
              type='number'
              min={MIN_DAYS}
              max={MAX_DAYS}
              placeholder='5'
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className='w-24 text-center text-lg font-semibold h-11 border-gray-200 focus:border-gray-400 focus:ring-0 rounded-lg'
            />
            <span className='text-sm text-gray-500'>nights / days</span>
          </div>
        </div>

        {/* Budget */}
        <div>
          <div className='flex items-center gap-2 mb-3'>
            <span className='text-sm font-semibold text-gray-700 uppercase tracking-wider'>Budget</span>
          </div>
          <div className='grid grid-cols-3 gap-3'>
            {BUDGET_OPTIONS.map((item) => {
              const m = BUDGET_META[item.id]
              const sel = budget === item.id
              return (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => setBudget(item.id)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                    sel
                      ? 'border-gray-900 bg-white shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                  }`}
                >
                  {sel && (
                    <span className='absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-gray-900 flex items-center justify-center'>
                      <svg className='h-2.5 w-2.5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                      </svg>
                    </span>
                  )}
                  <span className={`inline-flex items-center ${m.bg} ${m.color} rounded-lg p-2 mb-3`}>
                    {m.icon}
                  </span>
                  <p className='font-semibold text-sm text-gray-900'>{m.label}</p>
                  <p className='text-xs text-gray-400 mt-0.5 leading-relaxed'>{m.hint}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Travelers */}
        <div>
          <div className='flex items-center gap-2 mb-3'>
            <FiUsers className='h-4 w-4 text-gray-400' />
            <span className='text-sm font-semibold text-gray-700 uppercase tracking-wider'>Traveling as</span>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            {TRAVELER_OPTIONS.map((item) => {
              const m = TRAVELER_META[item.id]
              const sel = travelers === item.id
              return (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => setTravelers(item.id)}
                  className={`relative text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    sel
                      ? 'border-gray-900 bg-white shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                  }`}
                >
                  {sel && (
                    <span className='absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-gray-900 flex items-center justify-center'>
                      <svg className='h-2.5 w-2.5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                      </svg>
                    </span>
                  )}
                  <span className={`${m.bg} ${m.color} p-2.5 rounded-xl shrink-0`}>{m.icon}</span>
                  <div>
                    <p className='font-semibold text-sm text-gray-900'>{item.title}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>{item.people}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Options + generate */}
        <div className='pt-2'>
          <label className='flex items-center gap-2.5 text-sm text-gray-500 cursor-pointer select-none mb-6'>
            <input
              type='checkbox'
              checked={fresh}
              onChange={(e) => setFresh(e.target.checked)}
              className='h-4 w-4 rounded border-gray-300 accent-gray-900'
            />
            Skip cache — generate a fresh plan (uses 1 AI credit)
          </label>

          <button
            type='button'
            disabled={loading || !isReady}
            onClick={onGenerate}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base transition-all ${
              isReady && !loading
                ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg active:scale-[0.99]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <FiLoader className='h-5 w-5 animate-spin' />
                Building your itinerary…
              </>
            ) : (
              <>
                <FiSend className='h-5 w-5' />
                Generate itinerary
              </>
            )}
          </button>

          {loading && (
            <p className='text-center text-xs text-gray-400 mt-3'>
              Calling Gemini AI — usually takes 10–30 seconds
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateTrip
