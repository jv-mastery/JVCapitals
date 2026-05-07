import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import JvLogo from "./assets/jvlogo.png";
import Footer from "./footer";
import apiService from "./services/api";

// Utility function to add delay before API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Signup() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [isAdminChecked, setIsAdminChecked] = useState(false);
	const [adminCode, setAdminCode] = useState("");
	const { signup, login } = useContext(AuthContext);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		// Validation
		if (!name.trim()) {
			setError("Name is required");
			return;
		}
		if (!email.trim()) {
			setError("Email is required");
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setLoading(true);
		try {
			if (isAdminChecked) {
				// Use admin signup endpoint for admin account creation
				await delay(200);
				await apiService.adminSignup({
					name,
					email,
					password,
					adminCode,
				});

				// After admin signup, login to set proper authentication state
				// This ensures token and user state are set correctly
				await login(email, password);

				// Redirect to dashboard
				window.location.href = "#/dashboard";
			} else {
				// Use regular signup for regular users
				await signup({ name, email, password });
				// Redirect to dashboard
				window.location.href = "#/dashboard";
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
			{/* Header */}
			<header className="border-b border-white/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
					<div className="flex items-center justify-between">
						<a href="#/" className="flex items-center gap-2">
							<img src={JvLogo} alt="JV Mastery Logo" className="h-10 w-auto" />
							{/* <span className="font-bold text-xl">JV Mastery</span> */}
						</a>
						<a
							href="#/"
							className="text-sm font-medium hover:text-red-500 transition"
						>
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

					<h2 className="text-3xl font-bold mb-2 text-center animate-fade-from-left">
						Create Account
					</h2>
					<p className="text-white/60 text-center mb-8 text-sm animate-fade-from-left animation-delay-100">
						Join the JV Mastery Program
					</p>

					{error && (
						<div className="mb-4 p-3 bg-red-600/30 border border-red-500 rounded-lg text-red-200 text-sm">
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-4 mt-6 animate-fade-from-left animation-delay-200"
					>
						{/* Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-white mb-2"
							>
								Full Name
							</label>
							<input
								type="text"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								placeholder="John Doe"
								className="w-full rounded-lg bg-gray-800/50  border border-b-white/10 rounded-lg p-2 text-white placeholder-gray-500 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
							/>
						</div>

						{/* Email */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-white mb-2"
							>
								Email Address
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								placeholder="you@example.com"
								className="w-full rounded-lg bg-gray-800/50  border border-b-white/10 rounded-lg p-2 text-white placeholder-gray-500 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
							/>
						</div>

						{/* Password */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-white mb-2"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								placeholder="••••••••"
								className="w-full rounded-lg bg-gray-800/50  border border-b-white/10 rounded-lg p-2 text-white placeholder-gray-500 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
							/>
						</div>

						{/* Confirm Password */}
						<div>
							<label
								htmlFor="confirm-password"
								className="block text-sm font-medium text-white mb-2"
							>
								Confirm Password
							</label>
							<input
								type="password"
								id="confirm-password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								placeholder="••••••••"
								className="w-full rounded-lg bg-gray-800/50  border border-b-white/10 rounded-lg p-2 text-white placeholder-gray-500 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
							/>
						</div>

						{/* Admin signup (optional) */}
						<div className="mt-2">
							<label className="inline-flex items-center gap-2">
								<input
									type="checkbox"
									checked={isAdminChecked}
									onChange={(e) => setIsAdminChecked(e.target.checked)}
									className="form-checkbox h-4 w-4 text-red-500"
								/>
								<span className="text-sm text-white/80">Sign up as admin</span>
							</label>
							{isAdminChecked && (
								<input
									type="text"
									value={adminCode}
									onChange={(e) => setAdminCode(e.target.value)}
									placeholder="Admin code"
									className="mt-2 w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
								/>
							)}
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition shadow-lg shadow-red-600/40"
						>
							{loading ? "Creating Account..." : "Create Account"}
						</button>
					</form>

					{/* Toggle to Login */}
					<div className="mt-6 pt-6 border-t border-white/10 text-center">
						<p className="text-white/60 text-sm">
							Already have an account?{" "}
							<a
								href="#/login"
								className="text-red-500 hover:text-red-400 font-medium transition"
							>
								Sign In
							</a>
						</p>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}
