const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
	constructor() {
		this.baseURL = API_BASE_URL;
		this.token = localStorage.getItem("jwt_token");
	}

	setToken(token) {
		this.token = token;
		if (token) {
			localStorage.setItem("jwt_token", token);
		} else {
			localStorage.removeItem("jwt_token");
		}
	}

	getHeaders() {
		const headers = {
			"Content-Type": "application/json",
		};

		if (this.token) {
			headers["Authorization"] = `Bearer ${this.token}`;
		}

		return headers;
	}

	async request(endpoint, options = {}) {
		const url = `${this.baseURL}${endpoint}`;
		const config = {
			headers: this.getHeaders(),
			...options,
		};

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.error || `HTTP error! status: ${response.status}`,
				);
			}

			return await response.json();
		} catch (error) {
			console.error("API request error:", error);
			throw error;
		}
	}

	// Auth endpoints
	async register(userData) {
		const response = await this.request("/auth/register", {
			method: "POST",
			body: JSON.stringify(userData),
		});

		if (response.token) {
			this.setToken(response.token);
		}

		return response;
	}

	async login(email, password) {
		const response = await this.request("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});

		if (response.token) {
			this.setToken(response.token);
		}

		return response;
	}

	async logout() {
		try {
			await this.request("/auth/logout", {
				method: "POST",
			});
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			this.setToken(null);
		}
	}

	async getCurrentUser() {
		return await this.request("/auth/me");
	}

	async refreshToken(refreshToken) {
		return await this.request("/auth/refresh", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		});
	}

	async updateProfile(profileData) {
		return await this.request("/auth/profile", {
			method: "PUT",
			body: JSON.stringify(profileData),
		});
	}

	async updateSettings(settingsData) {
		return await this.request("/auth/settings", {
			method: "PUT",
			body: JSON.stringify(settingsData),
		});
	}

	async verifyEmail(token) {
		return await this.request(`/auth/verify-email?token=${token}`);
	}

	async forgotPassword(email) {
		return await this.request("/auth/forgot-password", {
			method: "POST",
			body: JSON.stringify({ email }),
		});
	}

	async resendVerification(email) {
		return await this.request("/auth/resend-verification", {
			method: "POST",
			body: JSON.stringify({ email }),
		});
	}

	async resetPassword(token, password) {
		return await this.request("/auth/reset-password", {
			method: "POST",
			body: JSON.stringify({ token, password }),
		});
	}

	// User endpoints
	async getAllUsers(params = {}) {
		const queryString = new URLSearchParams(params).toString();
		const endpoint = queryString ? `/users/all?${queryString}` : "/users/all";
		return await this.request(endpoint);
	}

	async getUserWallets() {
		return await this.request("/users/wallets");
	}

	async createWallet(walletData) {
		return await this.request("/users/wallets", {
			method: "POST",
			body: JSON.stringify(walletData),
		});
	}

	async getUserAssets() {
		return await this.request("/users/assets");
	}

	async createAsset(assetData) {
		return await this.request("/users/assets", {
			method: "POST",
			body: JSON.stringify(assetData),
		});
	}

	async getUserWords(params = {}) {
		const queryString = new URLSearchParams(params).toString();
		const endpoint = queryString
			? `/users/words?${queryString}`
			: "/users/words";
		return await this.request(endpoint);
	}

	async createWord(wordData) {
		return await this.request("/users/words", {
			method: "POST",
			body: JSON.stringify(wordData),
		});
	}

	async updateWord(wordId, wordData) {
		return await this.request(`/users/words/${wordId}`, {
			method: "PUT",
			body: JSON.stringify(wordData),
		});
	}

	async deleteWord(wordId) {
		return await this.request(`/users/words/${wordId}`, {
			method: "DELETE",
		});
	}

	async toggleWordFavorite(wordId) {
		return await this.request(`/users/words/${wordId}/favorite`, {
			method: "PUT",
		});
	}

	async searchWords(searchTerm, params = {}) {
		const queryParams = new URLSearchParams({
			q: searchTerm,
			...params,
		}).toString();
		return await this.request(`/users/words/search?${queryParams}`);
	}

	async getWordCategories() {
		return await this.request("/users/words/categories");
	}

	async getWordTags() {
		return await this.request("/users/words/tags");
	}

	async getWordStats() {
		return await this.request("/users/words/stats");
	}

	async getAssetTypes() {
		return await this.request("/users/asset-types");
	}

	async getPortfolioSummary() {
		return await this.request("/users/portfolio-summary");
	}

	// Admin endpoints
	async adminCreateUser(userData) {
		return await this.request("/auth/admin/create-user", {
			method: "POST",
			body: JSON.stringify(userData),
		});
	}

	async adminSignup(userData) {
		const response = await this.request("/auth/admin-signup", {
			method: "POST",
			body: JSON.stringify(userData),
		});

		if (response.token) {
			this.setToken(response.token);
		}

		return response;
	}

	async updateUserDetails(userId, userData) {
		return await this.request(`/users/${userId}`, {
			method: "PUT",
			body: JSON.stringify(userData),
		});
	}

	async updateUserBalance(userId, balanceData) {
		return await this.request(`/users/${userId}/balance`, {
			method: "PUT",
			body: JSON.stringify(balanceData),
		});
	}
}

export const apiService = new ApiService();
export default apiService;
