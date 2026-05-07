import { motion, useInView } from "framer-motion"
import { useRef } from "react"

import pfp1 from "./assets/pfp1.jpg"
import pfp4 from "./assets/pfp4.png"
import pfp3 from "./assets/pfp3.jpg"
import pfp5 from "./assets/pfp5.jpg"

export default function Opinion() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "-100px" })

  return (
    <div
      ref={ref}
      className="flex flex-col gap-6 py-10 mx-auto px-4 sm:px-8 md:px-20 items-center justify-center bg-[#0B111E] rounded-2xl max-w-7xl w-full"
    >
      {/* ===== HEADER ===== */}

      <motion.h1
        className="text-white text-3xl font-bold text-center"
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Over 12,000 financial warriors have taken the{" "}
        <b className="text-[#CC0000]">5P Framework</b> and transformed their
        financial lives.
      </motion.h1>

      <motion.p
        className="text-gray-300 text-lg text-center max-w-4xl"
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Now it's your turn! Join the movement and take control of your financial
        future today!
      </motion.p>

      {/* ===== CARDS ===== */}

      <div className="flex flex-wrap w-full justify-center gap-5 items-center flex-col lg:flex-row">

        {/* Card 1 */}
        <motion.div
        className="
          w-full max-w-sm
          bg-gray-500/15
          p-6 sm:p-7
          rounded-xl
          flex flex-col items-center
          text-center
          gap-5
          mx-auto
        "
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >

        {/* IMAGE */}
        <motion.img
          src={pfp1}
          alt="Logan Mitchell"
          className="
            w-28 h-28
            sm:w-32 sm:h-32
            md:w-36 md:h-36
            rounded-full
            object-cover
          "
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        />

        {/* NAME */}
        <motion.h2
          className="text-2xl sm:text-3xl font-bold !text-[#CC0000]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Logan Mitchell
        </motion.h2>

        {/* TEXT */}
        <motion.p
          className="
            text-gray-300
            text-base sm:text-lg
            leading-relaxed
          "
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          I lost $150,000 to a hacker but I had my wallets under 3T warrior, took me just 3months to gety full asset back. I remain grateful to JV and his entire team 
        </motion.p>

      </motion.div>



        {/* Card 2 */}
        <motion.div
          className="
            w-full max-w-sm
            bg-gray-500/15
            p-6 sm:p-7
            rounded-xl
            flex flex-col items-center
            text-center
            gap-5
            mx-auto
          "
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.6 }}
         >

        {/* IMAGE */}
        <motion.img
          src={pfp3}
          alt="Logan Mitchell"
          className="
            w-28 h-28
            sm:w-32 sm:h-32
            md:w-36 md:h-36
            rounded-full
            object-cover
          "
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        />

        {/* NAME */}
        <motion.h2
          className="text-2xl sm:text-3xl font-bold !text-[#CC0000]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Logan Mitchell
        </motion.h2>

        {/* TEXT */}
        <motion.p
          className="
            text-gray-300
            text-base sm:text-lg
            leading-relaxed
          "
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          I was among the victims of FTX crash in 2022, lost $1M because I left my funds in a centralised exchange. Decided to move to 3T quantum staking with my remaining assets and I have been feeding my family from monthly revenue since 2024
        </motion.p>

      </motion.div>



        {/* Card 3 */}
      <motion.div
        className="
          w-full max-w-sm
          bg-gray-500/15
          p-6 sm:p-7
          rounded-xl
          flex flex-col items-center
          text-center
          gap-5
          mx-auto
        "
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >

        {/* IMAGE */}
        <motion.img
          src={pfp4}
          alt="Logan Mitchell"
          className="
            w-28 h-28
            sm:w-32 sm:h-32
            md:w-36 md:h-36
            rounded-full
            object-cover
          "
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        />

        {/* NAME */}
        <motion.h2
          className="text-2xl sm:text-3xl font-bold !text-[#CC0000]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Logan Mitchell
        </motion.h2>

        {/* TEXT */}
        <motion.p
          className="
            text-gray-300
            text-base sm:text-lg
            leading-relaxed
          "
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          I make up to $600 monthly from 3T quantum staking and still have my capital 100% in my wallet 
        </motion.p>

      </motion.div>


        {/* Card 4 */}
        <motion.div
        className="
          w-full max-w-sm
          bg-gray-500/15
          p-6 sm:p-7
          rounded-xl
          flex flex-col items-center
          text-center
          gap-5
          mx-auto
        "
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >

        {/* IMAGE */}
        <motion.img
          src={pfp5}
          alt="Logan Mitchell"
          className="
            w-28 h-28
            sm:w-32 sm:h-32
            md:w-36 md:h-36
            rounded-full
            object-cover
          "
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        />

        {/* NAME */}
        <motion.h2
          className="text-2xl sm:text-3xl font-bold !text-[#CC0000]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Logan Mitchell
        </motion.h2>

        {/* TEXT */}
        <motion.p
          className="
            text-gray-300
            text-base sm:text-lg
            leading-relaxed
          "
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          I doubted something like this existed till I met 3T. I'm all in and hope it stays forever, I don't chase get rich quick I'm OK with the monthly revenue knowing well it's all a bonus added to security guarantee and 100% asset maintenance
        </motion.p>

      </motion.div>
      </div>
    </div>
  )
}