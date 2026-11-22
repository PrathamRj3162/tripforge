import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/context/AuthContext'

const DESTINATIONS = [
  { name: 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=75&auto=format&fit=crop', tag: 'Trending' },
  { name: 'Paris', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=75&auto=format&fit=crop', tag: 'Popular' },
  { name: 'Tokyo', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=75&auto=format&fit=crop', tag: 'Culture' },
  { name: 'Santorini', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=75&auto=format&fit=crop', tag: 'Islands' },
  { name: 'Maldives', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=75&auto=format&fit=crop', tag: 'Beach' },
  { name: 'New York', img: 'https://images.unsplash.com/photo-1538970272646-f61fabb3a8a2?w=600&q=75&auto=format&fit=crop', tag: 'City' },
]

const WHAT_YOU_GET = [
  'Complete hotel recommendations with pricing',
  'Day-by-day itinerary with time slots',
  'Google Maps links for every place',
  'Tailored to your budget & group size',
]

export default function Hero() {
  const { user, signIn } = useAuth()

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className='relative min-h-[90vh] flex flex-col lg:flex-row'>
        {/* Left — content */}
        <div className='flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-20 py-20 bg-white'>
          <p className='text-xs font-bold tracking-[0.2em] text-[#f56551] uppercase mb-4'>
            AI-Powered Travel Planner
          </p>
          <h1 className='text-5xl md:text-6xl font-black text-gray-900 leading-[1.08] tracking-tight mb-6'>
            Your perfect trip,<br />
            <span className='text-[#f56551]'>built in seconds.</span>
          </h1>
          <p className='text-gray-500 text-lg leading-relaxed max-w-md mb-8'>
            Tell TripForge your destination, budget and travel style.
            Get a full hotel + day-by-day itinerary — instantly.
          </p>

          <ul className='space-y-2.5 mb-10'>
            {WHAT_YOU_GET.map((item) => (
              <li key={item} className='flex items-center gap-3 text-sm text-gray-600'>
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-[#f56551]/10 shrink-0'>
                  <FiCheck className='h-3 w-3 text-[#f56551]' />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {user ? (
            <div className='flex flex-col sm:flex-row gap-3'>
              <Link
                to='/create-trip'
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold px-7 py-3.5 transition-all shadow-md hover:shadow-lg'
              >
                Plan a trip <FiArrowRight className='h-4 w-4' />
              </Link>
              <Link
                to='/my-trips'
                className='inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-7 py-3.5 transition-all'
              >
                My trips
              </Link>
            </div>
          ) : (
            <div className='flex flex-col gap-3 max-w-xs'>
              <button
                type='button'
                onClick={signIn}
                className='inline-flex items-center justify-center gap-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold px-7 py-3.5 transition-all shadow-md hover:shadow-lg'
              >
                <FcGoogle className='h-5 w-5' />
                Continue with Google
              </button>
              <p className='text-xs text-gray-400 text-center'>Free · No credit card needed</p>
            </div>
          )}
        </div>

        {/* Right — photo grid */}
        <div className='hidden lg:grid lg:w-[52%] grid-cols-2 grid-rows-3 gap-2 p-2 bg-gray-50'>
          {DESTINATIONS.map((d, i) => (
            <div
              key={d.name}
              className={`relative overflow-hidden rounded-xl ${i === 0 ? 'row-span-2' : ''}`}
            >
              <img
                src={d.img}
                alt={d.name}
                className='h-full w-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
              <div className='absolute bottom-3 left-3'>
                <p className='text-white font-bold text-sm drop-shadow'>{d.name}</p>
                <span className='inline-block mt-0.5 text-[10px] font-semibold text-white/70 uppercase tracking-wide'>{d.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className='py-20 bg-gray-50 border-t border-gray-100'>
        <div className='mx-auto max-w-5xl px-6 md:px-10'>
          <div className='max-w-xl mb-14'>
            <p className='text-xs font-bold tracking-[0.2em] text-[#f56551] uppercase mb-3'>Simple process</p>
            <h2 className='text-3xl font-black text-gray-900'>Three steps to your perfect trip</h2>
          </div>
          <div className='grid md:grid-cols-3 gap-8'>
            {[
              { n: '01', t: 'Set your preferences', d: 'Pick your destination, trip length, budget tier and who is traveling with you.' },
              { n: '02', t: 'AI builds your plan', d: 'Gemini AI generates hotels, attractions and time-slotted days in under 30 seconds.' },
              { n: '03', t: 'Explore & share', d: 'View your plan, open every place in Google Maps, and share the link with your group.' },
            ].map((s) => (
              <div key={s.n}>
                <p className='text-5xl font-black text-gray-100 leading-none mb-4'>{s.n}</p>
                <h3 className='font-bold text-gray-900 text-lg mb-2'>{s.t}</h3>
                <p className='text-sm text-gray-500 leading-relaxed'>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DESTINATIONS ─── */}
      <section className='py-20 bg-white'>
        <div className='mx-auto max-w-5xl px-6 md:px-10'>
          <div className='flex items-end justify-between mb-10'>
            <div>
              <p className='text-xs font-bold tracking-[0.2em] text-[#f56551] uppercase mb-2'>Explore</p>
              <h2 className='text-3xl font-black text-gray-900'>Where will you go?</h2>
            </div>
            {user && (
              <Link to='/create-trip' className='text-sm font-semibold text-gray-900 hover:text-[#f56551] transition-colors flex items-center gap-1'>
                Start planning <FiArrowRight className='h-4 w-4' />
              </Link>
            )}
          </div>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {DESTINATIONS.map((d) => (
              <div key={d.name} className='group relative aspect-[4/3] overflow-hidden rounded-2xl cursor-default'>
                <img
                  src={d.img}
                  alt={d.name}
                  className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                <div className='absolute bottom-4 left-4'>
                  <p className='font-bold text-white text-lg'>{d.name}</p>
                  <p className='text-white/60 text-xs mt-0.5 uppercase tracking-widest'>{d.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      {!user && (
        <section className='py-20 bg-gray-900'>
          <div className='mx-auto max-w-5xl px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8'>
            <div>
              <h2 className='text-3xl font-black text-white mb-2'>Ready to start?</h2>
              <p className='text-gray-400 text-base'>Free to use. Your trips are private and saved to your account.</p>
            </div>
            <button
              type='button'
              onClick={signIn}
              className='shrink-0 inline-flex items-center gap-3 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold px-8 py-4 transition-all shadow-xl'
            >
              <FcGoogle className='h-5 w-5' />
              Sign in with Google
            </button>
          </div>
        </section>
      )}

      {/* ─── FOOTER ─── */}
      <footer className='bg-gray-900 border-t border-gray-800 py-8'>
        <div className='mx-auto max-w-5xl px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <img src='/logo.svg' alt='TripForge' className='h-7 brightness-0 invert' />
          </div>
          <div className='text-center md:text-right'>
            <p className='text-sm text-gray-400'>Built by <span className='text-white font-semibold'>Pratham Raj</span></p>
            <p className='text-xs text-gray-600 mt-0.5'>AI plans — verify details before travelling</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
