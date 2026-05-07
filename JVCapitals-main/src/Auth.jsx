import { useState } from 'react'
import JvLogo from './assets/jvlogo.png'

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle authentication logic here
    console.log(isRegistering ? 'Registering' : 'Logging in', email)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src={JvLogo} alt="JV Mastery Logo" className="h-10 w-auto" />
              {/* <span className="font-bold text-xl">JV Mastery</span> */}
            </a>
            <a href="/" className="text-sm font-medium hover:text-red-500 transition !text-md !font-bold !text-[#BE0101]">
              Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-black/50 blur-3xl pointer-events-none"></div>
        
        <div className="relative bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-8 shadow-lg w-full max-w-md animate-fade-up">
          <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-red-600/10 via-red-600/5 to-transparent blur-2xl" />
          
          <h2 className="text-3xl font-bold !text-2xl mb-2 text-center animate-fade-from-left">
            {isRegistering ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-white/60 text-center mb-8 text-sm !text-[#BE0101] font-bold animate-fade-from-left animation-delay-100">
            {isRegistering
              ? 'Join the 3T Warrior Program today'
              : 'Welcome back to your account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6 animate-fade-from-left animation-delay-200">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password (Register only) */}
            {isRegistering && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-white mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-lg shadow-red-600/40 font-bold"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Form Type */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="!text-[#BE0101] !font-bold hover:text-red-400 font-medium transition"
              >
                {isRegistering ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
