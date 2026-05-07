import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the working directory
	// Set the third parameter to '' to load all env variables regardless of the VITE_ prefix
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [react()],
		server: {
			proxy: {
				"/api": {
					target: env.VITE_API_URL || "http://localhost:3000/api",
					changeOrigin: true,
					secure: false,
					// Rewrite the path to remove /api prefix since VITE_API_URL already includes it
					rewrite: (path) => path.replace(/^\/api/, ""),
				},
			},
		},
	};
});
