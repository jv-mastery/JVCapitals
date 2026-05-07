import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../apiClient";
import { useAuthStore } from "../authStore";

// Utility function to add delay before API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Login mutation
export const useLogin = () => {
	const { login } = useAuthStore();

	return useMutation({
		mutationFn: async ({ email, password }) => {
			await delay(200);
			const response = await apiClient.post("/auth/login", { email, password });
			return response.data;
		},
		onSuccess: (data) => {
			// Zustand store will handle token storage via auth store login method
			login(data.email, data.password);
		},
		onError: (error) => {
			console.error("Login mutation error:", error);
		},
	});
};

// Register mutation
export const useRegister = () => {
	const { signup } = useAuthStore();

	return useMutation({
		mutationFn: async ({ email, password, name }) => {
			await delay(200);
			const response = await apiClient.post("/auth/register", {
				email,
				password,
				name,
			});
			return response.data;
		},
		onSuccess: (data) => {
			// Zustand store will handle token storage via auth store signup method
			signup({ email: data.user.email, password: "", name: data.user.name });
		},
		onError: (error) => {
			console.error("Register mutation error:", error);
		},
	});
};

// Logout mutation
export const useLogout = () => {
	const { logout } = useAuthStore();

	return useMutation({
		mutationFn: async () => {
			await delay(200);
			await apiClient.post("/auth/logout");
		},
		onSuccess: () => {
			// Zustand store will handle cleanup
			logout();
		},
		onError: (error) => {
			console.error("Logout mutation error:", error);
			// Still logout locally even if API call fails
			logout();
		},
	});
};

// Get current user query
export const useCurrentUser = () => {
	const { user, isLoggedIn } = useAuthStore();

	return useQuery({
		queryKey: ["currentUser"],
		queryFn: async () => {
			await delay(200);
			const response = await apiClient.get("/auth/me");
			return response.data;
		},
		enabled: isLoggedIn && !!user, // Only run if user is logged in
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: (failureCount, error) => {
			// Don't retry on 401 errors (handled by interceptor)
			if (error?.response?.status === 401) {
				return false;
			}
			return failureCount < 2;
		},
	});
};

// Update profile mutation
export const useUpdateProfile = () => {
	const { updateProfile } = useAuthStore();

	return useMutation({
		mutationFn: async (profileData) => {
			await delay(200);
			const response = await apiClient.put("/auth/profile", profileData);
			return response.data;
		},
		onSuccess: (data) => {
			// Update local user data in store
			updateProfile(data.user);
		},
		onError: (error) => {
			console.error("Update profile mutation error:", error);
		},
	});
};
