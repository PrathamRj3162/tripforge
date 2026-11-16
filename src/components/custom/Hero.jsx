import { Link } from 'react-router-dom'
import { FiMapPin, FiCalendar, FiShield, FiArrowRight, FiZap } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/context/AuthContext'

const FEATURES = [
  {
    icon: <FiMapPin className='h-5 w-5' />,
    title: 'Smart Destination Search',
    desc: 'Real autocomplete powered by Google Places. Type any city — get it right.',
    color: 'bg-orange-50 text-orange-500',
  },
  {
    icon: <FiCalendar className='h-5 w-5' />,
    title: 'Day-by-Day Itinerary',
    desc: 'Gemini AI crafts custom hotels, attractions and time slots for every day.',
    color: 'bg-blue-50 text-blue-500',
  },
  {
    icon: <FiShield className='h-5 w-5' />,
    title: 'Private by Default',
    desc: 'Firebase Auth + strict Firestore rules — only you can see your trips.',
    color: 'bg-green-50 text-green-500',
  },
  {
    icon: <FiZap className='h-5 w-5' />,
    title: 'Instant Results',
    desc: 'Full trip plan generated in under 30 seconds. No waiting, no fuss.',
    color: 'bg-purple-50 text-purple-500',
  },
]

const DESTINATIONS = [
  { name: 'Paris', emoji: '🗼', desc: 'City of Light' },
  { name: 'Bali', emoji: '🌴', desc: 'Island of Gods' },
  { name: 'Tokyo', emoji: '🌸', desc: 'Neon & tradition' },
  { name: 'Dubai', emoji: '🏙️', desc: 'Sky-high luxury' },
  { name: 'Rome', emoji: '🏛️', desc: 'Eternal city' },
  { name: 'Maldives', emoji: '🐠', desc: 'Ocean paradise' },
]

const STATS = [
  { value: '7', label: 'Days max plan' },
  { value: '3', label: 'Budget tiers' },
  { value: '4', label: 'Traveler types' },
  { value: '∞', label: 'Destinations' },
]

