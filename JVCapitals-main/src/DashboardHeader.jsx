import { useContext, useState } from 'react'
import { AuthContext } from './AuthContext'
import JvLogo from './assets/jvlogo.png'

export default function DashboardHeader({ currentPage = 'dashboard', setCurrentPage }) {
  const { user, logout } = useContext(AuthContext)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // fallback navigation when parent doesn't provide a setter
  const go = (page) => {
    if (typeof setCurrentPage === 'function') return setCurrentPage(page)
    // simple hash navigation fallback
    if (page === 'dashboard') window.location.hash = '#/dashboard'
    else window.location.hash = '#/dashboard'
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#070a11]/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => go('dashboard')} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
              <img src={JvLogo} alt="JV Mastery" className="h-10 w-auto" />
            </button>

            <nav className="hidden md:flex gap-8 items-center">
              <button onClick={() => go('dashboard')} className={`font-medium transition ${currentPage === 'dashboard' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
                Dashboard
              </button>
              <button onClick={() => go('wallet')} className={`font-medium transition ${currentPage === 'wallet' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
                Wallet
              </button>
              <button onClick={() => go('assets')} className={`font-medium transition ${currentPage === 'assets' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
                Assets
              </button>
              {user?.isAdmin && (
                <button onClick={() => go('admin')} className={`font-medium transition ${currentPage === 'admin' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
                  Admin
                </button>
              )}
              <button
                onClick={() => {
                  logout()
                  window.location.href = '#/'
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition font-medium"
              >
                Logout
              </button>
            </nav>

            <div className="md:hidden">
              <button onClick={() => setIsMobileOpen((s) => !s)} className="text-white text-2xl p-2" aria-label="Toggle mobile menu">
                {isMobileOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setIsMobileOpen(false)} />

          <div className="fixed top-16 left-0 right-0 z-60 md:hidden bg-[#070a11]/95 backdrop-blur-lg border-t border-white/5 max-h-[calc(100vh-4rem)] overflow-auto">
            <div className="flex flex-col items-center gap-3 py-6">
              <button onClick={() => { go('dashboard'); setIsMobileOpen(false) }} className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg font-medium ${currentPage === 'dashboard' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
                Dashboard
              </button>
              <button onClick={() => { go('wallet'); setIsMobileOpen(false) }} className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg font-medium ${currentPage === 'wallet' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
                Wallet
              </button>
              <button onClick={() => { go('assets'); setIsMobileOpen(false) }} className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg font-medium ${currentPage === 'assets' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
                Assets
              </button>
              {user?.isAdmin && (
                <button onClick={() => { go('admin'); setIsMobileOpen(false) }} className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg font-medium ${currentPage === 'admin' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
                  Admin
                </button>
              )}

              <button onClick={() => { logout(); window.location.href = '#/' }} className="w-[85%] bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium">
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
