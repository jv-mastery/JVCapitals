import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiLockClosed, HiCheckCircle } from "react-icons/hi";
import { useAuthStore } from "./authStore";
import JvLogo from "./assets/jvlogo.png";

const ResetPassword = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [token, setToken] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [localError, setLocalError] = useState("");

	const { resetPassword, error, clearError } = useAuthStore();

	useEffect(() => {
		const hash = window.location.hash;
		const searchParams = new URLSearchParams(hash.split("?")[1]);
		const tokenParam = searchParams.get("token");
		if (tokenParam) {
			setToken(tokenParam);
		} else {
			setLocalError("Invalid or missing reset token.");
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLocalError("");

		if (password.length < 6) {
			setLocalError("Password must be at least 6 characters.");
			return;
		}

		if (password !== confirmPassword) {
			setLocalError("Passwords do not match.");
			return;
		}

		setIsLoading(true);
		clearError();

		try {
			await resetPassword(token, password);
			setIsSuccess(true);
		} catch (err) {
			// Error handled by authStore
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col items-center justify-center px-4">
			<div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-black/50 blur-3xl pointer-events-none"></div>

			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="relative bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-md"
			>
				<div className="flex justify-center mb-6">
					<img src={JvLogo} alt="JV Logo" className="h-12 w-auto" />
				</div>

				{!isSuccess ? (
					<>
						<h2 className="text-2xl font-bold mb-2 text-center">
							Reset Password
						</h2>
						<p className="text-gray-400 text-center mb-8 text-sm">
							Enter your new password below.
						</p>

						{(error || localError) && (
							<div className="mb-4 p-3 bg-red-600/20 border border-red-500/50 rounded-lg text-red-200 text-xs">
								{error || localError}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									New Password
								</label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full rounded-lg bg-gray-800/50 border border-white/10 p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
									placeholder="••••••••"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Confirm New Password
								</label>
								<input
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="w-full rounded-lg bg-gray-800/50 border border-white/10 p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
									placeholder="••••••••"
									required
								/>
							</div>

							<button
								type="submit"
								disabled={isLoading || !!localError}
								className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-red-600/20 flex justify-center items-center"
							>
								{isLoading ? (
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								) : (
									"Update Password"
								)}
							</button>
						</form>
					</>
				) : (
					<div className="text-center">
						<div className="flex justify-center mb-4">
							<HiCheckCircle className="h-16 w-16 !text-green-500" />
						</div>
						<h2 className="text-2xl font-bold mb-2">Password Updated</h2>
						<p className="text-gray-400 mb-8 py-8 text-sm">
							Your password has been changed successfully.
						</p>
						<a
							href="#/login"
							className="block w-full bg-red-600 hover:bg-red-700 !text-white font-bold py-3 rounded-lg transition shadow-lg shadow-red-600/20 text-center"
						>
							Go to Login
						</a>
					</div>
				)}
			</motion.div>
		</div>
	);
};

export default ResetPassword;
