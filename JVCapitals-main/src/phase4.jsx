

import { motion, useInView } from 'framer-motion' // eslint-disable-line no-unused-vars
import { useRef } from 'react'
import phase4img from './assets/phase4.webp'

export default function PhaseFour() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, margin: "-100px" })
    return (
      <div ref={ref} className="discovery flex flex-col gap-6 my-10 mx-auto px-4 sm:px-8 md:px-20 items-center justify-center py-3 h-auto bg-gray-[#010101] rounded-2xl max-w-7xl w-full">

        <div className="flex w-[95vw] justify-center  max-md:flex-col-reverse gap-5 items-center flex-col lg:flex-row max-md:px-2!" id='phase2'>
          
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h2
              className="text-3xl! font-bold text-white mb-4 text-[#CC0000]!  max-md:text-center! max-md:text-[25px]!"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Mastery & Growth
            </motion.h2>
            <motion.p
              className="text-gray-300 text-lg mb-4 max-w-lg lg:mb-5! max-md:text-center m-auto mb-5!"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              You've made significant progress, and now it's time to take your financial journey to the next level. In this phase, you'll learn advanced strategies for maximizing your income, building wealth, and creating sustainable financial systems.
            </motion.p>
            
            <ul className="text-gray-300 text-lg max-w-lg mt-1 list-disc list-inside">
              <motion.li
                className='font-semibold'
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                Discover Investment Avenues & Strategies
              </motion.li>
              {/* <motion.li
                className='font-semibold'
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                Learn to research and find the best opportunities
              </motion.li> */}
              <motion.li
                className='font-semibold'
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                Master the skills of entrepreneurship.
              </motion.li>
            </ul>
          </motion.div>
          <motion.img
            src={phase4img}
            alt="Discovery"
            className="w-full max-w-md h-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>
    )
}