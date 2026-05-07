
import { motion, useInView } from 'framer-motion' // eslint-disable-line no-unused-vars
import { useRef } from 'react'
import phase5img from './assets/phase5.webp'

export default function PhaseFive() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, margin: "-100px" })
    return (
      <div ref={ref} className="discovery flex flex-col gap-6 my-10 mx-auto px-4 sm:px-8 md:px-20 items-center justify-center py-3 h-auto bg-gray-[#010101] rounded-2xl max-w-7xl w-full">

        <div className="flex w-[95vw] justify-center gap-5 items-center flex-col lg:flex-row max-md:px-2!">
          <img src={phase5img} alt="Discovery" className="w-full max-w-md h-auto" />
          <div className="flex flex-col">
            <h2 className="text-3xl! font-bold text-white mb-4 text-[#CC0000]!  max-md:text-center! max-md:text-[25px]!">Wealth Protection</h2>
            <p className="text-gray-300 text-lg mb-4 max-w-lg lg:mb-5! max-md:text-center m-auto mb-5!">
              Protecting your wealth is as important as building it. The Wealth Protection phase will educate you on how the wealthy protect their assets and structure their lives to create a legacy for future generations.
            </p>
            
            <ul className="text-gray-300 text-lg max-w-lg mt-1 list-disc list-inside">
              <li className='font-semibold'>Discover ways to structure your assets to create legacy</li>
              <li className='font-semibold'>Mastering & Sharing this knowledge and literacy with the next generation</li>
            </ul>
          </div>
        </div>
      </div>
    )
}