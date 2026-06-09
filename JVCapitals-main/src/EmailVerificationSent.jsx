import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiMail, HiArrowLeft, HiRefresh } from "react-icons/hi";
import { useAuthStore } from "./authStore";
import JvLogo from "./assets/jvlogo.png";

const EmailVerificationSent = () => {
	const [email, setEmail] = useState("");
	const [countdown, setCountdown] = useState(60);
	const [canResend, setCanResend] = useState(false);
	const [resendStatus, setResendStatus] = useState(null); // 'idle', 'sending', 'success', 'error'
	const { resendVerification, error, clearError } = useAuthStore();

	useEffect(() => {
		// Extract email from URL query params
		const hash = window.location.hash;
		const searchParams = new URLSearchParams(hash.split("?")[1]);
		const emailParam = searchParams.get("email");
		if (emailParam) setEmail(emailParam);

		// Timer logic
		let timer;
		if (countdown > 0 && !canResend) {
			timer = setInterval(() => {
				setCountdown((prev) => prev - 1);
			}, 1000);
		} else {
			setCanResend(true);
		}

		return () => clearInterval(timer);
	}, [countdown, canResend]);

	const handleResend = async () => {
		if (!canResend || !email) return;

		setResendStatus("sending");
		try {
			clearError();
			await resendVerification(email);
			setResendStatus("success");
			setCanResend(false);
			setCountdown(60);
			// Show success message for 5 seconds
			setTimeout(() => setResendStatus(null), 5000);
		} catch (err) {
			setResendStatus("error");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col items-center justify-center px-4">
			<div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-black/50 blur-3xl pointer-events-none"></div>

			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="relative bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-2xl p-10 shadow-2xl w-full max-w-md text-center overflow-hidden"
			>
				<div className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-br from-red-600/10 via-red-600/5 to-transparent blur-2xl" />

				<div className="flex justify-center mb-6">
					<div className="bg-red-600/20 p-4 rounded-full border border-red-500/30">
						<HiMail className="h-12 w-12 text-red-500" />
					</div>
				</div>

				<h2 className="text-3xl font-bold mb-4 text-white">Check your email</h2>

				<p className="text-gray-400 mb-6 leading-relaxed">
					We've sent a verification link to <br />
					<span className="font-semibold text-white block mt-1">{email}</span>
				</p>

				<p className="text-sm text-gray-500 mb-8 px-4">
					Please click the link in the email to activate your account. If you
					don't see it, check your spam folder.
				</p>

				<div className="pt-8 border-t border-white/10">
					<p className="text-sm text-gray-400 mb-4">Didn't receive the email?</p>

					<button
						onClick={handleResend}
						disabled={!canResend || resendStatus === "sending"}
						className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
							canResend
								? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40 transform hover:-translate-y-0.5 active:translate-y-0"
								: "bg-white/5 text-gray-500 cursor-not-allowed"
						}`}
					>
						{resendStatus === "sending" ? (
							<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						) : (
							<HiRefresh className={canResend ? "h-5 w-5" : "h-5 w-5 opacity-30"} />
						)}
						{canResend
							? "Resend verification email"
							: `Resend in ${countdown}s`}
					</button>

					{resendStatus === "success" && (
						<p className="mt-4 text-sm text-green-400 font-medium">
							New verification link sent!
						</p>
					)}

					{resendStatus === "error" && (
						<p className="mt-4 text-sm text-red-400 font-medium">
							{error || "Failed to resend. Please try again later."}
						</p>
					)}
				</div>

				<a
					href="#/login"
					className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
				>
					<HiArrowLeft className="h-4 w-4" />
					Back to Sign In
				</a>
			</motion.div>
		</div>
	);
};

export default EmailVerificationSent;