export default function Hero() {
  const { user, signIn } = useAuth()

  return (
    <div className='flex flex-col'>

      {/* ── Hero ── */}
      <section className='relative overflow-hidden'>
        {/* Background blobs */}
        <div
          className='absolute inset-0 -z-10'
          style={{ background: 'linear-gradient(135deg, #fff5f3 0%, #fff 55%, #f0f4ff 100%)' }}
        />
        <div className='pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-[#f56551]/8 blur-3xl -z-10' />
        <div className='pointer-events-none absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-blue-400/8 blur-3xl -z-10' />

        <div className='mx-auto max-w-6xl px-5 md:px-10 py-16 md:py-24'>
          <div className='flex flex-col lg:flex-row items-center gap-14'>

            {/* Left — copy */}
            <div className='flex-1 text-center lg:text-left'>
              <span className='inline-flex items-center gap-2 rounded-full border border-[#f56551]/20 bg-[#f56551]/8 px-4 py-1.5 text-sm font-semibold text-[#f56551] mb-6'>
                ✈️ Powered by Gemini AI
              </span>

              <h1 className='font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-gray-900 mb-6'>
                Your next adventure,{' '}
                <span className='text-[#f56551]'>planned in seconds.</span>
              </h1>

              <p className='text-lg text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8'>
                Tell TripForge where you want to go, for how long, and your budget — 
                get a complete hotel + itinerary plan instantly.
              </p>

              <div className='flex flex-col sm:flex-row gap-3 justify-center lg:justify-start'>
                {user ? (
                  <Link
                    to='/create-trip'
                    className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#f56551] hover:bg-[#e0533f] text-white font-semibold text-base px-7 py-3.5 transition-all shadow-md hover:shadow-lg active:scale-[0.98]'
                  >
                    Plan a Trip <FiArrowRight className='h-4 w-4' />
                  </Link>
                ) : (
                  <button
                    type='button'
                    onClick={signIn}
                    className='inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#f56551] hover:bg-[#e0533f] text-white font-semibold text-base px-7 py-3.5 transition-all shadow-md hover:shadow-lg active:scale-[0.98]'
                  >
                    <FcGoogle className='h-5 w-5' />
                    Get started — it's free
                  </button>
                )}
                {user && (
                  <Link
                    to='/my-trips'
                    className='inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base px-7 py-3.5 transition-all'
                  >
                    My Trips
                  </Link>
                )}
              </div>
            </div>

            {/* Right — stats card */}
            <div className='flex-shrink-0 w-full max-w-xs lg:max-w-sm'>
              <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6'>
                <p className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4'>
                  What you get
                </p>
                <div className='grid grid-cols-2 gap-4'>
                  {STATS.map((s) => (
                    <div key={s.label} className='flex flex-col'>
                      <span className='text-3xl font-extrabold text-[#f56551]'>{s.value}</span>
                      <span className='text-sm text-gray-500 mt-0.5'>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className='mt-5 pt-5 border-t border-gray-100'>
                  <p className='text-xs text-gray-400 leading-relaxed'>
                    Hotels · Attractions · Time slots · Google Maps links — all included in every plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular destinations ── */}
      <section className='bg-white border-y border-gray-100 py-12'>
        <div className='mx-auto max-w-6xl px-5 md:px-10'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold text-gray-900'>Popular destinations</h2>
            {user && (
              <Link to='/create-trip' className='text-sm text-[#f56551] hover:underline font-medium flex items-center gap-1'>
                Plan yours <FiArrowRight className='h-3.5 w-3.5' />
              </Link>
            )}
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3'>
            {DESTINATIONS.map((d) => (
              <div
                key={d.name}
                className='flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-[#fff5f3] hover:border-[#f56551]/20 p-4 cursor-default transition-colors group'
              >
                <span className='text-3xl'>{d.emoji}</span>
                <span className='text-sm font-semibold text-gray-800 group-hover:text-[#f56551] transition-colors'>{d.name}</span>
                <span className='text-xs text-gray-400'>{d.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className='py-16 bg-gray-50/50'>
        <div className='mx-auto max-w-6xl px-5 md:px-10'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-3'>How TripForge works</h2>
            <p className='text-gray-500 text-base max-w-lg mx-auto'>
              Three simple steps from idea to full travel plan.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[
              { step: '01', title: 'Pick your destination', desc: 'Search any city or country with our Google Places autocomplete.' },
              { step: '02', title: 'Set your preferences', desc: 'Tell us your duration, budget tier and who is traveling.' },
              { step: '03', title: 'Get your full plan', desc: 'Gemini AI returns a complete hotel list + day-by-day itinerary.' },
            ].map((item) => (
              <div key={item.step} className='bg-white rounded-2xl border border-gray-100 p-7 relative overflow-hidden'>
                <span className='absolute top-4 right-4 text-5xl font-black text-gray-50 select-none leading-none'>
                  {item.step}
                </span>
                <div className='relative'>
                  <h3 className='font-bold text-gray-900 text-lg mb-2'>{item.title}</h3>
                  <p className='text-sm text-gray-500 leading-relaxed'>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className='py-16 bg-white'>
        <div className='mx-auto max-w-6xl px-5 md:px-10'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-3'>Everything you need</h2>
            <p className='text-gray-500 max-w-lg mx-auto'>
              Built for real trip planning — not toy demos.
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {FEATURES.map((f) => (
              <div key={f.title} className='rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow'>
                <span className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${f.color} mb-4`}>
                  {f.icon}
                </span>
                <h3 className='font-semibold text-gray-900 mb-2'>{f.title}</h3>
                <p className='text-sm text-gray-500 leading-relaxed'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      {!user && (
        <section className='py-14'
          style={{ background: 'linear-gradient(100deg, #f56551 0%, #e84f3b 100%)' }}
        >
          <div className='mx-auto max-w-6xl px-5 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left'>
            <div>
              <h2 className='text-2xl md:text-3xl font-bold text-white leading-tight'>
                Ready to forge your next trip?
              </h2>
              <p className='text-white/80 mt-2 text-sm'>
                Free to use · Instant results · No credit card required
              </p>
            </div>
            <button
              type='button'
              onClick={signIn}
              className='shrink-0 inline-flex items-center gap-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#f56551] font-semibold text-base px-7 py-3.5 transition-all shadow-md hover:shadow-lg active:scale-[0.98]'
            >
              <FcGoogle className='h-5 w-5' />
              Sign in with Google
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
