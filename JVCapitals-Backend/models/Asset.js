import { query, getClient } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class Asset {
	static async create(assetData) {
		const {
			user_id,
			asset_type_id,
			name,
			symbol,
			quantity,
			purchase_price,
			current_price,
			wallet_id,
		} = assetData;
		const assetId = uuidv4();

		const sql = `
      INSERT INTO assets (id, user_id, asset_type_id, name, symbol, quantity, purchase_price, current_price, wallet_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

		const result = await query(sql, [
			assetId,
			user_id,
			asset_type_id,
			name,
			symbol,
			quantity,
			purchase_price,
			current_price,
			wallet_id,
		]);
		return result.rows[0];
	}

	static async findByUserId(userId) {
		const sql = `
      SELECT a.*, at.name as asset_type_name, at.description as asset_type_description,
             w.wallet_address, w.wallet_type,
             (a.quantity * a.current_price) as current_value,
             (a.quantity * a.purchase_price) as purchase_value,
             ((a.current_price - a.purchase_price) * a.quantity) as profit_loss
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.id
      LEFT JOIN wallets w ON a.wallet_id = w.id
      WHERE a.user_id = $1 AND a.is_active = true
      ORDER BY a.created_at DESC
    `;

		const result = await query(sql, [userId]);
		return result.rows;
	}

	static async findById(id) {
		const sql = `
      SELECT a.*, at.name as asset_type_name, at.description as asset_type_description,
             w.wallet_address, w.wallet_type,
             (a.quantity * a.current_price) as current_value,
             (a.quantity * a.purchase_price) as purchase_value,
             ((a.current_price - a.purchase_price) * a.quantity) as profit_loss
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.id
      LEFT JOIN wallets w ON a.wallet_id = w.id
      WHERE a.id = $1 AND a.is_active = true
    `;

		const result = await query(sql, [id]);
		return result.rows[0] || null;
	}

	static async updatePrice(id, newPrice) {
		const sql = `
      UPDATE assets
      SET current_price = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
      RETURNING *
    `;

		const result = await query(sql, [newPrice, id]);
		return result.rows[0];
	}

	static async updateQuantity(id, newQuantity) {
		const sql = `
      UPDATE assets
      SET quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
      RETURNING *
    `;

		const result = await query(sql, [newQuantity, id]);
		return result.rows[0];
	}

	static async transfer(assetId, newWalletId) {
		const client = await getClient();

		try {
			await client.query("BEGIN");

			// Update asset wallet
			const updateSql = `
        UPDATE assets
        SET wallet_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND is_active = true
        RETURNING *
      `;

			const result = await client.query(updateSql, [newWalletId, assetId]);

			await client.query("COMMIT");
			return result.rows[0];
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async deactivate(id) {
		const sql = `
      UPDATE assets
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

		const result = await query(sql, [id]);
		return result.rows[0];
	}

	static async getAssetTypes() {
		const sql = `
      SELECT * FROM asset_types
      ORDER BY name
    `;

		const result = await query(sql);
		return result.rows;
	}

	static async getUserPortfolioSummary(userId) {
		const sql = `
      SELECT 
        u.initial_balance,
        u.interest_earned,
        u.total_balance,
        COUNT(a.id) as total_assets,
        COALESCE(SUM(a.quantity * a.current_price), 0) as assets_value,
        COALESCE(SUM(a.quantity * a.purchase_price), 0) as assets_invested,
        COALESCE(SUM((a.current_price - a.purchase_price) * a.quantity), 0) as assets_profit_loss,
        COUNT(DISTINCT w.id) as total_wallets,
        COUNT(DISTINCT a.asset_type_id) as unique_asset_types
      FROM users u
      LEFT JOIN assets a ON a.user_id = u.id AND a.is_active = true
      LEFT JOIN wallets w ON a.wallet_id = w.id
      WHERE u.id = $1
      GROUP BY u.id, u.initial_balance, u.interest_earned, u.total_balance
    `;

		const result = await query(sql, [userId]);
		return result.rows[0];
	}
}
