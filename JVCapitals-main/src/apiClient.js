import axios from "axios";
import { useAuthStore } from "./authStore";

// Create Axios instance
export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
	// timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("jwt_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If error is 401 and we haven't tried to refresh yet
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Try to refresh the token
				const refreshToken = localStorage.getItem("refresh_token");
				if (!refreshToken) {
					throw new Error("No refresh token available");
				}

				const response = await axios.post(
					`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/refresh`,
					{ refreshToken },
				);

				const { token: newToken, user } = response.data;

				// Update tokens in localStorage
				localStorage.setItem("jwt_token", newToken);

				// Update Zustand store
				const authStore = useAuthStore.getState();
				authStore.setToken(newToken);
				authStore.setUser(user);

				// Retry the original request with new token
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return apiClient(originalRequest);
			} catch (refreshError) {
				// Refresh failed, clear tokens and redirect to login
				console.error("Token refresh failed:", refreshError);
				const authStore = useAuthStore.getState();
				// Use the centralized logout logic
				authStore.logout();

				// Redirect to login
				window.location.href = "#/login";

				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);

export default apiClient;
