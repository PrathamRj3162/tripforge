import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import PlacesAutocomplete from '@/components/custom/PlacesAutocomplete'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BUDGET_OPTIONS, TRAVELER_OPTIONS } from '@/constants/options'
import { generateTrip } from '@/lib/api'
import { MAX_DAYS, MIN_DAYS } from '../../shared/limits.js'

function CreateTrip() {
  const [destination, setDestination] = useState(null)
  const [days, setDays] = useState('')
  const [budget, setBudget] = useState('')
  const [travelers, setTravelers] = useState('')
  const [fresh, setFresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onGenerateTrip = async () => {
    if (!destination || !days || !budget || !travelers) {
      toast('Please fill all details, and pick the destination from the list')
      return
    }
    const numberOfDays = Number(days)
    if (!Number.isInteger(numberOfDays) || numberOfDays < MIN_DAYS || numberOfDays > MAX_DAYS) {
      toast(`Please enter between ${MIN_DAYS} and ${MAX_DAYS} days`)
      return
    }

    setLoading(true)
    try {
      // The server checks the login, validates this input, asks Gemini, validates the answer and saves the trip.
      const result = await generateTrip({ destination: destination.label, days: numberOfDays, budget, travelers, fresh })
      if (!result.cached && typeof result.remainingToday === 'number') {
        toast(`Trip ready. You have ${result.remainingToday} AI plans left today.`)
      }
      navigate(`/view-trip/${result.tripId}`)
    } catch (err) {
      console.error(err)
      toast(err?.message || 'Something went wrong while generating the trip.')
      setLoading(false)
    }
  }

  const choiceClass = (selected) =>
    `p-4 border cursor-pointer rounded-xl hover:shadow-md transition-all ${
      selected ? 'shadow-md border-[#f56551] bg-[#f56551]/5' : 'border-gray-200 hover:border-gray-300'
    }`

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10 pb-20'>
      {/* Page header */}
      <div className='mb-10'>
        <h2 className='font-bold text-3xl text-gray-900'>Plan Your Next Trip 🗺️</h2>
        <p className='mt-2 text-gray-500 text-base max-w-lg'>
          Fill in your preferences and TripForge will generate a full day-by-day itinerary with hotels and attractions.
        </p>
      </div>

      <div className='flex flex-col gap-10'>
        {/* Destination */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-2'>
            📍 Where do you want to go?
          </label>
          <PlacesAutocomplete onChange={setDestination} />
        </div>

        {/* Duration */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-2'>
            📅 How many days? ({MIN_DAYS}–{MAX_DAYS})
          </label>
          <Input
            placeholder={`Enter days (${MIN_DAYS}–${MAX_DAYS})`}
            type='number'
            min={MIN_DAYS}
            max={MAX_DAYS}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className='max-w-xs'
          />
        </div>

        {/* Budget */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-3'>💰 What is your budget?</label>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {BUDGET_OPTIONS.map((item) => (
              <div key={item.id} onClick={() => setBudget(item.id)} className={choiceClass(budget === item.id)}>
                <h2 className='text-3xl mb-2'>{item.icon}</h2>
                <h2 className='font-semibold text-gray-900'>{item.title}</h2>
                <p className='text-sm text-gray-500 mt-1'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Travelers */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-3'>🧳 Who is travelling?</label>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {TRAVELER_OPTIONS.map((item) => (
              <div key={item.id} onClick={() => setTravelers(item.id)} className={choiceClass(travelers === item.id)}>
                <h2 className='text-3xl mb-2'>{item.icon}</h2>
                <h2 className='font-semibold text-gray-900'>{item.title}</h2>
                <p className='text-xs text-gray-500 mt-1'>{item.desc}</p>
                <p className='text-xs text-[#f56551] mt-1 font-medium'>{item.people}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Generate */}
        <div className='flex flex-col items-start gap-3 mt-2'>
          <label className='flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none'>
            <input
              type='checkbox'
              checked={fresh}
              onChange={(e) => setFresh(e.target.checked)}
              className='accent-[#f56551]'
            />
            Generate a brand-new plan (skips shared cache — uses one AI credit)
          </label>
          <Button
            disabled={loading}
            onClick={onGenerateTrip}
            size='lg'
            className='w-full sm:w-auto px-10'
          >
            {loading ? (
              <span className='flex items-center gap-2'>
                <AiOutlineLoading3Quarters className='h-5 w-5 animate-spin' />
                Planning your trip…
              </span>
            ) : (
              'Generate Trip ✨'
            )}
          </Button>
          {loading && (
            <p className='text-sm text-gray-400'>
              Calling Gemini AI and validating results — this takes up to 30 seconds.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateTrip
