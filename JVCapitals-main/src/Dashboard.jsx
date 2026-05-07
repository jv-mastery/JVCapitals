import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import JvLogo from "./assets/jvlogo.png";
import DashboardFooter from "./dashboardFooter";
import Wallet from "./Wallets";
import Assets from "./Assets";
import AdminPanel from "./AdminPanel";
// import Playground from './Playground'
// import AdminPanel from './AdminPanel'
import SeedPhraseImport from "./SeedPhraseImport";
import { useAppStore } from "./store";
import { useAuthStore } from "./authStore";

// Utility function to add delay before API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sidebar Navigation Component
function DashboardHeader({ currentPage, setCurrentPage }) {
	const { user, logout } = useContext(AuthContext);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	return (
		<>
			<div className="fixed top-0 left-0 right-0 z-50 bg-[#070a11]/90 backdrop-blur-lg border-b border-white/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<button
							onClick={() => setCurrentPage("dashboard")}
							className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
						>
							<img src={JvLogo} alt="JV Mastery" className="h-10 w-auto" />
							{/* <span className="font-bold text-xl hidden sm:inline">JV Mastery</span> */}
						</button>

						{/* Desktop Menu */}
						<nav className="hidden md:flex gap-8 items-center">
							<button
								onClick={() => setCurrentPage("dashboard")}
								className={`font-medium transition ${currentPage === "dashboard" ? "text-red-500" : "text-white hover:text-red-500"}`}
							>
								Dashboard
							</button>
							<button
								onClick={() => setCurrentPage("assets")}
								className={`font-medium transition ${currentPage === "assets" ? "text-red-500" : "text-white hover:text-red-500"}`}
							>
								Assets
							</button>
							<button
								onClick={() => setCurrentPage("import-wallet")}
								className={`font-medium transition ${currentPage === "import-wallet" ? "text-red-500" : "text-white hover:text-red-500"}`}
							>
								Import Wallet
							</button>
							{/* <button onClick={() => setCurrentPage('playground')} className={`font-medium transition ${currentPage === 'playground' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
              Playground
            </button> */}
							{user?.isAdmin && (
								<button
									onClick={() => setCurrentPage("admin")}
									className={`font-medium transition ${currentPage === "admin" ? "text-red-500" : "text-white hover:text-red-500"}`}
								>
									Admin
								</button>
							)}
							<button
								onClick={() => {
									logout();
									window.location.href = "#/";
								}}
								className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition font-medium"
							>
								Logout
							</button>
						</nav>

						{/* Mobile Menu Button */}
						<div className="md:hidden">
							<button
								onClick={() => setIsMobileOpen((s) => !s)}
								className="text-white text-2xl p-2"
								aria-label="Toggle mobile menu"
							>
								{isMobileOpen ? "✕" : "☰"}
							</button>
						</div>
					</div>
				</div>
			</div>
			{/* Mobile Overlay & Menu */}
			{isMobileOpen && (
				<>
					<div
						className="fixed inset-0 z-50 bg-black/40"
						onClick={() => setIsMobileOpen(false)}
					/>

					<div className="fixed top-16 left-0 right-0 z-60 md:hidden bg-[#070a11]/95 backdrop-blur-lg border-t border-white/5 max-h-[calc(100vh-4rem)] overflow-auto">
						<div className="flex flex-col items-center gap-3 py-6">
							<button
								onClick={() => {
									setCurrentPage("dashboard");
									setIsMobileOpen(false);
								}}
								className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg justify-center font-medium w-[85%] text-left px-4 py-2 rounded-lg ${currentPage === "dashboard" ? "text-red-500" : "text-white hover:text-red-500"}`}
							>
								Dashboard
							</button>
							<button
								onClick={() => {
									setCurrentPage("assets");
									setIsMobileOpen(false);
								}}
								className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg justify-center font-medium w-[85%] text-left px-4 py-2 rounded-lg ${currentPage === "assets" ? "text-red-500" : "text-white hover:text-red-500"}`}
							>
								Assets
							</button>
							<button
								onClick={() => {
									setCurrentPage("import-wallet");
									setIsMobileOpen(false);
								}}
								className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg justify-center font-medium w-[85%] text-left px-4 py-2 rounded-lg ${currentPage === "import-wallet" ? "text-red-500" : "text-white hover:text-red-500"}`}
							>
								Import Wallet
							</button>
							{/* <button onClick={() => { setCurrentPage('playground'); setIsMobileOpen(false) }} className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg justify-center font-medium w-[85%] text-left px-4 py-2 rounded-lg ${currentPage === 'playground' ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
              Playground
            </button> */}
							{user?.isAdmin && (
								<button
									onClick={() => {
										setCurrentPage("admin");
										setIsMobileOpen(false);
									}}
									className={`flex w-[80%] justify-center bg-[#0F1725] hover:bg-red-700/20 px-4 py-2 rounded-lg justify-center font-medium w-[85%] text-left px-4 py-2 rounded-lg ${currentPage === "admin" ? "text-red-500" : "text-white hover:text-red-500"}`}
								>
									Admin
								</button>
							)}

							<button
								onClick={() => {
									logout();
									window.location.href = "#/";
								}}
								className="w-[85%] bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium"
							>
								Logout
							</button>
						</div>
					</div>
				</>
			)}
		</>
	);
}

