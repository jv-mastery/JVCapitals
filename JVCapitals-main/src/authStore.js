import { create } from "zustand";
import { persist } from "zustand/middleware";

// Utility function to add delay before API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAuthStore = create(
	persist(
		(set, get) => ({
			// State
			user: null,
			token: null,
			refreshToken: null,
			isLoggedIn: false,
			loading: true,
			error: null,

			// Actions
			setUser: (user) => set({ user, isLoggedIn: !!user }),
			setToken: (token) => set({ token }),
			setRefreshToken: (refreshToken) => set({ refreshToken }),
			setLoading: (loading) => set({ loading }),
			setError: (error) => set({ error }),
			clearError: () => set({ error: null }),

			// Auth actions
			login: async (email, password) => {
				const { setToken, setRefreshToken, setUser, setError } = get();
				try {
					setError(null);
					await delay(200);
					const apiService = (await import("./services/api")).default;
					const response = await apiService.login(email, password);

					if (response.token) {
						setToken(response.token);
						if (response.refreshToken) {
							setRefreshToken(response.refreshToken);
						}

						// Get complete user data including created_at
						try {
							const userResponse = await apiService.getCurrentUser();
							const userData = transformUserData(userResponse.user);
							setUser(userData);
						} catch (userError) {
							console.warn(
								"Failed to fetch complete user data, using login response:",
								userError,
							);
							const userData = transformUserData(response.user);
							setUser(userData);
						}

						return response;
					}
				} catch (error) {
					console.error("Login failed:", error);
					setError(error.message || "Login failed");
					setToken(null);
					setRefreshToken(null);
					setUser(null);
					throw error;
				}
			},

			signup: async (userData) => {
				const { setToken, setRefreshToken, setUser, setError } = get();
				try {
					setError(null);
					await delay(200);
					const apiService = (await import("./services/api")).default;
					const response = await apiService.register(userData);

					if (response.token) {
						setToken(response.token);
						if (response.refreshToken) {
							setRefreshToken(response.refreshToken);
						}

						// Get complete user data including created_at
						try {
							const userResponse = await apiService.getCurrentUser();
							const transformedUser = transformUserData(userResponse.user);
							setUser(transformedUser);
						} catch (userError) {
							console.warn(
								"Failed to fetch complete user data, using signup response:",
								userError,
							);
							const transformedUser = transformUserData(response.user);
							setUser(transformedUser);
						}
					}
					return response;
				} catch (error) {
					console.error("Signup failed:", error);
					setError(error.message || "Signup failed");
					throw error;
				}
			},

			logout: async () => {
				const { setToken, setRefreshToken, setUser, setError } = get();
				try {
					await delay(200);
					const apiService = (await import("./services/api")).default;
					await apiService.logout();
				} catch (error) {
					console.error("Logout error:", error);
				} finally {
					setToken(null);
					setRefreshToken(null);
					setUser(null);
					setError(null);
					// Reset current page to dashboard after logout
					const { useAppStore } = await import("./store");
					const { setCurrentPage } = useAppStore.getState();
					setCurrentPage("dashboard");
				}
			},

			refreshAccessToken: async () => {
				const { refreshToken, setToken, setRefreshToken, setUser, setError } =
					get();
				try {
					if (!refreshToken) {
						throw new Error("No refresh token available");
					}

					setError(null);
					await delay(200);
					const apiService = (await import("./services/api")).default;
					const response = await apiService.refreshToken(refreshToken);

					if (response.token) {
						setToken(response.token);
						const userData = transformUserData(response.user);
						setUser(userData);
						return response;
					}
				} catch (error) {
					console.error("Token refresh failed:", error);
					setError(error.message || "Token refresh failed");
					// Clear tokens on refresh failure
					setToken(null);
					setRefreshToken(null);
					setUser(null);
					throw error;
				}
			},

			// Load user from token on mount
			loadUser: async () => {
				const {
					token,
					refreshToken,
					setRefreshToken,
					setToken,
					setUser,
					setError,
					setLoading,
				} = get();

				// Load refresh token from localStorage if not in state
				const storedRefreshToken =
					refreshToken || localStorage.getItem("refresh_token");

				if (token) {
					try {
						await delay(200);
						const apiService = (await import("./services/api")).default;
						apiService.setToken(token);
						const response = await apiService.getCurrentUser();
						const userData = transformUserData(response.user);
						setUser(userData);
					} catch (error) {
						console.error("Failed to load user:", error);
						// Try to refresh token if it's expired
						if (
							storedRefreshToken &&
							(error.message.includes("401") ||
								error.message.includes("Unauthorized") ||
								error.message.includes("TokenExpiredError"))
						) {
							try {
								await delay(200);
								const apiService = (await import("./services/api")).default;
								const response =
									await apiService.refreshToken(storedRefreshToken);
								if (response.token) {
									setToken(response.token);
									const userData = transformUserData(response.user);
									setUser(userData);
								}
							} catch (refreshError) {
								console.error("Token refresh failed:", refreshError);
								setToken(null);
								setRefreshToken(null);
								setUser(null);
							}
						} else {
							setToken(null);
							setUser(null);
						}
						setError(error.message || "Failed to load user");
					}
				}
				setLoading(false);
			},

			// Update user profile
			updateUser: (updates) => {
				const { user, setUser } = get();
				const updatedUser = { ...user, ...updates };
				setUser(updatedUser);
			},

			// Update profile on backend
			updateProfile: async (profileData) => {
				const { updateUser, setError } = get();
				try {
					setError(null);
					await delay(200);
					const apiService = (await import("./services/api")).default;
					const response = await apiService.updateProfile(profileData);
					updateUser(response.user);
					return response;
				} catch (error) {
					console.error("Profile update failed:", error);
					setError(error.message || "Profile update failed");
					throw error;
				}
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				refreshToken: state.refreshToken,
				isLoggedIn: state.isLoggedIn,
			}),
		},
	),
);

// Helper function to transform user data
function transformUserData(userData) {
	if (!userData) return userData;
	return {
		...userData,
		isAdmin: userData.is_admin || userData.isAdmin || false,
	};
}

export default useAuthStore;
