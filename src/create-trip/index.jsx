import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FiMapPin, FiCalendar, FiDollarSign, FiUsers, FiCpu } from 'react-icons/fi'
import PlacesAutocomplete from '@/components/custom/PlacesAutocomplete'
import { Input } from '@/components/ui/input'
import { BUDGET_OPTIONS, TRAVELER_OPTIONS } from '@/constants/options'
import { generateTrip } from '@/lib/api'
import { MAX_DAYS, MIN_DAYS } from '../../shared/limits.js'

const STEPS = [
  { number: 1, label: 'Destination', icon: <FiMapPin className='h-4 w-4' /> },
  { number: 2, label: 'Duration', icon: <FiCalendar className='h-4 w-4' /> },
  { number: 3, label: 'Budget', icon: <FiDollarSign className='h-4 w-4' /> },
  { number: 4, label: 'Travelers', icon: <FiUsers className='h-4 w-4' /> },
]

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

  const cardCls = (selected) =>
    `relative p-4 border-2 cursor-pointer rounded-xl transition-all duration-150 ${
      selected
        ? 'border-[#f56551] bg-[#fff5f3] shadow-sm'
        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
    }`

  const activeStep = !destination ? 1 : !days ? 2 : !budget ? 3 : 4

  return (
    <div className='min-h-screen bg-gray-50/50'>
      {/* Page banner */}
      <div className='bg-white border-b border-gray-100'>
        <div className='mx-auto max-w-3xl px-5 py-8 md:py-10'>
          <div className='flex items-center gap-3 mb-2'>
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#f56551]/10'>
              <FiCpu className='h-5 w-5 text-[#f56551]' />
            </span>
            <div>
              <h1 className='font-bold text-2xl text-gray-900'>Plan Your Trip</h1>
              <p className='text-sm text-gray-500 mt-0.5'>Let AI craft a perfect itinerary in seconds</p>
            </div>
          </div>

          {/* Step progress */}
          <div className='flex items-center gap-2 mt-6 overflow-x-auto pb-1'>
            {STEPS.map((step, idx) => {
              const done = activeStep > step.number
              const active = activeStep === step.number
              return (
                <div key={step.number} className='flex items-center gap-2 shrink-0'>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    done ? 'bg-[#f56551] text-white' :
                    active ? 'bg-[#f56551]/10 text-[#f56551] border border-[#f56551]/30' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step.icon}
                    {step.label}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`h-px w-6 ${done ? 'bg-[#f56551]' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className='mx-auto max-w-3xl px-5 py-10 pb-20'>
        <div className='flex flex-col gap-10'>

          {/* 1 — Destination */}
          <section>
            <div className='flex items-center gap-2 mb-3'>
              <span className='flex h-7 w-7 items-center justify-center rounded-full bg-[#f56551] text-white text-xs font-bold shrink-0'>1</span>
              <h2 className='font-semibold text-gray-900'>Where do you want to go?</h2>
            </div>
            <PlacesAutocomplete onChange={setDestination} />
            {destination && (
              <p className='mt-2 text-xs text-green-600 font-medium'>✓ {destination.label}</p>
            )}
          </section>

          {/* 2 — Duration */}
          <section>
            <div className='flex items-center gap-2 mb-3'>
              <span className='flex h-7 w-7 items-center justify-center rounded-full bg-[#f56551] text-white text-xs font-bold shrink-0'>2</span>
              <h2 className='font-semibold text-gray-900'>
                How many days?{' '}
                <span className='text-gray-400 font-normal text-sm'>({MIN_DAYS}–{MAX_DAYS})</span>
              </h2>
            </div>
            <div className='flex items-center gap-3'>
              <Input
                placeholder='e.g. 5'
                type='number'
                min={MIN_DAYS}
                max={MAX_DAYS}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className='max-w-[140px] text-lg font-semibold text-center h-12 rounded-xl border-2 focus:border-[#f56551]'
              />
              <span className='text-sm text-gray-500'>days of travel</span>
            </div>
          </section>

          {/* 3 — Budget */}
          <section>
            <div className='flex items-center gap-2 mb-3'>
              <span className='flex h-7 w-7 items-center justify-center rounded-full bg-[#f56551] text-white text-xs font-bold shrink-0'>3</span>
              <h2 className='font-semibold text-gray-900'>What is your budget?</h2>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {BUDGET_OPTIONS.map((item) => (
                <div key={item.id} onClick={() => setBudget(item.id)} className={cardCls(budget === item.id)}>
                  {budget === item.id && (
                    <span className='absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#f56551] flex items-center justify-center'>
                      <svg className='h-3 w-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                      </svg>
                    </span>
                  )}
                  <div className='text-3xl mb-2'>{item.icon}</div>
                  <h3 className='font-semibold text-gray-900'>{item.title}</h3>
                  <p className='text-sm text-gray-500 mt-1'>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4 — Travelers */}
          <section>
            <div className='flex items-center gap-2 mb-3'>
              <span className='flex h-7 w-7 items-center justify-center rounded-full bg-[#f56551] text-white text-xs font-bold shrink-0'>4</span>
              <h2 className='font-semibold text-gray-900'>Who is traveling?</h2>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              {TRAVELER_OPTIONS.map((item) => (
                <div key={item.id} onClick={() => setTravelers(item.id)} className={cardCls(travelers === item.id)}>
                  {travelers === item.id && (
                    <span className='absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#f56551] flex items-center justify-center'>
                      <svg className='h-3 w-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                      </svg>
                    </span>
                  )}
                  <div className='text-2xl mb-2'>{item.icon}</div>
                  <h3 className='font-semibold text-sm text-gray-900'>{item.title}</h3>
                  <p className='text-xs text-gray-500 mt-1 leading-relaxed'>{item.desc}</p>
                  <p className='text-xs text-[#f56551] mt-1.5 font-semibold'>{item.people}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Generate */}
          <section className='bg-white rounded-2xl border border-gray-100 p-6 shadow-sm'>
            <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none mb-5'>
              <input
                type='checkbox'
                checked={fresh}
                onChange={(e) => setFresh(e.target.checked)}
                className='accent-[#f56551] h-4 w-4'
              />
              <span>
                Generate a fresh plan{' '}
                <span className='text-gray-400'>(skips cached results — uses 1 AI credit)</span>
              </span>
            </label>

            <button
              type='button'
              disabled={loading}
              onClick={onGenerateTrip}
              className='w-full flex items-center justify-center gap-3 rounded-xl bg-[#f56551] hover:bg-[#e0533f] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-base py-4 transition-all shadow-md hover:shadow-lg'
            >
              {loading ? (
                <>
                  <AiOutlineLoading3Quarters className='h-5 w-5 animate-spin shrink-0' />
                  Planning your trip…
                </>
              ) : (
                <>
                  <FiCpu className='h-5 w-5 shrink-0' />
                  Generate My Trip ✨
                </>
              )}
            </button>

            {loading && (
              <div className='mt-4'>
                <div className='flex justify-between text-xs text-gray-400 mb-1.5'>
                  <span>Calling Gemini AI…</span>
                  <span>up to 30s</span>
                </div>
                <div className='h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                  <div className='h-full bg-[#f56551] rounded-full animate-pulse w-2/3' />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default CreateTrip
