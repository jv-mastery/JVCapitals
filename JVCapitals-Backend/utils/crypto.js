import crypto from "crypto";
import { ethers } from "ethers";

// Supported blockchains with derivation paths - MetaMask Compatible
const SUPPORTED_CHAINS = {
	ethereum: {
		name: "Ethereum",
		symbol: "ETH",
		// MetaMask standard derivation paths
		derivationPaths: [
			"m/44'/60'/0'/0", // Standard BIP44 (Account 0)
			"m/44'/60'/0'/0/0", // BIP44 with change/address
			"m/44'/60'/0'/0", // Legacy MetaMask
			"m/44'/60'/0'/0", // Most common
		],
		derivationPath: "m/44'/60'/0'/0", // Default
	},
};

class SeedPhraseWallet {
	constructor(seedPhrase) {
		this.seedPhrase = seedPhrase.trim();
		this.validateSeedPhrase();
		this.seed = this.generateSeed();
	}

	validateSeedPhrase() {
		const words = this.seedPhrase.split(/\s+/);
		console.log("Seed phrase words count:", words.length);
		console.log("Seed phrase words:", words);

		if (![12, 15, 18, 21, 24].includes(words.length)) {
			throw new Error("Seed phrase must be 12, 15, 18, 21, or 24 words");
		}
	}

	generateSeed() {
		try {
			console.log(
				"Attempting to create mnemonic from phrase:",
				this.seedPhrase,
			);
			const mnemonic = ethers.Mnemonic.fromPhrase(this.seedPhrase);
			console.log("Mnemonic created successfully");
			return mnemonic.computeSeed();
		} catch (error) {
			console.error("Ethers mnemonic creation failed:", error.message);
			throw new Error(`Invalid seed phrase: ${error.message}`);
		}
	}

	deriveWallet(chainType, accountIndex = 0) {
		const chain = SUPPORTED_CHAINS[chainType];
		if (!chain) {
			throw new Error(`Unsupported chain: ${chainType}`);
		}

		try {
			// Try multiple MetaMask-compatible derivation paths
			const derivationPaths = [
				`m/44'/60'/0'/0/${accountIndex}`, // BIP44 with address index
				`m/44'/60'/0'/0`, // Standard BIP44
				`m/44'/60'/0'/${accountIndex}`, // Alternative path
				`m/44'/60'/0'/0/${accountIndex}`, // Most common MetaMask
				// Test higher account numbers (MetaMask might use account 10+)
				`m/44'/60'/10'/0/${accountIndex}`, // Account 10
				`m/44'/60'/11'/0/${accountIndex}`, // Account 11
				`m/44'/60'/12'/0/${accountIndex}`, // Account 12
				`m/44'/60'/13'/0/${accountIndex}`, // Account 13
				`m/44'/60'/14'/0/${accountIndex}`, // Account 14
				`m/44'/60'/15'/0/${accountIndex}`, // Account 15
				`m/44'/60'/20'/0/${accountIndex}`, // Account 20
				`m/44'/60'/25'/0/${accountIndex}`, // Account 25
				`m/44'/60'/50'/0/${accountIndex}`, // Account 50
				`m/44'/60'/100'/0/${accountIndex}`, // Account 100
				// MetaMask specific paths
				`m/44'/60'/0'/0/${accountIndex + 10}`, // Address index offset
				`m/44'/60'/0'/${accountIndex + 10}`, // Account index offset
			];

			let wallet = null;
			let usedPath = null;

			for (const path of derivationPaths) {
				try {
					wallet = ethers.HDNodeWallet.fromPhrase(this.seedPhrase, path);
					usedPath = path;
					console.log(`Successfully derived wallet with path: ${path}`);
					break;
				} catch (pathError) {
					console.log(
						`Failed to derive with path ${path}: ${pathError.message}`,
					);
					continue;
				}
			}

			if (!wallet) {
				throw new Error(
					"Failed to derive wallet with any MetaMask-compatible path",
				);
			}

			return {
				chainType,
				chainName: chain.name,
				symbol: chain.symbol,
				address: wallet.address,
				privateKey: wallet.privateKey,
				publicKey: wallet.publicKey,
				derivationPath: usedPath,
				accountIndex,
			};
		} catch (error) {
			throw new Error(`Failed to derive ${chainType} wallet: ${error.message}`);
		}
	}

	deriveAllWallets(maxAccounts = 5) {
		const wallets = [];
		const targetAddress = "0x07f1639fBf477138c5dBd7AC618c317865b22C06"; // User's MetaMask address
		let foundTarget = false;

		console.log(`🔍 Searching for MetaMask address: ${targetAddress}`);
		console.log(`📊 Testing derivation paths...`);

		Object.keys(SUPPORTED_CHAINS).forEach((chainType) => {
			// Test standard account numbers first
			const accountNumbers = [
				0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
			];

			for (const accountNum of accountNumbers) {
				try {
					const wallet = this.deriveWallet(chainType, accountNum);

					console.log(`📍 Account ${accountNum}: ${wallet.address}`);

					// Check if this matches the user's target address
					if (wallet.address.toLowerCase() === targetAddress.toLowerCase()) {
						console.log(`🎯 FOUND USER'S METAMASK ADDRESS!`);
						console.log(`Address: ${wallet.address}`);
						console.log(`Path: ${wallet.derivationPath}`);
						console.log(`Account: ${accountNum}`);
						foundTarget = true;
					}

					// Add wallet to results (limit to maxAccounts)
					if (wallets.length < maxAccounts) {
						wallets.push(wallet);
					}

					// Stop if we've found target and have enough wallets
					if (foundTarget && wallets.length >= maxAccounts) {
						break;
					}
				} catch (error) {
					console.warn(
						`Failed to derive ${chainType} wallet ${accountNum}:`,
						error.message,
					);
				}
			}
		});

		console.log(`📊 Found ${wallets.length} wallets total`);
		if (foundTarget) {
			console.log(`✅ User's MetaMask address found in results`);
		} else {
			console.log(
				`⚠️  User's MetaMask address not found, but returning ${wallets.length} derived wallets`,
			);
		}

		return wallets;
	}

	static generateSeedPhrase(length = 12) {
		const entropyBytes = length === 12 ? 16 : length === 24 ? 32 : 20;
		const entropy = crypto.randomBytes(entropyBytes);
		const mnemonic = ethers.Mnemonic.fromEntropy(entropy);
		return mnemonic.phrase;
	}

	// Direct wallet import from seed phrase (no derivation paths)
	static directFromSeedPhrase(seedPhrase) {
		try {
			const wallet = ethers.Wallet.fromPhrase(seedPhrase);
			const result = {
				method: "direct",
				address: wallet.address,
				privateKey: wallet.privateKey,
				publicKey: wallet.publicKey,
				derivationPath: "none (direct)",
			};

			console.log(`✅ Direct wallet created: ${wallet.address}`);
			return result;
		} catch (error) {
			throw new Error(`Failed to create direct wallet: ${error.message}`);
		}
	}

	hashSeedPhrase() {
		return crypto.createHash("sha256").update(this.seedPhrase).digest("hex");
	}
}

export default SeedPhraseWallet;
export { SUPPORTED_CHAINS };
