import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiMail, HiArrowLeft, HiCheckCircle } from "react-icons/hi";
import { useAuthStore } from "./authStore";
import JvLogo from "./assets/jvlogo.png";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { forgotPassword, error, clearError } = useAuthStore();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email) return;

		setIsLoading(true);
		clearError();

		try {
			await forgotPassword(email);
			setIsSubmitted(true);
		} catch (err) {
			// Error is handled by authStore
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col items-center justify-center px-4">
			<div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-black/50 blur-3xl pointer-events-none"></div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="relative bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-md"
			>
				<div className="flex justify-center mb-6">
					<img src={JvLogo} alt="JV Logo" className="h-12 w-auto" />
				</div>

				{!isSubmitted ? (
					<>
						<h2 className="text-2xl font-bold mb-2 text-center">
							Forgot Password?
						</h2>
						<p className="text-gray-400 text-center mb-8 text-sm">
							Enter your email address and we'll send you a link to reset your
							password.
						</p>

						{error && (
							<div className="mb-4 p-3 bg-red-600/20 border border-red-500/50 rounded-lg text-red-200 text-xs">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								{/* <label className="block text-sm font-medium text-gray-300 mb-2">
									Email Address
								</label> */}
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full rounded-lg bg-gray-800/50 border border-white/10 p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
									placeholder="name@example.com"
									required
								/>
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-red-600/20 flex justify-center items-center"
							>
								{isLoading ? (
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								) : (
									"Send Reset Link"
								)}
							</button>
						</form>
					</>
				) : (
					<div className="text-center">
						<div className="flex justify-center mb-4">
							<HiCheckCircle className="h-16 w-16 text-green-500!" />
						</div>
						<h2 className="text-2xl font-bold mb-2">Check your email</h2>
						<p className="text-gray-400 mb-8 text-sm">
							If an account exists for{" "}
							<span className="text-white font-medium">{email}</span>, you will
							receive a password reset link shortly.
						</p>
						<button
							onClick={() => setIsSubmitted(false)}
							className="text-red-500 hover:text-red-400 text-sm font-medium transition"
						>
							Didn't receive an email? Try again
						</button>
					</div>
				)}

				<div className="mt-8 pt-6 border-t border-white/10 text-center">
					<a
						href="#/login"
						className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
					>
						<HiArrowLeft className="h-4 w-4" />
						Back to Sign In
					</a>
				</div>
			</motion.div>
		</div>
	);
};

export default ForgotPassword;
