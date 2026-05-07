import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "./store";

// TanStack Query hook for ETH price (using frontend CoinGecko service)
const useEthPrice = () => {
	return useQuery({
		queryKey: ["ethPrice"],
		queryFn: async () => {
			const { priceService } = await import("./services/priceService");
			const price = await priceService.getEthereumPrice();
			if (process.env.NODE_ENV !== "production") {
				console.log("💰 ETH price from CoinGecko:", price);
			}
			return price;
		},
		staleTime: 10 * 60 * 1000, // 10 minutes (reduce API calls)
		retry: 2,
		refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
	});
};

function CryptoWalletCard({ wallet }) {
	const [showDetails, setShowDetails] = useState(false);
	const { data: ethPrice, isLoading, error } = useEthPrice();

	const formatAddress = (address) => {
		if (!address) return "No address";
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const formatBalance = (balance) => {
		const num = parseFloat(balance);
		if (num === 0) return "0";
		return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
	};

	// Calculate USD value with real-time price
	const calculateUSDValue = () => {
		// Use fallback price if loading or error
		const price = ethPrice || 3500;
		return parseFloat(wallet.balance || 0) * price;
	};

	// Map backend wallet data to frontend format
	const mappedWallet = {
		label: wallet.chain_name || wallet.wallet_type || "Unknown Wallet",
		address: wallet.wallet_address,
		blockchain: wallet.wallet_type,
		// Use real balance data from backend
		balance: wallet.balance || 0,
		// Calculate USD value with real-time price (or fallback)
		totalValue: calculateUSDValue(),
		assets: [], // Will be populated later from assets API
		symbol: wallet.symbol || "ETH",
		chainName: wallet.chain_name,
		ethPrice: ethPrice || 3500,
	};

	const formatUSD = (value) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0);
	};

	return (
		<div className="bg-[#070a11]/90 border border-white/10 rounded-lg p-4">
			<div className="flex justify-between items-start mb-3">
				<div>
					<h4 className="font-semibold text-white">{mappedWallet.label}</h4>
					<p className="text-sm text-white/60 font-mono">
						{formatAddress(mappedWallet.address)}
					</p>
					<p className="text-xs text-white/40 capitalize">
						{mappedWallet.blockchain}
					</p>
				</div>
				<div className="text-right">
					<div className="text-lg font-semibold text-green-400">
						{formatBalance(mappedWallet.balance)} {mappedWallet.symbol}
					</div>
					<div className="text-sm text-white/80">
						{error ? (
							<span className="text-orange-400">
								{formatUSD(mappedWallet.totalValue)} (fallback)
							</span>
						) : isLoading ? (
							<span className="text-yellow-400">Loading...</span>
						) : (
							formatUSD(mappedWallet.totalValue)
						)}
					</div>
					<div className="text-xs text-white/60">
						{mappedWallet.assets.length} assets • ETH: $
						{error ? (
							<span className="text-orange-400">3500 (fallback)</span>
						) : isLoading ? (
							<span className="text-yellow-400">...</span>
						) : (
							ethPrice?.toLocaleString()
						)}
					</div>
				</div>
			</div>

			<div className="space-y-2 mb-3">
				{mappedWallet.assets.map((asset, index) => (
					<div key={index} className="flex justify-between text-sm">
						<span className="text-white/80">{asset.symbol}</span>
						<span className="text-white/60">
							{formatBalance(asset.balance)} × $
							{formatUSD(asset.value_usd / parseFloat(asset.balance)).slice(1)}
						</span>
					</div>
				))}
			</div>

			<button
				onClick={() => setShowDetails(!showDetails)}
				className="text-xs text-blue-400 hover:text-blue-300 transition"
			>
				{showDetails ? "Hide Details" : "Show Details"}
			</button>

			{showDetails && (
				<div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
					<div className="space-y-1">
						<div>Address: {mappedWallet.address}</div>
						<div>
							Balance: {formatBalance(mappedWallet.balance)}{" "}
							{mappedWallet.symbol}
						</div>
						<div>USD Value: {formatUSD(mappedWallet.totalValue)}</div>
						<div>ETH Price: ${mappedWallet.ethPrice.toLocaleString()}</div>
						<div>Blockchain: {mappedWallet.blockchain}</div>
						<div>Last Synced: Just now</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default function CryptoWalletDisplay({ wallets }) {
	// Zustand store state
	const { setCurrentPage } = useAppStore();
	const { data: ethPrice, isLoading, error } = useEthPrice();

	// Calculate total value with real-time price (or fallback)
	const totalValue = wallets.reduce((sum, wallet) => {
		const price = ethPrice || 3500; // Use fallback if error or loading
		return sum + parseFloat(wallet.balance || 0) * price;
	}, 0);
	const totalAssets = wallets.length; // Each wallet counts as one asset

	if (wallets.length === 0) {
		return (
			<div className="bg-[#070a11]/90 border border-white/10 rounded-lg p-6 text-center">
				<div className="text-2xl mb-3">🔐</div>
				<h3 className="text-lg font-semibold text-white mb-2">
					No Crypto Wallets
				</h3>
				<p className="text-white/60 mb-4">
					Import your crypto wallets using seed phrases to track your portfolio
					here.
				</p>
				<button
					onClick={() => setCurrentPage && setCurrentPage("import-wallet")}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
				>
					Import Wallet
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="bg-[#070a11]/90 border border-white/10 rounded-lg p-4">
				<div className="flex justify-between items-center">
					<div>
						<h3 className="text-lg font-semibold text-white">Crypto Wallets</h3>
						<p className="text-sm text-white/60">
							{wallets.length} wallet{wallets.length !== 1 ? "s" : ""} •{" "}
							{totalAssets} assets
						</p>
					</div>
					<div className="text-right">
						<div className="text-xl font-semibold text-green-400">
							{error ? (
								<span className="text-orange-400">
									{new Intl.NumberFormat("en-US", {
										style: "currency",
										currency: "USD",
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}).format(totalValue)}{" "}
									(fallback)
								</span>
							) : isLoading ? (
								<span className="text-yellow-400">Loading...</span>
							) : (
								new Intl.NumberFormat("en-US", {
									style: "currency",
									currency: "USD",
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								}).format(totalValue)
							)}
						</div>
						<div className="text-xs text-white/60">
							Total Value • ETH: $
							{error ? (
								<span className="text-orange-400">3500 (fallback)</span>
							) : isLoading ? (
								<span className="text-yellow-400">...</span>
							) : (
								ethPrice?.toLocaleString()
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{wallets.map((wallet) => (
					<CryptoWalletCard key={wallet.id} wallet={wallet} />
				))}
			</div>

			<div className="flex justify-center">
				<button
					onClick={() => setCurrentPage && setCurrentPage("import-wallet")}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
				>
					Import More Wallets
				</button>
			</div>
		</div>
	);
}
