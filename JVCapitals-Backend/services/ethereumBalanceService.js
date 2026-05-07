import { ethers } from "ethers";

class EthereumBalanceService {
	constructor() {
		// Use working 1rpc.io endpoint (tested and working)
		this.provider = new ethers.JsonRpcProvider(
			"https://1rpc.io/eth", // 1rpc.io endpoint
		);
	}

	// Get balance for a single Ethereum address
	async getBalance(address) {
		try {
			console.log(`Fetching balance for address: ${address}`);

			// Get balance in wei
			const balanceWei = await this.provider.getBalance(address);

			// Convert to ETH
			const balanceEth = ethers.formatEther(balanceWei);

			console.log(`Balance for ${address}: ${balanceEth} ETH`);
			return balanceEth;
		} catch (error) {
			console.error(`Failed to get balance for ${address}:`, error);

			// Return 0 if API fails
			console.log("Returning 0 balance due to API error");
			return "0";
		}
	}

	// Get balances for multiple Ethereum addresses
	async getMultipleBalances(wallets) {
		const balancePromises = wallets.map(async (wallet) => {
			try {
				const balance = await this.getBalance(wallet.wallet_address);
				return {
					walletId: wallet.id,
					balance: balance,
					address: wallet.wallet_address,
					chainType: wallet.wallet_type,
				};
			} catch (error) {
				console.error(`Failed to get balance for wallet ${wallet.id}:`, error);
				return {
					walletId: wallet.id,
					balance: "0",
					address: wallet.wallet_address,
					chainType: wallet.wallet_type,
				};
			}
		});

		return await Promise.all(balancePromises);
	}

	// Test provider connection
	async testConnection() {
		try {
			const blockNumber = await this.provider.getBlockNumber();
			console.log(
				`Connected to Ethereum network. Current block: ${blockNumber}`,
			);
			return true;
		} catch (error) {
			console.error("Failed to connect to Ethereum network:", error);
			return false;
		}
	}
}

export default new EthereumBalanceService();
