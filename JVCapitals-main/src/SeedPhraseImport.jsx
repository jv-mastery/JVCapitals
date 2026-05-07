import { useState, useEffect } from "react";
import { useAppStore } from "./store";
import {
	useImportSeedPhrase,
	useValidateSeedPhrase,
} from "./hooks/useSeedPhrase";
import { useEthereumPrice } from "./hooks/useData";

function SecurityWarning({ onAccept, onDecline }) {
	return (
		<div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-6">
			<h3 className="text-lg font-semibold text-blue-400 mb-4">ℹ️ Note</h3>
			<div className="space-y-2 text-sm text-blue-300 mb-6">
				<p>• Your seed phrase is NOT stored on our servers</p>
				<p>• Seed phrases are processed temporarily during import only</p>
				<p>• Once imported, your seed phrase is immediately discarded</p>
				<p>
					• Your wallets are created and stored securely without the original
					phrase
				</p>
			</div>
			<div className="flex gap-3">
				<button
					onClick={onAccept}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
				>
					I Understand
				</button>
				<button
					onClick={onDecline}
					className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}

function SeedPhraseInput({ onSubmit, loading, error }) {
	const [seedPhrase, setSeedPhrase] = useState("");
	const [wordCount, setWordCount] = useState(0);
	const [isValidFormat, setIsValidFormat] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (seedPhrase.trim() && isValidFormat) {
			onSubmit(seedPhrase.trim());
		}
	};

	const handleInputChange = (e) => {
		const value = e.target.value;
		setSeedPhrase(value);
		const words = value.trim().split(/\s+/);
		setWordCount(words.length);
		setIsValidFormat(words.length === 12 || words.length === 24);
	};

	return (
		<div className="bg-[#070a11]/90 border border-white/10 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-white mb-4">
				Enter Your Seed Phrase
			</h3>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm text-white/70 mb-2">
						Seed Phrase (12 or 24 words)
					</label>
					<textarea
						value={seedPhrase}
						onChange={handleInputChange}
						placeholder="Enter your seed phrase words separated by spaces...&#10;Example: abandon ability able about above absent absorb abstract absurd abuse access"
						className="w-full p-3 bg-[#0b0f18] rounded border border-white/5 text-white h-32 resize-none font-mono text-sm"
						required
						spellCheck={false}
						autoComplete="off"
					/>
					<div className="flex justify-between mt-2">
						<div className="text-xs text-white/60">
							Word count: {wordCount}
							<span
								className={isValidFormat ? "text-green-400" : "text-yellow-400"}
							>
								{isValidFormat ? " ✓" : " (should be 12 or 24)"}
							</span>
						</div>
						<div className="text-xs text-white/40">
							{isValidFormat ? "Valid format" : "Invalid format"}
						</div>
					</div>
				</div>

				{error && (
					<div className="bg-red-900/20 border border-red-500/30 rounded p-3">
						<p className="text-red-400 text-sm">{error}</p>
					</div>
				)}

				<button
					type="submit"
					disabled={loading || !seedPhrase.trim() || !isValidFormat}
					className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white flex items-center justify-center gap-2 font-medium"
				>
					{loading ? (
						<>
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							Discovering Wallets...
						</>
					) : (
						"Discover Wallets"
					)}
				</button>
			</form>
		</div>
	);
}

