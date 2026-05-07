import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Freedom() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "-100px" })

  return (
    <div ref={ref} className="flex flex-col rounded-2xl my-10 mx-auto px-4 sm:px-8 md:px-20 py-10 items-center justify-center max-w-7xl w-full">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-xl font-bold text-center mt-10 !text-[#CC0000] max-sm:text-2xl!"
      >
        The future of wealth starts with security.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="text-center mt-4 text-lg text-gray-300 max-w-4xl"
      >
        Do you feel like you’re constantly running in place, struggling to make meaningful progress in your personal or financial life? Are you concerned about safeguarding your assets against evolving risks such as hacks, quantum computers threats and on-chain vulnerabilities?
        <br /><br />
        Welcome to 3T Warrior Academy - where security is the foundation, and sustainable revenue becomes a natural advantage.
      </motion.p>
    </div>
  )
}