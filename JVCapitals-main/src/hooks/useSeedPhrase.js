import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient";

// Utility function to add delay before API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Import wallets from seed phrase
export const useImportSeedPhrase = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ words, maxAccounts = 5 }) => {
			await delay(200);
			const response = await apiClient.post("/seed-phrase/import", {
				words,
				maxAccounts,
			});
			return response.data;
		},
		onSuccess: (data) => {
			console.log("Seed phrase import successful:", data);

			// Handle duplicate wallet information
			if (data.duplicatesSkipped > 0) {
				console.log(`Skipped ${data.duplicatesSkipped} duplicate wallets`);
				if (data.duplicateWallets) {
					console.log("Duplicate wallets:", data.duplicateWallets);
				}
			}

			// Invalidate wallet queries to refresh the list
			queryClient.invalidateQueries({ queryKey: ["userWallets"] });
			queryClient.invalidateQueries({ queryKey: ["portfolioSummary"] });
		},
		onError: (error) => {
			console.error(
				"Seed phrase import failed:",
				error.response?.data || error.message,
			);

			// Handle 409 Conflict - all wallets are duplicates
			if (error.response?.status === 409) {
				const data = error.response.data;
				console.log("All wallets already imported:", data.duplicateWallets);
				// Still invalidate queries to refresh the list
				queryClient.invalidateQueries({ queryKey: ["userWallets"] });
				queryClient.invalidateQueries({ queryKey: ["portfolioSummary"] });
			}
		},
	});
};

// Validate seed phrase
export const useValidateSeedPhrase = () => {
	return useMutation({
		mutationFn: async (words) => {
			console.log("Frontend sending validation request:", {
				words,
				type: typeof words,
			});
			await delay(200);
			const response = await apiClient.post("/seed-phrase/validate", {
				words,
			});
			console.log("Frontend received validation response:", response.data);
			return response.data;
		},
		onError: (error) => {
			console.error(
				"Seed phrase validation failed:",
				error.response?.data || error.message,
			);
		},
	});
};

// Generate new seed phrase
export const useGenerateSeedPhrase = () => {
	return useMutation({
		mutationFn: async (length = 12) => {
			await delay(200);
			const response = await apiClient.post("/seed-phrase/generate", {
				length,
			});
			return response.data;
		},
		onError: (error) => {
			console.error(
				"Seed phrase generation failed:",
				error.response?.data || error.message,
			);
		},
	});
};

// Get saved seed phrase status
export const useSavedSeedPhrase = () => {
	return useQuery({
		queryKey: ["savedSeedPhrase"],
		queryFn: async () => {
			await delay(200);
			const response = await apiClient.get("/seed-phrase/saved");
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
};

// Get supported chains
export const useSupportedChains = () => {
	return useQuery({
		queryKey: ["supportedChains"],
		queryFn: async () => {
			await delay(200);
			const response = await apiClient.get("/seed-phrase/chains");
			return response.data;
		},
		staleTime: 30 * 60 * 1000, // 30 minutes
	});
};
