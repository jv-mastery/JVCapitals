
import { motion } from "framer-motion"

import portfolio from "./assets/portfolio.png"
import jvlive from "./assets/jvlive2.png"

export default function Searching() {
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.5 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="w-full my-10 mx-auto px-4 sm:px-8 md:px-20 py-10 max-w-7xl bg-[#180707]">

      {/* ===== HEADER ===== */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, margin: "-120px" }}
        className="text-center"
      >
        <motion.h2 variants={item} className="mt-10 mb-5">
          The education community and support you've been searching for
        </motion.h2>

        <motion.p variants={item}>
          Join the JV Academy and get exclusive access to a wealth of resources
          designed to accelerate your transformation.
        </motion.p>
      </motion.div>

      {/* ===== BLOCK 1 ===== */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, margin: "-120px" }}
        className="flex flex-col w-full mt-10 items-center gap-5"
      >
        <motion.b variants={item} className="text-[#CC0000] font-bold text-xl mt-10">
          Included
        </motion.b>

        <motion.h1 variants={item}>
          Coach JV's Professional portfolio
        </motion.h1>

        <motion.p variants={item}>
          We believe in transparency. Get instant access to CJV's personal investment portfolio.
        </motion.p>

        <motion.img
          src={portfolio}
          alt="Portfolio"
          className="w-[400px] mt-[-80px]"
          variants={item}
        />
      </motion.div>

      {/* ===== BLOCK 2 ===== */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, margin: "-120px" }}
        className="flex flex-col w-full mt-10 items-center gap-10"
      >
        <motion.b variants={item} className="text-[#CC0000] font-bold text-xl mt-10">
          Included
        </motion.b>

        <motion.h1 variants={item}>
          Daily livestreams with Coach JV
        </motion.h1>

        <motion.p variants={item}
        className="!mb-5"
        >
          Engage with our leaders during live interactive training events & workshops.
        </motion.p>

        <motion.img
          src={jvlive}
          alt="Livestream"
          className="w-[600px] lg:w-[700px] mt-[-50px]"
          variants={item}
        />
      </motion.div>

      {/* BUTTON */}
      <motion.a
        href="#signup"
        className="bg-[#9F0000] hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-[90%] mt-10 mx-auto block text-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Get Started Now!
      </motion.a>

    </section>
  )
}