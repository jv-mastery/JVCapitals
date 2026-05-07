import "./App.css";
import { AuthProvider } from "./AuthContext";
import HomePage from "./HomePage";
import Login from "./Login";
import Signup from "./signup";
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
