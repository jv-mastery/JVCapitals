import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiMailOpen, HiCheckCircle, HiXCircle } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useAuthStore } from "./authStore";

const VerifyEmail = () => {
	const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
	const { verifyEmail, error, clearError } = useAuthStore();

	useEffect(() => {
		const performVerification = async () => {
			// Get token from URL hash (e.g., #/verify-email?token=xyz)
			const hash = window.location.hash;
			const searchParams = new URLSearchParams(hash.split("?")[1]);
			const token = searchParams.get("token");

			if (!token) {
				setStatus("error");
				return;
			}

			try {
				clearError();
				await verifyEmail(token);
				setStatus("success");
			} catch (err) {
				setStatus("error");
			}
		};

		performVerification();
	}, [verifyEmail, clearError]);

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl text-center"
			>
				<div className="flex justify-center">
					{status === "verifying" && (
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
						>
							<AiOutlineLoading3Quarters className="h-16 w-16 text-blue-500!" />
						</motion.div>
					)}
					{status === "success" && (
						<HiCheckCircle className="h-16 w-16 text-green-500!" />
					)}
					{status === "error" && (
						<HiXCircle className="h-16 w-16 text-red-500!" />
					)}
				</div>

				<h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
					{status === "verifying" && "Verifying your email..."}
					{status === "success" && "Account Verified!"}
					{status === "error" && "Verification Failed"}
				</h2>

				<div className="mt-4 text-gray-600 dark:text-gray-400">
					{status === "verifying" && (
						<p>
							Please wait while we confirm your email address. This only takes a
							moment.
						</p>
					)}
					{status === "success" && (
						<p>
							Your email has been successfully verified. You can now log in to
							your account and start managing your portfolio.
						</p>
					)}
					{status === "error" && (
						<p className="text-red-500 font-medium">
							{error ||
								"The verification link is invalid or has expired. Please request a new one or contact support."}
						</p>
					)}
				</div>

				<div className="mt-8">
					{status === "success" ? (
						<a
							href="#/login"
							className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
						>
							Continue to Login
						</a>
					) : status === "error" ? (
						<a
							href="#/signup"
							className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
						>
							Back to Sign Up
						</a>
					) : null}
				</div>
			</motion.div>
		</div>
	);
};

export default VerifyEmail;
