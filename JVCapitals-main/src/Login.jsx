import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import JvLogo from "./assets/jvlogo.png";
import Footer from "./footer";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useContext(AuthContext);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);
			// clear form fields
			setEmail("");
			setPassword("");
			// Small delay to ensure auth state is updated
			setTimeout(() => {
				window.location.href = "#/dashboard";
			}, 100);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
			{/* Header */}
			<header className="border-b border-white/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
					<div className="flex items-center justify-between">
						<a href="/" className="flex items-center gap-2">
							<img src={JvLogo} alt="JV Mastery Logo" className="h-10 w-auto" />
						</a>
						<a
							href="/"
							className="text-sm font-medium hover:text-red-500 transition"
						>
							Back to Home
						</a>
					</div>
				</div>
			</header>

			{/* Auth Form */}
			<div className="flex-1 flex items-center justify-center px-4 py-8">
				<div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-black/50 blur-3xl !mb-30 pointer-events-none"></div>

				<div className="relative bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-8 shadow-lg w-full max-w-md animate-fade-up">
					<div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-red-600/10 via-red-600/5 to-transparent blur-2xl" />

					<h2 className="text-3xl font-bold mb-2 text-center animate-fade-from-left">
						Sign In
					</h2>
					<p className="text-white/60 text-center mb-8 text-sm animate-fade-from-left animation-delay-100">
						Welcome back to JV Mastery
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

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition shadow-lg shadow-red-600/40"
						>
							{loading ? "Signing In..." : "Sign In"}
						</button>
					</form>

					{/* Toggle to Signup */}
					<div className="mt-6 pt-6 border-t border-white/10 text-center">
						<p className="text-white/60 text-sm">
							Don't have an account?{" "}
							<a
								href="#/signup"
								className="text-red-500 hover:text-red-400 font-medium transition"
							>
								Sign Up
							</a>
						</p>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}
