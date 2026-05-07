import { motion } from 'framer-motion'
import JvLogo from './assets/jvlogo.png'
// import { FaSquareInstagram } from "react-icons/fa6";
import { FaSquareWhatsapp } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";


export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    // { 
    //   category: 'Program', 
    //   links: [
    //     { label: 'Home', href: '#home' },
    //     { label: 'Phase 1', href: '#phase1' },
    //     { label: 'Phase 2', href: '#phase2' },
    //     { label: 'Phase 3', href: '#phase3' }
    //   ] 
    // },
    // { 
    //   category: 'Learn', 
    //   links: [
    //     { label: 'Asset Protection', href: '#assetProtection' },
    //     { label: 'Tax Mitigation', href: '#taxMitigation' },
    //     { label: 'Staking Security', href: '#stakingSecurity' },
    //     { label: 'Why Warrior', href: '#whywarrior' }
    //   ] 
    // },
    { 
      category: 'Support', 
      links: [
        { label: 'Contact Us', href: '#contact' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' }
      ] 
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  return (
    <motion.footer
      id='contact'
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className="mt-12 md:mt-16 bg-red-500/5 border-t border-white/10 py-5 px-4 md:px-8 lg:px-10"
    >
      <div className="max-w-7xl mx-auto bg-gray-900/50 rounded-lg p-8 w-full">
        {/* Top Section: Logo and Description */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-50 mb-0 justify-between pb-8"
        >
          {/* Brand Section */}
          <div className="md:col-span-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 mb-4"
            >
              <img src={JvLogo} alt="JV Mastery Logo" className="h-10 w-auto" />
            </motion.div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering financial warriors to achieve complete freedom through proven strategies and professional guidance.
            </p>
            <div className="flex gap-4 mt-10">
              {[
                { name: 'gmail', url: 'mailto:coachjvmastery@gmail.com', icon: <SiGmail /> },
                // { name: 'instagram', url: 'https://www.instagram.com/coachjv_mastery', icon: <FaSquareInstagram /> },
                { name: 'whatsapp', url: 'http://wa.me/17272030987', icon: <FaSquareWhatsapp /> }
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target={social.url.startsWith('http') && !social.url.includes('wa.me') ? "_blank" : undefined}
                  rel={social.url.startsWith('http') && !social.url.includes('wa.me') ? "noopener noreferrer" : undefined}
                  whileHover={{ scale: 1.2, color: '#EF4444' }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center !text-[#CC0000] hover:bg-[#8e0404] transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          {footerLinks.map((section) => (
            <motion.div key={section.category} variants={itemVariants} className='flex flex-col gap-1 lg:ml-8'>
              <h4 className="text-white font-semibold text-lg mb-4">{section.category}</h4>

              <ul className="space-y-2 gap-5 flex flex-col">
                {section.links.map((link) => (
                  <motion.li
                    key={link.label}
                    whileHover={{ x: 4, color: '#CC0000' }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-red-500 transition-colors text-sm !hover:text-[#CC0000]"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm text-center sm:text-left">
            © {currentYear} JV Mastery Academy. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  )
}
