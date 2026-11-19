import { Link } from 'react-router-dom'
import { FiArrowRight, FiMapPin, FiCalendar, FiShield, FiZap } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/context/AuthContext'

// Free Unsplash photos — no API key needed, these are direct CDN links
const DESTINATIONS = [
  {
    name: 'Paris',
    country: 'France',
    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80&auto=format&fit=crop',
    tag: 'Romance',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80&auto=format&fit=crop',
    tag: 'Nature',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80&auto=format&fit=crop',
    tag: 'Culture',
  },
  {
    name: 'Santorini',
    country: 'Greece',
    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80&auto=format&fit=crop',
    tag: 'Islands',
  },
  {
    name: 'New York',
    country: 'USA',
    img: 'https://images.unsplash.com/photo-1538970272646-f61fabb3a8a2?w=600&q=80&auto=format&fit=crop',
    tag: 'City',
  },
  {
    name: 'Maldives',
    country: 'South Asia',
    img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80&auto=format&fit=crop',
    tag: 'Beach',
  },
]

const FEATURES = [
  {
    icon: <FiMapPin className='h-5 w-5' />,
    title: 'Smart Destination Search',
    desc: 'Google Places autocomplete for any city on earth.',
    color: 'text-orange-500 bg-orange-50',
  },
  {
    icon: <FiCalendar className='h-5 w-5' />,
    title: 'Full Day-by-Day Plan',
    desc: 'Hotels, attractions and time slots — built by Gemini AI.',
    color: 'text-blue-500 bg-blue-50',
  },
  {
    icon: <FiShield className='h-5 w-5' />,
    title: 'Secure & Private',
    desc: 'Firebase Auth keeps every trip visible only to you.',
    color: 'text-green-500 bg-green-50',
  },
  {
    icon: <FiZap className='h-5 w-5' />,
    title: 'Results in 30 Seconds',
    desc: 'Full itinerary generated and saved — no waiting.',
    color: 'text-purple-500 bg-purple-50',
  },
]

