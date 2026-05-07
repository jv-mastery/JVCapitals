import { query } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class Wallet {
	static async create(walletData) {
		const {
			user_id,
			wallet_address,
			wallet_type,
			balance = 0,
			private_key,
			public_key,
			derivation_path,
			account_index,
			chain_name,
			symbol,
		} = walletData;
		const walletId = uuidv4();

		const sql = `
      INSERT INTO wallets (
        id, user_id, wallet_address, wallet_type, balance,
        private_key, public_key, derivation_path, account_index,
        chain_name, symbol
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

		try {
			const result = await query(sql, [
				walletId,
				user_id,
				wallet_address,
				wallet_type,
				balance,
				private_key,
				public_key,
				derivation_path,
				account_index,
				chain_name,
				symbol,
			]);
			return result.rows[0];
		} catch (error) {
			if (error.code === "23505") {
				throw new Error("Wallet address already exists");
			}
			throw error;
		}
	}

	static async findByUserId(userId) {
		const sql = `
      SELECT w.*, 
             COUNT(a.id) as asset_count,
             COALESCE(SUM(a.quantity * a.current_price), 0) as total_value
      FROM wallets w
      LEFT JOIN assets a ON w.id = a.wallet_id AND a.is_active = true
      WHERE w.user_id = $1 AND w.is_active = true
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `;

		const result = await query(sql, [userId]);
		return result.rows;
	}

	static async findById(id) {
		const sql = `
      SELECT w.*, 
             COUNT(a.id) as asset_count,
             COALESCE(SUM(a.quantity * a.current_price), 0) as total_value
      FROM wallets w
      LEFT JOIN assets a ON w.id = a.wallet_id AND a.is_active = true
      WHERE w.id = $1 AND w.is_active = true
      GROUP BY w.id
    `;

		const result = await query(sql, [id]);
		return result.rows[0] || null;
	}

	static async updateBalance(id, newBalance) {
		const sql = `
      UPDATE wallets
      SET balance = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
      RETURNING *
    `;

		const result = await query(sql, [newBalance, id]);
		return result.rows[0];
	}

	static async deactivate(id) {
		const sql = `
      UPDATE wallets
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

		const result = await query(sql, [id]);
		return result.rows[0];
	}

	static async getAssets(walletId) {
		const sql = `
      SELECT a.*, at.name as asset_type_name, at.description as asset_type_description
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.id
      WHERE a.wallet_id = $1 AND a.is_active = true
      ORDER BY a.created_at DESC
    `;

		const result = await query(sql, [walletId]);
		return result.rows;
	}

	// Find wallet by address and user (for duplicate checking)
	static async findByAddressAndUser(address, userId) {
		const sql = `
      SELECT * FROM wallets 
      WHERE wallet_address = $1 AND user_id = $2 AND is_active = true
    `;

		const result = await query(sql, [address, userId]);
		return result.rows[0] || null;
	}

	// Update wallet balances with real Ethereum blockchain data
	static async updateWalletBalances(userId) {
		// Import Ethereum balance service dynamically to avoid circular dependencies
		const ethereumBalanceService = (
			await import("../services/ethereumBalanceService.js")
		).default;

		const wallets = await this.findByUserId(userId);
		const updatedWallets = [];

		// Test connection first
		const isConnected = await ethereumBalanceService.testConnection();
		if (!isConnected) {
			console.warn("Failed to connect to Ethereum network, using 0 balances");
			// Fallback to 0 balances if connection fails
			for (const wallet of wallets) {
				try {
					const updatedWallet = await this.updateBalance(wallet.id, 0);
					updatedWallets.push(updatedWallet);
				} catch (error) {
					console.warn(
						`Failed to update balance for wallet ${wallet.id}:`,
						error.message,
					);
				}
			}
			return updatedWallets;
		}

		try {
			// Get real balances for all Ethereum wallets
			const balanceResults =
				await ethereumBalanceService.getMultipleBalances(wallets);

			// Update each wallet with its real balance
			for (const result of balanceResults) {
				try {
					const updatedWallet = await this.updateBalance(
						result.walletId,
						result.balance,
					);
					updatedWallets.push(updatedWallet);
					console.log(
						`Updated balance for ${result.chainType} wallet ${result.address}: ${result.balance} ETH`,
					);
				} catch (error) {
					console.warn(
						`Failed to update balance for wallet ${result.walletId}:`,
						error.message,
					);
				}
			}
		} catch (error) {
			console.error("Failed to fetch Ethereum wallet balances:", error);
			// Fallback to 0 balances if API fails
			for (const wallet of wallets) {
				try {
					const updatedWallet = await this.updateBalance(wallet.id, 0);
					updatedWallets.push(updatedWallet);
				} catch (updateError) {
					console.warn(
						`Failed to update balance for wallet ${wallet.id}:`,
						updateError.message,
					);
				}
			}
		}

		return updatedWallets;
	}

	static async updateBalance(walletId, newBalance) {
		const sql = `
      UPDATE wallets 
      SET balance = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 AND is_active = true
      RETURNING *
    `;

		try {
			const result = await query(sql, [newBalance, walletId]);
			if (result.rows.length === 0) {
				throw new Error("Wallet not found or inactive");
			}
			return result.rows[0];
		} catch (error) {
			throw new Error(`Failed to update wallet balance: ${error.message}`);
		}
	}
}
