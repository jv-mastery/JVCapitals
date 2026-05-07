import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient";
const { priceService } = await import("../services/priceService");

// Utility function to add delay before API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get user assets
export const useUserAssets = () => {
	return useQuery({
		queryKey: ["userAssets"],
		queryFn: async () => {
			try {
				await delay(200);
				const response = await apiClient.get("/users/assets");
				return response.data;
			} catch (error) {
				console.error("Failed to fetch user assets:", error);
				// Return empty assets on error
				return { assets: [] };
			}
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
		retry: 2,
	});
};

// Get asset types
export const useAssetTypes = () => {
	return useQuery({
		queryKey: ["assetTypes"],
		queryFn: async () => {
			await delay(200);
			const response = await apiClient.get("/users/asset-types");
			return response.data;
		},
		staleTime: 30 * 60 * 1000, // 30 minutes (asset types rarely change)
		retry: 1,
	});
};

// Get portfolio summary
export const usePortfolioSummary = () => {
	return useQuery({
		queryKey: ["portfolioSummary"],
		queryFn: async () => {
			try {
				await delay(200);
				const response = await apiClient.get("/users/portfolio-summary");
				return response.data;
			} catch (error) {
				console.error("Failed to fetch portfolio summary:", error);
				// Return empty summary on error
				return {
					summary: {
						initial_balance: 0,
						interest_earned: 0,
						total_balance: 0,
						total_assets: 0,
						active_wallets: 0,
						last_updated: new Date().toISOString(),
					},
				};
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes (reduce refresh frequency)
		retry: 3,
		refetchInterval: 3 * 60 * 1000, // Auto-refresh every 2 minutes (reduced from 30 seconds)
	});
};

// Get all users (admin)
export const useAllUsers = (params = {}) => {
	return useQuery({
		queryKey: ["allUsers", params],
		queryFn: async () => {
			await delay(200);
			const queryString = new URLSearchParams(params).toString();
			const url = queryString ? `/users/all?${queryString}` : "/users/all";
			const response = await apiClient.get(url);
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
		enabled: !!params, // Only run if params are provided
	});
};

// Update user balance mutation
export const useUpdateUserBalance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ userId, balanceData }) => {
			await delay(200);
			const response = await apiClient.put(
				`/users/${userId}/balance`,
				balanceData,
			);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate related queries to refetch fresh data
			queryClient.invalidateQueries({ queryKey: ["allUsers"] });
			queryClient.invalidateQueries({ queryKey: ["portfolioSummary"] });
		},
		onError: (error) => {
			console.error("Update user balance mutation error:", error);
		},
	});
};

// Update user details mutation
export const useUpdateUserDetails = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ userId, userData }) => {
			await delay(200);
			const response = await apiClient.put(`/users/${userId}`, userData);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: ["allUsers"] });
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
		},
		onError: (error) => {
			console.error("Update user details mutation error:", error);
		},
	});
};

// Get user wallets
export const useUserWallets = () => {
	return useQuery({
		queryKey: ["userWallets"],
		queryFn: async () => {
			try {
				await delay(200);
				const response = await apiClient.get("/users/wallets");
				return response.data;
			} catch (error) {
				console.error("Failed to fetch user wallets:", error);
				// Return empty array on error
				return { wallets: [] };
			}
		},
		staleTime: 3 * 60 * 1000, // 3 minutes
		retry: 2,
	});
};

// Create wallet mutation
export const useCreateWallet = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (walletData) => {
			await delay(200);
			const response = await apiClient.post("/users/wallets", walletData);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate wallet queries to refetch fresh data
			queryClient.invalidateQueries({ queryKey: ["userWallets"] });
			queryClient.invalidateQueries({ queryKey: ["portfolioSummary"] });
		},
		onError: (error) => {
			console.error("Create wallet mutation error:", error);
		},
	});
};

// Combined hook for assets page data
// Get Ethereum price (now uses frontend CoinGecko service with TanStack Query)
export const useEthereumPrice = () => {
	return useQuery({
		queryKey: ["ethereumPrice"],
		queryFn: async () => {
			const price = await priceService.getEthereumPrice();

			return {
				success: true,
				price: price,
				currency: "USD",
				symbol: "ETH",
				timestamp: new Date().toISOString(),
			};
		},
		staleTime: 5 * 60 * 1000, // 5 minutes (prices change frequently)
		retry: (failureCount, error) => {
			// Don't retry on network errors, but retry on other failures
			if (error.message.includes("Failed to fetch")) {
				return false;
			}
			return failureCount < 2;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
		refetchInterval: 15 * 60 * 1000, // Auto-refresh every 15 minutes (reduce API calls)
		refetchIntervalInBackground: true, // Keep fetching even when tab is not focused
		onError: (error) => {
			console.error("Failed to fetch Ethereum price:", error);
		},
		onSuccess: (data) => {
			console.log("✅ ETH price fetched successfully:", data.price);
		},
	});
};

export const useAssetsPageData = () => {
	const assets = useUserAssets();
	const assetTypes = useAssetTypes();
	const portfolioSummary = usePortfolioSummary();
	const wallets = useUserWallets();

	return {
		assets,
		assetTypes,
		portfolioSummary,
		wallets,
		isLoading:
			assets.isLoading ||
			assetTypes.isLoading ||
			portfolioSummary.isLoading ||
			wallets.isLoading,
		isError:
			assets.isError ||
			assetTypes.isError ||
			portfolioSummary.isError ||
			wallets.isError,
		refetchAll: () => {
			assets.refetch();
			assetTypes.refetch();
			portfolioSummary.refetch();
			wallets.refetch();
		},
	};
};
