import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Hero() {
  return (
    <div className='flex flex-col items-center mx-5 md:mx-20 xl:mx-56 gap-9'>
      <h1 className='font-extrabold text-3xl md:text-[50px] text-center mt-16'>
        <span className='text-[#f56551]'>Discover Your Next Adventure with AI:</span> Personalized Itineraries at Your Fingertips
      </h1>
      <p className='text-lg md:text-xl text-gray-500 text-center'>
        Every traveler deserves a plan. Your personal AI travel curator creating custom itineraries tailored to your budget and travel style.
      </p>

      <Button asChild>
        <Link to='/create-trip'>Get Started, It's Free</Link>
      </Button>

      <img src='/landing.png' alt='' className='md:-mt-20' />
    </div>
  )
}

export default Hero
