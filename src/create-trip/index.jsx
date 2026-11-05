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
    `p-4 border cursor-pointer rounded-lg hover:shadow-lg ${selected ? 'shadow-lg border-black' : ''}`

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10'>
      <h2 className='font-bold text-3xl'>Tell us your travel preferences 🏕️🌴</h2>
      <p className='mt-3 text-gray-500 text-xl'>
        Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
      </p>

      <div className='mt-20 flex flex-col gap-10'>
        <div>
          <h2 className='text-xl my-3 font-medium'>What is destination of choice?</h2>
          <PlacesAutocomplete onChange={setDestination} />
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>How many days are you planning your trip?</h2>
          <Input
            placeholder='Ex.3'
            type='number'
            min={MIN_DAYS}
            max={MAX_DAYS}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
      </div>

      <div>
        <h2 className='text-xl my-3 font-medium'>What is Your Budget?</h2>
        <div className='grid grid-cols-3 gap-5 mt-5'>
          {BUDGET_OPTIONS.map((item) => (
            <div key={item.id} onClick={() => setBudget(item.id)} className={choiceClass(budget === item.id)}>
              <h2 className='text-4xl'>{item.icon}</h2>
              <h2 className='font-bold text-lg'>{item.title}</h2>
              <h2 className='text-sm text-gray-500'>{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className='text-xl my-3 font-medium'>Who do you plan on traveling with on your next adventure?</h2>
        <div className='grid grid-cols-3 gap-5 mt-5'>
          {TRAVELER_OPTIONS.map((item) => (
            <div key={item.id} onClick={() => setTravelers(item.id)} className={choiceClass(travelers === item.id)}>
              <h2 className='text-4xl'>{item.icon}</h2>
              <h2 className='font-bold text-lg'>{item.title}</h2>
              <h2 className='text-sm text-gray-500'>{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>

      <div className='my-10 flex flex-col items-end gap-2'>
        <label className='flex items-center gap-2 text-sm text-gray-500'>
          <input type='checkbox' checked={fresh} onChange={(e) => setFresh(e.target.checked)} />
          Make a brand-new plan (uses one of today's AI plans instead of a saved one)
        </label>
        <Button disabled={loading} onClick={onGenerateTrip}>
          {loading ? <AiOutlineLoading3Quarters className='h-7 w-7 animate-spin' /> : 'Generate Trip'}
        </Button>
        {loading && <p className='text-sm text-gray-500'>Planning your trip. This can take up to a minute.</p>}
      </div>
    </div>
  )
}

export default CreateTrip
