import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { Wallet } from "../models/Wallet.js";
import { Word } from "../models/Word.js";
import { User } from "../models/User.js";
import SeedPhraseWallet from "../utils/crypto.js";

const router = express.Router();

// Import wallets from seed phrase
router.post("/import", authenticateToken, async (req, res) => {
	try {
		const { words, maxAccounts = 5, selectedWallets } = req.body;
		const userId = req.user.id;
		if (process.env.NODE_ENV !== "production") {
			console.log("Import request received:", { words, maxAccounts, userId });
		}

		if (!words || typeof words !== "string") {
			if (process.env.NODE_ENV !== "production") {
				console.log("Import failed: words missing or not string");
			}
			return res.status(400).json({ error: "Seed phrase words are required" });
		}

		// Clean and validate seed phrase
		const seedPhrase = words.trim().toLowerCase();
		if (process.env.NODE_ENV !== "production") {
			console.log("Processing seed phrase for import:", seedPhrase);
		}

		let seedPhraseWallet;
		let derivedWallets;

		try {
			// Use direct wallet creation instead of derivation paths
			const directWallet = SeedPhraseWallet.directFromSeedPhrase(seedPhrase);

			if (!directWallet) {
				return res.status(400).json({
					error: "Failed to create wallet from seed phrase",
					details: "No wallet could be created",
				});
			}

			// Create single wallet object for import
			derivedWallets = [
				{
					chainType: "ethereum",
					chainName: "Ethereum",
					symbol: "ETH",
					address: directWallet.address,
					privateKey: directWallet.privateKey,
					publicKey: directWallet.publicKey,
					derivationPath: directWallet.derivationPath,
					accountIndex: directWallet.accountIndex || 0,
				},
			];

			console.log("Successfully created direct wallet:", directWallet.address);
		} catch (error) {
			return res.status(400).json({
				error: "Invalid seed phrase",
				details: error.message,
			});
		}

		// Filter wallets based on user selection (if provided)
		let walletsToProcess = derivedWallets;
		if (
			selectedWallets &&
			Array.isArray(selectedWallets) &&
			selectedWallets.length > 0
		) {
			console.log(
				"Filtering wallets based on user selection:",
				selectedWallets,
			);
			walletsToProcess = derivedWallets.filter((wallet) =>
				selectedWallets.includes(wallet.chainType),
			);
			console.log(`Filtered to ${walletsToProcess.length} wallets for import`);
		}

		// Pre-validate selected wallets for duplicates before creating any
		const duplicateCheck = await Promise.all(
			walletsToProcess.map(async (wallet) => {
				const existing = await Wallet.findByAddressAndUser(
					wallet.address,
					userId,
				);
				return {
					wallet,
					isDuplicate: !!existing,
					existingWallet: existing,
				};
			}),
		);

		const newWallets = duplicateCheck.filter((item) => !item.isDuplicate);
		const duplicateWallets = duplicateCheck.filter((item) => item.isDuplicate);

		console.log(
			`Found ${duplicateWallets.length} duplicate wallets, ${newWallets.length} new wallets to import`,
		);

		// If all wallets are duplicates, return early without saving seed phrase
		if (newWallets.length === 0) {
			return res.status(409).json({
				success: false,
				message: "All wallets from this seed phrase have already been imported",
				duplicateWallets: duplicateWallets.map((item) => ({
					chainType: item.wallet.chainType,
					chainName: item.wallet.chainName,
					address: item.wallet.address,
					symbol: item.wallet.symbol,
					existingSince: item.existingWallet.created_at,
				})),
				totalDerived: derivedWallets.length,
				allDuplicates: true,
			});
		}

		// Only save seed phrase if we have new wallets to create (prevents duplicates)
		if (newWallets.length > 0) {
			try {
				await Word.saveSeedPhrase(userId, seedPhrase);
				console.log("Seed phrase saved successfully for new wallets");
			} catch (error) {
				console.warn(
					"Failed to save seed phrase to words table:",
					error.message,
				);
				// Continue with wallet creation even if seed phrase saving fails
			}
		}

		// Create only new wallets in database
		const createdWallets = [];
		const errors = [];

		for (const walletItem of newWallets) {
			const derivedWallet = walletItem.wallet;
			try {
				// Store private key without encryption (for now)
				const encryptedPrivateKey = derivedWallet.privateKey;

				const walletData = {
					user_id: userId,
					wallet_address: derivedWallet.address,
					wallet_type: derivedWallet.chainType,
					balance: 0, // Will be updated with actual balance
					private_key: encryptedPrivateKey, // Encrypted private key
					public_key: derivedWallet.publicKey,
					derivation_path: derivedWallet.derivationPath,
					account_index: derivedWallet.accountIndex,
					chain_name: derivedWallet.chainName,
					symbol: derivedWallet.symbol,
				};

				const createdWallet = await Wallet.create(walletData);

				// Fetch real Ethereum balance immediately
				try {
					const EthereumBalanceService = (
						await import("../services/ethereumBalanceService.js")
					).default;
					const realBalance = await EthereumBalanceService.getBalance(
						derivedWallet.chainType,
						derivedWallet.address,
					);

					// Update wallet with real balance
					await Wallet.updateBalance(createdWallet.id, realBalance);
					createdWallet.balance = realBalance;

					console.log(
						`Set real balance for new wallet ${derivedWallet.address}: ${realBalance} ETH`,
					);
				} catch (balanceError) {
					console.warn(
						`Failed to fetch real balance for wallet ${derivedWallet.address}:`,
						balanceError.message,
					);
					// Keep 0 balance if fetching fails
				}

				createdWallets.push(createdWallet);
			} catch (error) {
				errors.push({
					wallet: derivedWallet,
					error: error.message,
				});
			}
		}

		// Add USD value to each wallet (frontend will fetch real-time price)
		const walletsWithValue = createdWallets.map((wallet) => ({
			...wallet,
			usd_value: null, // Frontend will calculate with real-time price
		}));

		const response = {
			success: true,
			message: `Successfully imported ${createdWallets.length} Ethereum wallet${createdWallets.length !== 1 ? "s" : ""} from seed phrase`,
			wallets: walletsWithValue,
			totalDerived: derivedWallets.length,
			selectedWallets: selectedWallets || null,
			walletsProcessed: walletsToProcess.length,
			seedPhraseSaved: true,
			duplicatesSkipped: duplicateWallets.length,
			duplicateWallets:
				duplicateWallets.length > 0
					? duplicateWallets.map((item) => ({
							chainType: item.wallet.chainType,
							chainName: item.wallet.chainName,
							address: item.wallet.address,
							symbol: item.wallet.symbol,
							existingSince: item.existingWallet.created_at,
						}))
					: undefined,
			errors: errors.length > 0 ? errors : undefined,
		};

		if (errors.length > 0) {
			response.message += ` (${errors.length} wallets failed)`;
		}
		if (duplicateWallets.length > 0) {
			response.message += ` (${duplicateWallets.length} wallets already existed)`;
		}

		res.status(201).json(response);
	} catch (error) {
		console.error("Import seed phrase error:", error);
		res.status(500).json({
			error: "Failed to import wallets from seed phrase",
			details: error.message,
		});
	}
});

