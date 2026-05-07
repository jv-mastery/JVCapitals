
import { motion, useInView } from 'framer-motion' // eslint-disable-line no-unused-vars
import { useRef } from 'react'
import phase2img from './assets/phase2img.png'

export default function PhaseTwo() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, margin: "-100px" })
    return (
      <div ref={ref} className="discovery flex flex-col gap-6 my-10 mx-auto px-4 sm:px-8 md:px-20 items-center justify-center py-10 h-auto bg-gray-[#010101] rounded-2xl max-w-7xl w-full max-md:mt-10!  max-md:mt-20!">
        <p className=' max-sm:text-[22px] text-3xl font-bold text-center! text-[#CC0000]!'>Continue your journey to financial mastery</p>
        <p className='text-gray-300 text-lg text-center max-w-4xl'>Build upon your strong foundation with advanced strategies and practical implementation. Phase 2 focuses on actionable steps to accelerate your financial growth.</p>

        <div className="flex w-[95vw] justify-center gap-5 items-center flex-col lg:flex-row max-md:px-2!">
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h2
              className="text-3xl! font-bold text-white mb-4 text-[#CC0000]! max-md:text-center! max-md:text-[25px]!"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Strategic Implementation
            </motion.h2>
            <motion.p
              className="text-gray-300 text-lg mb-4 max-w-lg  max-md:text-center m-auto mb-5!"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Now that you have a solid foundation, it's time to put your knowledge into action. Learn proven strategies, develop multiple income streams, and master the art of wealth building through strategic planning and consistent execution.
            </motion.p>
           
            <ul className="text-gray-300 text-lg max-w-lg mt-1 list-disc list-inside max-md:mt-1 max-md:px-1">
              <motion.li
                className='font-semibold'
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                Master Multiple Income Strategies
              </motion.li>
              <motion.li
                className='font-semibold'
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                Develop Strategic Wealth-Building Plans
              </motion.li>
              <motion.li
                className='font-semibold'
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                Build Sustainable Financial Systems
              </motion.li>
            </ul>
          </motion.div>
          <motion.img
            src={phase2img}
            alt="Strategic Implementation"
            className="w-full max-w-md h-auto order-first lg:order-last"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>
    )
}
