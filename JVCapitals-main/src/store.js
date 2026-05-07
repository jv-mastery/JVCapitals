import { create } from "zustand";

// Utility function to add delay before API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAppStore = create((set, get) => ({
	// Navigation state
	currentPage: "dashboard",
	setCurrentPage: (page) => set({ currentPage: page }),

	// Assets state
	assets: [],
	assetTypes: [],
	portfolioSummary: null,
	setAssets: (assets) => set({ assets }),
	setAssetTypes: (assetTypes) => set({ assetTypes }),
	setPortfolioSummary: (portfolioSummary) => set({ portfolioSummary }),

	// Crypto wallets state
	cryptoWallets: [],
	setCryptoWallets: (cryptoWallets) => set({ cryptoWallets }),

	// Totals state
	totals: { initial: 0, interest: 0, total: 0 },
	setTotals: (totals) => set({ totals }),

	// UI state
	loading: false,
	error: null,
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),

	// Form state
	editing: false,
	form: { initial: 0, interest: 0, total: 0 },
	setEditing: (editing) => set({ editing }),
	setForm: (form) => set({ form }),

	// Admin state
	adminUsers: [],
	setAdminUsers: (adminUsers) => set({ adminUsers }),

	// Actions
	refreshData: async () => {
		const { setLoading, setError, loadAssetsData } = get();
		try {
			setLoading(true);
			setError(null);
			await loadAssetsData();
		} catch (err) {
			setError(err.message || "Failed to refresh data");
		} finally {
			setLoading(false);
		}
	},

	loadAssetsData: async () => {
		const {
			setLoading,
			setError,
			setAssets,
			setAssetTypes,
			setPortfolioSummary,
			setCryptoWallets,
			setTotals,
			setForm,
		} = get();

		try {
			setLoading(true);
			setError(null);

			// Import apiService dynamically to avoid circular dependencies
			const apiService = (await import("./services/api")).default;

			// Fetch all asset data in parallel
			const [assetsResponse, assetTypesResponse, portfolioResponse] =
				await Promise.all([
					delay(200).then(() => apiService.getUserAssets()),
					delay(200).then(() => apiService.getAssetTypes()),
					delay(200).then(() => apiService.getPortfolioSummary()),
				]);

			setAssets(assetsResponse.assets || []);
			setAssetTypes(assetTypesResponse.asset_types || []);
			setPortfolioSummary(portfolioResponse.summary || {});

			// Load crypto wallets (mock data for now)
			const mockCryptoWallets = [
				{
					id: "1",
					label: "Seed Wallet #0",
					address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
					blockchain: "ethereum",
					assets: [
						{ symbol: "ETH", balance: "2.543210", value_usd: 5086.42 },
						{ symbol: "USDT", balance: "1000.0", value_usd: 1000.0 },
					],
					totalValue: 6086.42,
				},
				{
					id: "2",
					label: "Seed Wallet #7",
					address: "0x1234567890123456789012345678901234567890",
					blockchain: "ethereum",
					assets: [{ symbol: "ETH", balance: "0.123456", value_usd: 246.91 }],
					totalValue: 246.91,
				},
			];
			setCryptoWallets(mockCryptoWallets);

			// Calculate totals from portfolio summary (user balances + assets)
			const summary = portfolioResponse.summary || {};
			const calculatedTotals = {
				initial: summary.initial_balance || 0,
				interest: summary.interest_earned || 0,
				total: summary.total_balance || 0,
			};

			setTotals(calculatedTotals);
			setForm(calculatedTotals);
		} catch (err) {
			console.error("Failed to load assets data:", err);
			setError(err.message || "Failed to load assets data");
		} finally {
			setLoading(false);
		}
	},

	// Wallet import actions
	addCryptoWallet: (wallet) => {
		const { cryptoWallets } = get();
		set({ cryptoWallets: [...cryptoWallets, wallet] });
	},

	removeCryptoWallet: (walletId) => {
		const { cryptoWallets } = get();
		set({ cryptoWallets: cryptoWallets.filter((w) => w.id !== walletId) });
	},

	// Reset actions
	resetError: () => set({ error: null }),
	resetForm: () => {
		const { totals } = get();
		set({ form: totals, editing: false });
	},
}));

export default useAppStore;