function WalletDiscovery({ wallets, onSelectWallets, loading, totalBalance }) {
	const [selectedIndexes, setSelectedIndexes] = useState([]);
	const [selectAll, setSelectAll] = useState(false);
	const { data: priceData } = useEthereumPrice();
	const ethPrice = priceData?.price || 2000; // Fallback to 2000

	useEffect(() => {
		if (selectAll) {
			setSelectedIndexes(wallets.map((w) => w.index));
		} else {
			setSelectedIndexes([]);
		}
	}, [selectAll, wallets]);

	const handleToggle = (index) => {
		setSelectedIndexes((prev) =>
			prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
		);
	};

	const handleImport = () => {
		if (selectedIndexes.length > 0) {
			onSelectWallets(selectedIndexes);
		}
	};

	const formatBalance = (balance) => {
		const num = parseFloat(balance);
		if (num === 0) return "0";
		return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
	};

	const formatUSD = (ethAmount) => {
		// Real-time USD value using current ETH price
		const usdValue = ethAmount * ethPrice;
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(usdValue);
	};

	return (
		<div className="bg-[#070a11]/90 border border-white/10 rounded-lg p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h3 className="text-lg font-semibold text-white">
						{wallets.length} Ethereum Wallet{wallets.length !== 1 ? "s" : ""}{" "}
						Found
					</h3>
					<p className="text-sm text-green-400">
						Total Balance: {formatBalance(totalBalance)} ETH (
						{formatUSD(totalBalance)})
					</p>
				</div>
				<label className="flex items-center gap-2 text-sm text-white/70">
					<input
						type="checkbox"
						checked={selectAll}
						onChange={(e) => setSelectAll(e.target.checked)}
						className="w-4 h-4"
					/>
					Select All
				</label>
			</div>

			<div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
				{wallets.map((wallet) => (
					<div
						key={wallet.index}
						className={`border rounded-lg p-4 cursor-pointer transition-all ${
							selectedIndexes.includes(wallet.index)
								? "border-blue-500 bg-blue-900/20"
								: "border-white/10 hover:border-white/20 hover:bg-white/5"
						}`}
						onClick={() => handleToggle(wallet.index)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<input
									type="checkbox"
									checked={selectedIndexes.includes(wallet.index)}
									onChange={() => handleToggle(wallet.index)}
									className="w-4 h-4"
									onClick={(e) => e.stopPropagation()}
								/>
								<div>
									<div className="text-white font-medium">
										Wallet #{wallet.index}
									</div>
									<div className="text-sm text-white/60 font-mono">
										{wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
									</div>
									<div className="text-xs text-white/40">
										{wallet.derivationPath}
									</div>
								</div>
							</div>
							<div className="text-right">
								<div className="text-green-400 font-medium text-lg">
									{formatBalance(wallet.balance || wallet.balanceFormatted)} ETH
								</div>
								<div className="text-sm text-white/60">
									{wallet.usd_value ||
										formatUSD(
											parseFloat(wallet.balance || wallet.balanceFormatted),
										)}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="flex gap-3">
				<button
					onClick={handleImport}
					disabled={loading || selectedIndexes.length === 0}
					className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white flex items-center justify-center gap-2 font-medium"
				>
					{loading ? (
						<>
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							Importing {selectedIndexes.length} Wallet
							{selectedIndexes.length !== 1 ? "s" : ""}...
						</>
					) : (
						`Import ${selectedIndexes.length} Selected Wallet${selectedIndexes.length !== 1 ? "s" : ""}`
					)}
				</button>
				<button
					onClick={() => setSelectedIndexes([])}
					className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded text-white font-medium"
				>
					Clear
				</button>
			</div>
		</div>
	);
}

function ImportComplete({
	importedCount,
	duplicateCount,
	totalBalance,
	onReset,
	setCurrentPage,
}) {
	const hasDuplicates = duplicateCount > 0;
	const onlyDuplicates = importedCount === 0 && duplicateCount > 0;

	return (
		<div
			className={`${onlyDuplicates ? "bg-yellow-900/20 border border-yellow-500/30" : "bg-green-900/20 border border-green-500/30"} rounded-lg p-8 text-center`}
		>
			<div className="text-4xl mb-4">{onlyDuplicates ? "⚠️" : "✅"}</div>
			<h3
				className={`text-xl font-semibold mb-4 ${onlyDuplicates ? "text-yellow-400" : "text-green-400"}`}
			>
				{onlyDuplicates ? "All Wallets Already Exist" : "Import Complete!"}
			</h3>
			<div className="space-y-2 mb-6">
				{!onlyDuplicates && (
					<p className="text-white text-lg">
						Successfully imported{" "}
						<span className="font-bold">{importedCount}</span> wallet
						{importedCount !== 1 ? "s" : ""}
					</p>
				)}
				{hasDuplicates && (
					<p className="text-yellow-400 text-lg">
						{duplicateCount} wallet{duplicateCount !== 1 ? "s" : ""} already
						existed
					</p>
				)}
				<p className="text-green-400 text-lg">
					Total Balance: {totalBalance} ETH
				</p>
			</div>
			<p className="text-white/60 mb-6">
				Your wallets are now available in the Assets section. You can view and
				manage them there.
			</p>
			<div className="flex gap-3 justify-center">
				<button
					onClick={() => setCurrentPage("assets")}
					className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
				>
					View Assets
				</button>
				<button
					onClick={onReset}
					className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded text-white font-medium"
				>
					Import More
				</button>
			</div>
		</div>
	);
}

export default function SeedPhraseImport() {
	// Zustand store state
	const store = useAppStore();
	const currentPage = store.currentPage;

	// Safe setCurrentPage with fallback
	const setCurrentPage = (page) => {
		if (typeof store.setCurrentPage === "function") {
			store.setCurrentPage(page);
		} else {
			console.error("setCurrentPage not available, using fallback");
			// Fallback navigation
			window.location.href = `#/${page}`;
		}
	};

	// Import hooks
	const validateSeedPhrase = useValidateSeedPhrase();
	const importSeedPhrase = useImportSeedPhrase();

	const [step, setStep] = useState("warning"); // warning, input, discovery, complete
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [wallets, setWallets] = useState([]);
	const [selectedWallets, setSelectedWallets] = useState([]);
	const [importedCount, setImportedCount] = useState(0);
	const [duplicateCount, setDuplicateCount] = useState(0);
	const [totalBalance, setTotalBalance] = useState("0");
	const [currentSeedPhrase, setCurrentSeedPhrase] = useState("");

	const handleSeedPhraseSubmit = async (seedPhrase) => {
		setLoading(true);
		setError("");
		setCurrentSeedPhrase(seedPhrase);

		try {
			// Validate seed phrase with backend
			const validationResult = await validateSeedPhrase.mutateAsync(seedPhrase);

			if (!validationResult.success) {
				throw new Error(validationResult.error || "Invalid seed phrase");
			}

			// Convert derived chains to wallet format
			const wallets = validationResult.derivedChains.map((chain, index) => ({
				index,
				address: chain.address,
				balanceFormatted: "0.000000", // Will be updated after import
				derivationPath: `m/44'/60'/0'/0/${index}`,
				chainName: chain.chainName,
				symbol: chain.symbol,
				chainType: chain.chain,
			}));

			setWallets(wallets);
			const total = wallets.reduce(
				(sum, w) => sum + parseFloat(w.balanceFormatted),
				0,
			);
			setTotalBalance(total.toFixed(6));
			setStep("discovery");
		} catch (err) {
			setError(err.message || "Failed to validate seed phrase");
		} finally {
			setLoading(false);
		}
	};

	const handleWalletImport = async (selectedIndexes) => {
		setLoading(true);
		setError("");

		try {
			// Get selected wallet chain types based on indexes
			const selectedChainTypes = selectedIndexes.map(
				(index) => wallets[index].chainType,
			);
			if (process.env.NODE_ENV !== "production") {
				console.log("Selected wallets for import:", selectedChainTypes);
			}

			// Import wallets using real API with selection
			const result = await importSeedPhrase.mutateAsync({
				words: currentSeedPhrase,
				maxAccounts: 5,
				selectedWallets: selectedChainTypes,
			});

			// Handle different import scenarios
			if (result.allDuplicates) {
				// All wallets already exist
				setImportedCount(0);
				setDuplicateCount(result.totalDerived);
				setStep("complete");
			} else {
				// Some or all wallets imported
				setImportedCount(result.wallets.length);
				setDuplicateCount(result.duplicatesSkipped || 0);
				setStep("complete");
			}
		} catch (err) {
			// Handle 409 Conflict (all duplicates) specially
			if (err.response?.status === 409) {
				const data = err.response.data;
				setImportedCount(0);
				setDuplicateCount(data.totalDerived);
				setStep("complete");
			} else {
				setError(err.message || "Failed to import wallets");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleReset = () => {
		setStep("warning");
		setError("");
		setWallets([]);
		setSelectedWallets([]);
		setImportedCount(0);
		setDuplicateCount(0);
		setTotalBalance("0");
	};

	if (step === "warning") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-24 px-4">
				<div className="max-w-2xl mx-auto">
					<h1 className="text-3xl font-bold mb-8 text-center">
						Import Ethereum Wallet with Seed Phrase
					</h1>
					<SecurityWarning
						onAccept={() => setStep("input")}
						onDecline={() => setCurrentPage("dashboard")}
					/>
				</div>
			</div>
		);
	}

	if (step === "input") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-24 px-4">
				<div className="max-w-2xl mx-auto">
					<h1 className="text-3xl font-bold mb-8 text-center">
						Import Wallet with Seed Phrase
					</h1>
					<SeedPhraseInput
						onSubmit={handleSeedPhraseSubmit}
						loading={loading}
						error={error}
					/>
				</div>
			</div>
		);
	}

	if (step === "discovery") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-24 px-4">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-3xl font-bold mb-8 text-center">
						Select Ethereum Wallet to Import
					</h1>
					<WalletDiscovery
						wallets={wallets}
						onSelectWallets={handleWalletImport}
						loading={loading}
						totalBalance={totalBalance}
					/>
					{error && (
						<div className="mt-4 bg-red-900/20 border border-red-500/30 rounded p-3">
							<p className="text-red-400 text-sm">{error}</p>
						</div>
					)}
				</div>
			</div>
		);
	}

	if (step === "complete") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-24 px-4">
				<div className="max-w-2xl mx-auto">
					<ImportComplete
						importedCount={importedCount}
						duplicateCount={duplicateCount}
						totalBalance={totalBalance}
						onReset={handleReset}
						setCurrentPage={setCurrentPage}
					/>
				</div>
			</div>
		);
	}

	return null;
}