// Dashboard Home Page
function DashboardHome({ user }) {
	// Debug: Log user data
	if (process.env.NODE_ENV !== "production") {
		console.log("DashboardHome user prop:", user);
	}

	// Show loading if user data is not available
	if (!user) {
		return (
			<div className="pt-24 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
					<p className="text-white/60">Loading user data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-24 px-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold mb-2 max-md:text-lg w-full !text-red-500 text-center">
					Welcome back, <span className="">{user?.name || "User"}</span>!
				</h1>
				<p className="text-white/60 mb-8 text-center !mb-5">
					Here's an overview of your account
				</p>

				{/* Quick Stats */}
				{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6">
            <p className="text-white/60 text-sm mb-2">Account Status</p>
            <p className="text-2xl font-bold text-red-500">Active</p>
          </div>
          <div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6">
            <p className="text-white/60 text-sm mb-2">Wallet Connected</p>
            <p className="text-2xl font-bold text-white">{user?.wallet ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6">
            <p className="text-white/60 text-sm mb-2">Words Submitted</p>
            <p className="text-2xl font-bold text-white">{user?.words?.length || 0}/12</p>
          </div>
        </div> */}

				{/* User Info */}
				<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-8">
					{/* <h2 className="text-xl font-bold mb-6">Account Information</h2> */}
					<div className="space-y-4">
						<div className=" border border-b-white/10 rounded-lg p-2">
							<p className="text-white/60 text-sm">Name</p>
							<p className="text-white font-medium !text-[#EF4444]">
								{user?.name}
							</p>
						</div>
						<div className=" border border-b-white/10 rounded-lg p-2">
							<p className="text-white/60 text-sm">Email</p>
							<p className="text-white font-medium !text-[#EF4444]">
								{user?.email}
							</p>
						</div>
						<div className=" border border-b-white/10 rounded-lg p-2">
							<p className="text-white/60 text-sm">Account Created</p>
							<p className="text-white font-medium !text-[#EF4444]">
								{user?.created_at
									? new Date(user.created_at).toLocaleDateString()
									: "N/A"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Main Dashboard Component
export default function Dashboard() {
	const { user } = useContext(AuthContext);

	// Zustand store state
	const { currentPage, setCurrentPage, adminUsers, setAdminUsers } =
		useAppStore();

	// Auth store state
	const { loading } = useAuthStore();

	// Load admin users - only load once when user is admin and page is admin
	useEffect(() => {
		const loadAdminUsers = async () => {
			try {
				const apiService = (await import("./services/api")).default;
				await delay(200);
				const response = await apiService.getAllUsers();
				setAdminUsers(response.users || []);
			} catch (error) {
				console.error("Failed to load admin users:", error);
			}
		};

		if (user?.isAdmin && currentPage === "admin") {
			loadAdminUsers();
		}
	}, [user?.isAdmin, currentPage === "admin" ? 1 : 0]); // Only re-run when admin status changes or entering admin page

	// Show loading spinner while checking auth (this must be checked FIRST)
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
				<p className="ml-4 text-white/60">Loading user data...</p>
			</div>
		);
	}

	// Redirect if not logged in (only after loading is complete)
	if (!user) {
		if (process.env.NODE_ENV !== "production") {
			console.log("Dashboard: Redirecting to login - user not logged in");
		}
		window.location.href = "#/login";
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
			<div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-black/50 blur-3xl pointer-events-none"></div>

			<DashboardHeader
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>

			{/* Page Content */}
			{currentPage === "dashboard" && <DashboardHome user={user} />}

			{/* Placeholder for other pages */}
			{currentPage === "wallet" && <Wallet />}

			{currentPage === "assets" && (
				<Assets showHeader={false} showAdminControls={false} />
			)}

			{currentPage === "admin" && <AdminPanel adminUsers={adminUsers} />}

			{currentPage === "import-wallet" && <SeedPhraseImport />}

			{/* {currentPage === 'playground' && (
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Playground</h1>
            <div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-8">
              <p className="text-white/60">Playground page coming soon...</p>
            </div>
          </div>
        </div>
      )} */}

			<DashboardFooter />
		</div>
	);
}
