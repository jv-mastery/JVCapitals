import { useContext, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import Footer from "./footer";
import { AuthContext } from "./AuthContext";
import CryptoWalletDisplay from "./CryptoWalletDisplay";
import { useAssetsPageData } from "./hooks/useData";

function fmt(v) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(Number(v) || 0);
}

export default function Assets({
	showHeader = true,
	showAdminControls = true,
}) {
	const { user } = useContext(AuthContext);
	const isAdmin = !!user?.isAdmin;

	// TanStack Query hooks
	const {
		assets: assetsQuery,
		portfolioSummary: portfolioSummaryQuery,
		wallets: walletsQuery,
		isLoading,
		isError,
		refetchAll,
	} = useAssetsPageData();

	// Extract data from queries
	const assets = assetsQuery.data?.assets || [];
	const portfolioSummary = portfolioSummaryQuery.data?.summary || {};
	const cryptoWallets = walletsQuery.data?.wallets || [];

	// Calculate totals from portfolio summary
	const totals = {
		initial: portfolioSummary.initial_balance || 0,
		interest: portfolioSummary.interest_earned || 0,
		total: portfolioSummary.total_balance || 0,
	};

	// Admin controls state
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState(totals);

	// Calculate totals from current assets
	const calculateFromAssets = () => {
		const initial = assets.reduce(
			(sum, asset) => sum + asset.quantity * asset.purchase_price,
			0,
		);
		const current = assets.reduce(
			(sum, asset) => sum + asset.quantity * asset.current_price,
			0,
		);
		const interest = current - initial;
		const calculatedTotals = { initial, interest, total: current };
		setForm(calculatedTotals);
	};

	// Save totals function
	const saveTotals = () => {
		const persisted = {
			initial_balance: Number(form.initial) || 0,
			interest_earned: Number(form.interest) || 0,
			total_balance: Number(form.total) || 0,
		};
		// Here you would typically call an API to save the totals
		// For now, we'll just update the local state
		setForm(persisted);
		setEditing(false);
	};

	// Handle loading and error states
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
				<p className="ml-4 text-white/60">Loading assets data...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-400 mb-4">Failed to load assets data</p>
					<button
						onClick={refetchAll}
						className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#05060a] text-white">
			{showHeader && <DashboardHeader currentPage={"assets"} />}

			<main className="pt-28 pb-12 px-4">
				<div className="max-w-5xl mx-auto">
					<h1 className="text-4xl font-bold mb-4 text-center">
						Assets Dashboard
					</h1>
					<p className="text-white/60 !mb-6 text-center">
						Overview of platform assets. Admins can update totals below.
					</p>

					{
						<section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
							<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6">
								<h3 className="text-sm text-white/60">Total Initial Balance</h3>
								<div className="mt-3 text-2xl font-semibold">
									{fmt(totals.initial)}
								</div>
							</div>

							<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6">
								<h3 className="text-sm text-white/60">Interest Earned</h3>
								<div className="mt-3 text-2xl font-semibold">
									{fmt(totals.interest)}
								</div>
							</div>

							<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6">
								<h3 className="text-sm text-white/60">Total Balance</h3>
								<div className="mt-3 text-2xl font-semibold">
									{fmt(totals.total)}
								</div>
							</div>
						</section>
					}

					{/* Assets List Section */}
					{!isLoading && assets.length > 0 && (
						<section className="mb-6">
							<h2 className="text-2xl font-semibold mb-4">Your Assets</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{assets.map((asset) => (
									<div
										key={asset.id}
										className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-4"
									>
										<div className="flex justify-between items-start mb-2">
											<h3 className="font-semibold text-white">{asset.name}</h3>
											<span className="text-sm text-white/60">
												{asset.symbol}
											</span>
										</div>
										<div className="space-y-1 text-sm">
											<div className="flex justify-between">
												<span className="text-white/60">Quantity:</span>
												<span className="text-white">{asset.quantity}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-white/60">Purchase Price:</span>
												<span className="text-white">
													{fmt(asset.purchase_price)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-white/60">Current Price:</span>
												<span className="text-white">
													{fmt(asset.current_price)}
												</span>
											</div>
											<div className="flex justify-between font-semibold pt-2 border-t border-white/10">
												<span className="text-white/60">Total Value:</span>
												<span className="text-green-400">
													{fmt(asset.quantity * asset.current_price)}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</section>
					)}

					{/* Crypto Wallets Section */}
					{!isLoading && (
						<section className="mb-6">
							<CryptoWalletDisplay wallets={cryptoWallets} />
						</section>
					)}

					{showAdminControls && (
						<div className="bg-[#070a11]/90 backdrop-blur-lg border border-white/10 rounded-lg p-6">
							<h2 className="text-xl font-semibold mb-3">Admin Controls</h2>
							<p className="text-white/60 mb-4">
								Only users marked as admins can update these values. Changes are
								saved to localStorage.
							</p>

							{isAdmin ? (
								<div className="space-y-4">
									{!editing ? (
										<div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
											<button
												onClick={() => {
													setForm(totals);
													setEditing(true);
												}}
												className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
											>
												Edit Totals
											</button>
											<button
												onClick={calculateFromAssets}
												className="px-4 py-2 border border-white/10 rounded bg-transparent"
											>
												Calculate from assets
											</button>
											<div className="text-sm text-white/60 mt-3 sm:mt-0">
												Tip: Calculates totals based on your current assets
												portfolio.
											</div>
										</div>
									) : (
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
											<label className="flex flex-col">
												<span className="text-sm text-white/70 mb-1">
													Initial Balance
												</span>
												<input
													type="number"
													value={form.initial}
													onChange={(e) =>
														setForm({ ...form, initial: e.target.value })
													}
													className="p-2 rounded bg-[#0b0f18] border border-white/5"
												/>
											</label>

											<label className="flex flex-col">
												<span className="text-sm text-white/70 mb-1">
													Interest Earned
												</span>
												<input
													type="number"
													value={form.interest}
													onChange={(e) =>
														setForm({ ...form, interest: e.target.value })
													}
													className="p-2 rounded bg-[#0b0f18] border border-white/5"
												/>
											</label>

											<label className="flex flex-col">
												<span className="text-sm text-white/70 mb-1">
													Total Balance
												</span>
												<input
													type="number"
													value={form.total}
													onChange={(e) =>
														setForm({ ...form, total: e.target.value })
													}
													className="p-2 rounded bg-[#0b0f18] border border-white/5"
												/>
											</label>

											<div className="sm:col-span-3 flex gap-3">
												<button
													onClick={saveTotals}
													className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
												>
													Save
												</button>
												<button
													onClick={() => {
														setForm(totals);
														setEditing(false);
													}}
													className="px-4 py-2 border border-white/10 rounded"
												>
													Cancel
												</button>
												<button
													onClick={calculateFromAssets}
													className="px-4 py-2 border border-white/10 rounded"
												>
													Auto-calc
												</button>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="text-white/60">
									You are not an admin. Contact an administrator to update
									totals.
								</div>
							)}
						</div>
					)}
				</div>
			</main>

			<Footer />
		</div>
	);
}
