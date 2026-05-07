

import { motion, useInView } from 'framer-motion' // eslint-disable-line no-unused-vars
import { useRef } from 'react'
import phase4img from './assets/phase3.webp'

export default function PhaseThree() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, margin: "-100px" })
    return (
      <div ref={ref} className="discovery flex flex-col gap-6 my-10 mx-auto px-4 sm:px-8 md:px-20 items-center justify-center py-3 h-auto bg-gray-[#010101] rounded-2xl max-w-7xl w-full">

        <div className="flex w-[95vw] justify-center gap-5 items-center flex-col lg:flex-row max-md:px-2!" id='phase1'>
          <motion.img
            src={phase4img}
            alt="Discovery"
            className="w-full max-w-md h-auto"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <div className="flex flex-col">
            <motion.h2
              className="text-3xl! font-bold text-white mb-4 text-[#CC0000]!  max-md:text-center! max-md:text-[25px]!"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Advanced Implementation
            </motion.h2>
            <motion.p
              className="text-gray-300 text-lg mb-4 max-w-lg lg:mb-5! max-md:text-center m-auto mb-5!"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              With a firm understanding of the rules to the game and the inner work you're doing from phase 1, it's time to get practical...and honest. Here you'll learn the truth of your current situation and be guided to identify areas of weakness so you can get your house in order.
            </motion.p>
            
            <ul className="text-gray-300 text-lg max-w-lg mt-1 list-disc list-inside">
              <motion.li
                className='font-semibold'
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                Identify Income & Expenses
              </motion.li>
              <motion.li
                className='font-semibold'
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                Inventory & organize current debt and non-negotiables
              </motion.li>
              <motion.li
                className='font-semibold'
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                Learn to budget effectively and optimize for growth.
              </motion.li>
            </ul>
          </div>
        </div>
      </div>
    )
}