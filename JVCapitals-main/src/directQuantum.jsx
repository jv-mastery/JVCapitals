
import { motion, useInView } from 'framer-motion' // eslint-disable-line no-unused-vars
import { useRef } from 'react'
import SecurityIMG from './assets/securityIMG.jpg'
import MitigationIMG from './assets/mitigation.png'
// import TaxMitigation from './taxMitigation'

export default function DirectQuantum() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "-100px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className="flex flex-col w-full items-center justify-center gap-10 py-10"
      id='security'
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="why-warrior flex flex-col gap-6 mx-auto px-4 sm:px-8 md:px-20 items-center justify-center py-3 h-auto bg-[#070A11] rounded-2xl max-w-7xl w-full py-2"
      >
        <h1 className="!text-[#CC0000] text-3xl font-bold text-center">
          Direct Quantum Security
        </h1>
        <p className="text-gray-300 text-lg text-center max-w-4xl">
          With quantum security, partners are guaranteed asset recovery through chain analysis, exchange identification through KYC and on-chain forensic through Federal Bureau of Investigation (FBI). Using Direct Quantum Security requires a signup fee of $2000 and guarantees up to $5M
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-col gap-1 pt-0 px-10"
      >
        {/* <h1 className="text-3xl font-bold text-center !mb-5 !text-[#CC0000]">
          Purpose of This Playbook
        </h1> */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -35 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex w-full gap-5 mt-5 justify-center max-md:flex-col max-md:flex-col-reverse !w-[95vw] !py-5 items-center flex-col lg:flex-row !max-md:py-0!"
        >
          <div className="flex flex-col text-gray-800 min-w-[50%] max-w-4xl m-auto bg-gray-600/20 w-[100%] max-md:h-full max-md:py-5 h-[350px] itens-center flex flex-col justify-center rounded-2xl !px-8 justify-center">
            <h2 className="max-md:text-center !mb-[30px] !text-[#CC0000]">
              Benefits of using Direct Quantum Security:
              </h2>
            <ul className="list-disc pl-6 space-y-2 !max-md:h-full text-gray-300 text-lg">
              <li
              ref={ ref }
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              >Full Asset Recovery Guarantee</li>
              <li>Funds are not locked in your wallet and so can be used, swapped or bridged anytime partners wish</li>
              <li>No minimum amount required</li>
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex w-full justify-center w-[50%] !m-auto h-[350px] itens-center flex flex-col justify-center rounded-2xl mt-[20px]"
          >
            <motion.img
              src={SecurityIMG}
              alt="Quantum Security symbol"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className='w-[100%] h-[300px] h-full rounded-2xl max-md:w-[100%] max-md:h-[250px] object-cover'
            />
          </motion.div>
       </motion.div>
      </motion.div>
    {/* <TaxMitigation /> */}
  </motion.div>
  )
}