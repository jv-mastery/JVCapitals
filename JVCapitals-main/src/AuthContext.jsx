import { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "./authStore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	// Use Zustand auth store
	const {
		user,
		token,
		isLoggedIn,
		loading,
		error,
		login: storeLogin,
		logout: storeLogout,
		signup: storeSignup,
		updateUser: storeUpdateUser,
		updateProfile: storeUpdateProfile,
		loadUser,
		setError,
		clearError,
	} = useAuthStore();

	// Load user on mount
	useEffect(() => {
		loadUser();
	}, [loadUser]);

	// Enhanced login with token persistence
	const login = async (email, password) => {
		try {
			const response = await storeLogin(email, password);
			return response;
		} catch (error) {
			throw error;
		}
	};

	// Enhanced logout
	const logout = async () => {
		try {
			await storeLogout();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	// Enhanced signup
	const signup = async (userData) => {
		try {
			const response = await storeSignup(userData);
			return response;
		} catch (error) {
			throw error;
		}
	};

	// Enhanced profile update
	const updateProfile = async (profileData) => {
		try {
			const response = await storeUpdateProfile(profileData);
			return response;
		} catch (error) {
			throw error;
		}
	};

	const value = {
		user,
		isLoggedIn,
		loading,
		error,
		signup,
		login,
		logout,
		updateUser: storeUpdateUser,
		updateProfile,
		setError,
		clearError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
