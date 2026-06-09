import "./App.css";
import { AuthProvider } from "./AuthContext";
import HomePage from "./HomePage";
import Login from "./Login";
import Signup from "./signup";
import VerifyEmail from "./VerifyEmail"; // Import the VerifyEmail component
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import EmailVerificationSent from "./EmailVerificationSent";
import Dashboard from "./Dashboard";
import { useEffect, useState } from "react";

export default function App() {
	const [page, setPage] = useState("home");

	// Handle hash-based routing
	useEffect(() => {
		const handleRouteChange = () => {
			const hash = window.location.hash.slice(1) || "/";
			const path = hash.split("?")[0]; // Remove query params

			if (path.includes("/login")) {
				setPage("login");
			} else if (path.includes("/signup")) {
				setPage("signup");
			} else if (path.includes("/dashboard")) {
				setPage("dashboard");
			} else if (path.includes("/verify-email-sent")) {
				setPage("verify-email-sent");
			} else if (path.includes("/forgot-password")) {
				setPage("forgot-password");
			} else if (path.includes("/reset-password")) {
				setPage("reset-password");
			} else if (path.includes("/verify-email")) {
				// Add this condition
				setPage("verify-email");
			} else {
				setPage("home");
			}
		};

		handleRouteChange();
		window.addEventListener("hashchange", handleRouteChange);
		return () => window.removeEventListener("hashchange", handleRouteChange);
	}, []);

	return (
		<AuthProvider>
			{page === "home" && <HomePage />}
			{page === "login" && <Login />}
			{page === "signup" && <Signup />}
			{page === "verify-email" && <VerifyEmail />}
			{page === "verify-email-sent" && <EmailVerificationSent />}
			{page === "forgot-password" && <ForgotPassword />}
			{page === "reset-password" && <ResetPassword />}
			{page === "dashboard" && <Dashboard />}
			{page === "admin-wallets" && <AdminWalletBalance />}
		</AuthProvider>
	);
}

// function ContactSection() {
//   const ref = useRef(null)
//   const isInView = useInView(ref, { once: true, margin: "-100px" })

//   return (
//     <motion.div
//       id="contact"
//       ref={ref}
//       initial={{ opacity: 0, y: 50 }}
//       animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
//       transition={{ duration: 0.8, ease: "easeOut" }}
//     >
//       <Contact />
//     </motion.div>
//   )
// }