// Validate seed phrase
router.post("/validate", authenticateToken, async (req, res) => {
	try {
		const { words } = req.body;
		console.log("Received seed phrase validation request:", {
			words,
			type: typeof words,
		});

		if (!words || typeof words !== "string") {
			console.log("Validation failed: words missing or not string");
			return res.status(400).json({ error: "Seed phrase words are required" });
		}

		try {
			const seedPhrase = words.trim().toLowerCase();
			console.log("Processing seed phrase:", seedPhrase);
			const seedPhraseWallet = new SeedPhraseWallet(seedPhrase);
			const derivedWallets = seedPhraseWallet.deriveAllWallets(1); // Test with 1 account per chain
			console.log("Successfully derived wallets:", derivedWallets.length);

			res.json({
				success: true,
				message: "Valid seed phrase",
				derivedChains: derivedWallets.map((w) => ({
					chain: w.chainType,
					chainName: w.chainName,
					symbol: w.symbol,
					address: w.address,
				})),
			});
		} catch (error) {
			res.status(400).json({
				error: "Invalid seed phrase",
				details: error.message,
			});
		}
	} catch (error) {
		console.error("Validate seed phrase error:", error);
		res.status(500).json({ error: "Failed to validate seed phrase" });
	}
});

// Generate new seed phrase
router.post("/generate", authenticateToken, async (req, res) => {
	try {
		const { length = 12 } = req.body;

		if (![12, 15, 18, 21, 24].includes(length)) {
			return res.status(400).json({
				error: "Seed phrase length must be 12, 15, 18, 21, or 24 words",
			});
		}

		const seedPhrase = SeedPhraseWallet.generateSeedPhrase(length);

		res.json({
			success: true,
			seedPhrase,
			length,
			message: `Generated ${length}-word seed phrase`,
		});
	} catch (error) {
		console.error("Generate seed phrase error:", error);
		res.status(500).json({ error: "Failed to generate seed phrase" });
	}
});

