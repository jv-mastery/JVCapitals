import yahoo from './assets/yahoo.png'
import digitaljournal from './assets/digitaljournal.png'
import thesun from './assets/thesun.png'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Baseline() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, margin: "-100px" })

    return (
      <div ref={ref} className="baseline flex flex-col gap-6 max-sm:my-2 my-10 mx-auto px-4 sm:px-8 md:px-20 items-center justify-center py-10 h-auto bg-[#010101] rounded-2xl max-w-7xl w-full">
        <motion.p
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className='text-white max-sm:text-[22px] text-3xl font-bold text-center'
        >
          Take Control of Your Future with Coach JV Academy
        </motion.p>
        <div className="list flex gap-2 flex-wrap justify-center items-center w-full px-5 h-auto max-sm:flex-wrap">
          <motion.img
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            src={yahoo} alt="" className="logo w-[80px] sm:w-[100px] h-16 sm:h-20"
          />
          <motion.img
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            src={digitaljournal} alt="" className="logo w-[120px] sm:w-[150px] h-16 sm:h-20"
          />
          <motion.img
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            src={thesun} alt="" className="logo w-[120px] sm:w-[150px] h-8 sm:h-10"
          />
          <motion.img
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            src={digitaljournal} alt="" className="logo w-[120px] sm:w-[150px] h-16 sm:h-20"
          />
          <motion.img
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            src={yahoo} alt="" className="logo w-[80px] sm:w-[100px] h-16 sm:h-20"
          />
          <motion.img
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            src={thesun} alt="" className="logo w-[120px] sm:w-[150px] h-8 sm:h-10"
          />
        </div>
      </div>
    )
}