export default function Hero() {
  const { user, signIn } = useAuth()

  return (
    <div className='flex flex-col'>

      {/* ── HERO — full-width image banner ── */}
      <section className='relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden'>
        {/* Background photo */}
        <img
          src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1800&q=85&auto=format&fit=crop'
          alt='Travel'
          className='absolute inset-0 h-full w-full object-cover object-center'
        />
        {/* Dark overlay */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70' />

        {/* Content */}
        <div className='relative z-10 mx-auto max-w-4xl px-5 text-center'>
          <span className='inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-white/90 mb-7'>
            ✈️ AI-powered travel planning
          </span>

          <h1 className='font-extrabold text-5xl md:text-7xl leading-[1.08] tracking-tight text-white mb-6 drop-shadow-lg'>
            Your perfect trip,{' '}
            <span className='text-[#ff8c73]'>built for you.</span>
          </h1>

          <p className='text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10'>
            Tell us your destination, days and budget — TripForge's AI builds your
            complete hotel + itinerary plan in seconds.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            {user ? (
              <>
                <Link
                  to='/create-trip'
                  className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#f56551] hover:bg-[#e0533f] text-white font-bold text-base px-8 py-4 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]'
                >
                  Plan a Trip <FiArrowRight className='h-5 w-5' />
                </Link>
                <Link
                  to='/my-trips'
                  className='inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold text-base px-8 py-4 transition-all'
                >
                  My Trips
                </Link>
              </>
            ) : (
              <button
                type='button'
                onClick={signIn}
                className='inline-flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-base px-8 py-4 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]'
              >
                <FcGoogle className='h-6 w-6' />
                Start planning for free
              </button>
            )}
          </div>
        </div>

        {/* Bottom fade */}
        <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent' />
      </section>

      {/* ── POPULAR DESTINATIONS — photo cards ── */}
      <section className='py-16 bg-white'>
        <div className='mx-auto max-w-6xl px-5 md:px-10'>
          <div className='flex items-end justify-between mb-8'>
            <div>
              <p className='text-sm font-semibold text-[#f56551] uppercase tracking-widest mb-1'>Explore</p>
              <h2 className='text-3xl font-bold text-gray-900'>Popular destinations</h2>
            </div>
            {user && (
              <Link to='/create-trip' className='hidden sm:flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#f56551] transition-colors'>
                Plan yours <FiArrowRight className='h-4 w-4' />
              </Link>
            )}
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5'>
            {DESTINATIONS.map((d, i) => (
              <div
                key={d.name}
                className={`group relative overflow-hidden rounded-2xl cursor-default ${
                  i === 0 ? 'md:row-span-2' : ''
                }`}
                style={{ aspectRatio: i === 0 ? 'auto' : '4/3' }}
              >
                <img
                  src={d.img}
                  alt={d.name}
                  className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
                <div className='absolute bottom-4 left-4 right-4'>
                  <span className='inline-block rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white/90 mb-1.5'>
                    {d.tag}
                  </span>
                  <p className='font-bold text-white text-lg leading-tight'>{d.name}</p>
                  <p className='text-white/70 text-sm'>{d.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className='py-16 bg-gray-50'>
        <div className='mx-auto max-w-6xl px-5 md:px-10'>
          <div className='text-center mb-12'>
            <p className='text-sm font-semibold text-[#f56551] uppercase tracking-widest mb-2'>Simple process</p>
            <h2 className='text-3xl font-bold text-gray-900'>How TripForge works</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 relative'>
            {/* Connecting line on desktop */}
            <div className='hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gray-200' />

            {[
              { n: '01', title: 'Pick your destination', desc: 'Search any city with smart autocomplete powered by Google Places.' },
              { n: '02', title: 'Set your preferences', desc: 'Tell us your duration, budget (cheap / moderate / luxury) and who is traveling.' },
              { n: '03', title: 'Get your full itinerary', desc: 'Gemini AI returns hotels, day plans and Google Maps links — ready instantly.' },
            ].map((step) => (
              <div key={step.n} className='flex flex-col items-center text-center'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[#f56551]/10 border-2 border-[#f56551]/20 mb-5 relative z-10'>
                  <span className='text-2xl font-black text-[#f56551]'>{step.n}</span>
                </div>
                <h3 className='font-bold text-gray-900 text-lg mb-2'>{step.title}</h3>
                <p className='text-sm text-gray-500 leading-relaxed max-w-xs'>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className='py-16 bg-white'>
        <div className='mx-auto max-w-6xl px-5 md:px-10'>
          <div className='text-center mb-12'>
            <p className='text-sm font-semibold text-[#f56551] uppercase tracking-widest mb-2'>Features</p>
            <h2 className='text-3xl font-bold text-gray-900'>Everything you need to plan</h2>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {FEATURES.map((f) => (
              <div key={f.title} className='rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow'>
                <span className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${f.color} mb-4`}>
                  {f.icon}
                </span>
                <h3 className='font-bold text-gray-900 mb-2'>{f.title}</h3>
                <p className='text-sm text-gray-500 leading-relaxed'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      {!user && (
        <section className='relative overflow-hidden py-20'>
          <img
            src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800&q=80&auto=format&fit=crop'
            alt='beach'
            className='absolute inset-0 h-full w-full object-cover object-center'
          />
          <div className='absolute inset-0 bg-[#f56551]/80' />
          <div className='relative z-10 mx-auto max-w-6xl px-5 md:px-10 text-center'>
            <h2 className='font-extrabold text-3xl md:text-4xl text-white mb-4 drop-shadow'>
              Ready to forge your next adventure?
            </h2>
            <p className='text-white/85 mb-8 text-base max-w-lg mx-auto'>
              Free to use · AI-generated plans · Google Maps links included
            </p>
            <button
              type='button'
              onClick={signIn}
              className='inline-flex items-center gap-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-base px-8 py-4 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]'
            >
              <FcGoogle className='h-6 w-6' />
              Sign in with Google — it's free
            </button>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className='bg-gray-900 text-gray-400 py-10'>
        <div className='mx-auto max-w-6xl px-5 md:px-10 flex flex-col md:flex-row items-center justify-between gap-5'>
          <div className='flex items-center gap-3'>
            <img src='/logo.svg' alt='TripForge' className='h-7 brightness-0 invert' />
            <span className='text-sm text-gray-500'>AI-powered travel planning</span>
          </div>
          <div className='flex flex-col items-center md:items-end gap-1'>
            <p className='text-sm'>Built by <span className='text-white font-semibold'>Pratham Raj</span></p>
            <p className='text-xs text-gray-600'>Verify hours & prices before travelling · AI-generated content</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