// Get saved seed phrases
router.get("/saved", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.id;
		const savedSeedPhrase = await Word.findSeedPhrase(userId);

		if (savedSeedPhrase) {
			// Don't return the actual seed phrase, just confirm it exists
			res.json({
				success: true,
				hasSeedPhrase: true,
				savedAt: savedSeedPhrase.created_at,
				message: "Seed phrase is saved",
			});
		} else {
			res.json({
				success: true,
				hasSeedPhrase: false,
				message: "No seed phrase saved",
			});
		}
	} catch (error) {
		console.error("Get saved seed phrase error:", error);
		res.status(500).json({ error: "Failed to retrieve saved seed phrase" });
	}
});

// Get supported chains
router.get("/chains", authenticateToken, async (req, res) => {
	try {
		const { SUPPORTED_CHAINS } = await import("../utils/crypto.js");

		res.json({
			success: true,
			chains: SUPPORTED_CHAINS,
		});
	} catch (error) {
		console.error("Get supported chains error:", error);
		res.status(500).json({ error: "Failed to get supported chains" });
	}
});

// Admin endpoint to update wallet balance
router.put(
	"/admin/update-wallet-balance",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			const user = await User.findById(req.user.id);
			if (!user || !user.is_admin) {
				return res.status(403).json({
					success: false,
					error: "Admin access required",
				});
			}

			const { walletId, newBalance } = req.body;

			// Validate inputs
			if (!walletId || newBalance === undefined) {
				return res.status(400).json({
					success: false,
					error: "Wallet ID and new balance are required",
				});
			}

			// Validate new balance is a valid number
			const balance = parseFloat(newBalance);
			if (isNaN(balance) || balance < 0) {
				return res.status(400).json({
					success: false,
					error: "Balance must be a valid non-negative number",
				});
			}

			// Find and update the wallet
			const wallet = await Wallet.findById(walletId);
			if (!wallet) {
				return res.status(404).json({
					success: false,
					error: "Wallet not found",
				});
			}

			// Update wallet balance
			const updatedWallet = await Wallet.updateBalance(walletId, balance);

			console.log(
				`Admin ${user.email} updated wallet ${walletId} balance to ${balance}`,
			);

			res.json({
				success: true,
				message: "Wallet balance updated successfully",
				wallet: updatedWallet,
				updatedBy: user.email,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Update wallet balance error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to update wallet balance",
				details: error.message,
			});
		}
	},
);

export default router;
