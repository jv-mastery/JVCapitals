import { useState } from "react"
import JvLogo from "./assets/jvlogo.png"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Program", href: "#security" },
    { name: "About", href: "#about" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Warrior", href: "#warrior" },
    { name: "Contact", href: "#contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ===== NAV BAR ===== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-3">
        <div
          className="flex items-center justify-between
          bg-[#070a11]/90 backdrop-blur-lg
          border border-white/10 rounded-lg
          px-6 py-3 shadow-lg"
        >
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <img
              src={JvLogo}
              alt="JV Mastery Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* ===== DESKTOP NAV ===== */}
          <nav className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-red-500 transition font-medium"
              >
                {item.name}
              </a>
            ))}
            <a
              href="#/signup"
              className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition font-medium"
            >
              Sign Up
            </a>
          </nav>
          {/* <nav className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-red-500 transition font-medium"
              >
                {item.name}
              </a>
            ))}
            <a
              href="#auth"
              className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition font-medium"
            >
              Sign In
            </a>
          </nav> */}

          {/* ===== MOBILE BUTTON ===== */}
          <div className="flex items-center gap-4 md:hidden">
            {/* <a
              href="#auth"
              className="text-white hover:text-red-500 transition font-medium text-sm"
            >
              Sign In
            </a> */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="text-white text-2xl p-2"
              aria-label="Toggle navigation menu"
              type="button"
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      <div>
        {isOpen && (
          <div
            className="fixed inset-0 z-[998] bg-black/30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
        <nav
          className={`fixed top-16 left-0 right-0 z-[999] md:hidden transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'} backdrop-blur-lg border-b border-white/10 bg-[#070a11]/95 max-h-[calc(100vh-4rem)] overflow-auto`}
        >
          <div className="flex flex-col items-center w-full py-6 gap-4">
            {navItems.map((item, index) => {
              const animationClass = index % 2 === 0 ? 'animate-slide-from-left' : 'animate-slide-from-right'
              const delayClass = index === 0 ? 'animation-delay-100' : index === 1 ? 'animation-delay-150' : index === 2 ? 'animation-delay-200' : index === 3 ? 'animation-delay-250' : 'animation-delay-300'

              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg transition font-medium ${animationClass} ${delayClass}`}
                >
                  {item.name}
                </a>
              )
            })}

            <a
              href="#/signup"
              onClick={() => setIsOpen(false)}
              className="flex w-[80%] justify-center text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition font-medium animate-slide-from-left animation-delay-350"
            >
              Sign Up
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}