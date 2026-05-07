import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { MdAddIcCall } from "react-icons/md";


export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col gap-6 my-10 mx-auto px-4 sm:px-8 md:px-20 items-center justify-center py-10 bg-[#010101] rounded-2xl max-w-7xl w-full"
    >
      {/* ===== TITLE ===== */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-white text-3xl font-bold text-center"
      >
        Get In Touch
      </motion.h1>

      {/* ===== DESCRIPTION ===== */}
      <motion.p
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-gray-300 text-lg text-center max-w-4xl"
      >
        Ready to start your journey to financial freedom? Contact us today and
        let's discuss how we can help you achieve your goals.
      </motion.p>

      {/* ===== CONTACT LIST ===== */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col gap-6 mt-8 w-full max-w-md"
      >
        {/* PHONE */}
        <motion.a
          href="tel:+1234567890"
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition"
        >
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            📞
          </div>

          <div>
            <h3 className="text-white font-semibold">Phone</h3>
            <p className="text-gray-300">+1 (234) 567-8900</p>
          </div>
        </motion.a>

        {/* EMAIL */}
        <motion.a
          href="mailto:info@jvmastery.com"
          initial={{ opacity: 0, x: 60 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition"
        >
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            ✉️
          </div>

          <div>
            <h3 className="text-white font-semibold">Email</h3>
            <p className="text-gray-300">info@jvmastery.com</p>
          </div>
        </motion.a>
       
      </motion.div>

    </motion.section>
  )
}