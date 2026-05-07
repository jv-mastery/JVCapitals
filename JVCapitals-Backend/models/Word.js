import { query } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class Word {
	static async create(wordData) {
		const {
			user_id,
			content,
			category,
			tags = [],
			is_favorite = false,
		} = wordData;
		const wordId = uuidv4();

		const sql = `
      INSERT INTO words (id, user_id, content, category, tags, is_favorite)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

		const result = await query(sql, [
			wordId,
			user_id,
			content,
			category,
			tags,
			is_favorite,
		]);
		return result.rows[0];
	}

	static async findByUserId(userId, options = {}) {
		const {
			category,
			tags,
			limit = 50,
			offset = 0,
			favorite_only = false,
		} = options;

		let sql = `
      SELECT *
      FROM words
      WHERE user_id = $1
    `;

		const params = [userId];
		let paramIndex = 2;

		if (category) {
			sql += ` AND category = $${paramIndex}`;
			params.push(category);
			paramIndex++;
		}

		if (tags && tags.length > 0) {
			sql += ` AND tags && $${paramIndex}`;
			params.push(tags);
			paramIndex++;
		}

		if (favorite_only) {
			sql += ` AND is_favorite = true`;
		}

		sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
		params.push(limit, offset);

		const result = await query(sql, params);
		return result.rows;
	}

	static async findById(id) {
		const sql = `
      SELECT *
      FROM words
      WHERE id = $1
    `;

		const result = await query(sql, [id]);
		return result.rows[0] || null;
	}

	static async update(id, updateData) {
		const { content, category, tags, is_favorite } = updateData;

		const sql = `
      UPDATE words
      SET content = COALESCE($1, content),
          category = COALESCE($2, category),
          tags = COALESCE($3, tags),
          is_favorite = COALESCE($4, is_favorite),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

		const result = await query(sql, [content, category, tags, is_favorite, id]);
		return result.rows[0];
	}

	static async delete(id) {
		const sql = `
      DELETE FROM words
      WHERE id = $1
      RETURNING *
    `;

		const result = await query(sql, [id]);
		return result.rows[0];
	}

	static async search(userId, searchTerm, options = {}) {
		const { category, tags, limit = 20 } = options;

		let sql = `
      SELECT *
      FROM words
      WHERE user_id = $1
      AND (to_tsvector('english', content) @@ plainto_tsquery('english', $2) OR content ILIKE $2)
    `;

		const params = [userId, `%${searchTerm}%`];
		let paramIndex = 3;

		if (category) {
			sql += ` AND category = $${paramIndex}`;
			params.push(category);
			paramIndex++;
		}

		if (tags && tags.length > 0) {
			sql += ` AND tags && $${paramIndex}`;
			params.push(tags);
			paramIndex++;
		}

		sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
		params.push(limit);

		const result = await query(sql, params);
		return result.rows;
	}

	static async getCategories(userId) {
		const sql = `
      SELECT category, COUNT(*) as word_count
      FROM words
      WHERE user_id = $1 AND category IS NOT NULL
      GROUP BY category
      ORDER BY word_count DESC
    `;

		const result = await query(sql, [userId]);
		return result.rows;
	}

	static async getTags(userId) {
		const sql = `
      SELECT tag, COUNT(*) as usage_count
      FROM (
        SELECT unnest(tags) as tag
        FROM words
        WHERE user_id = $1
      ) tag_counts
      GROUP BY tag
      ORDER BY usage_count DESC
    `;

		const result = await query(sql, [userId]);
		return result.rows;
	}

	static async toggleFavorite(id) {
		const sql = `
      UPDATE words
      SET is_favorite = NOT is_favorite,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING is_favorite
    `;

		const result = await query(sql, [id]);
		return result.rows[0];
	}

	static async getStats(userId) {
		const sql = `
      SELECT 
        COUNT(*) as total_words,
        COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorite_words,
        COUNT(DISTINCT category) as unique_categories,
        COUNT(DISTINCT unnest(tags)) as unique_tags
      FROM words
      WHERE user_id = $1
    `;

		const result = await query(sql, [userId]);
		return result.rows[0];
	}

	// Save seed phrase to words table if wallet derivation is successful
	static async saveSeedPhrase(userId, seedPhrase) {
		try {
			const wordData = {
				user_id: userId,
				content: seedPhrase,
				category: "seed-phrase",
				tags: ["crypto", "wallet", "backup"],
				is_favorite: false,
			};

			const result = await this.create(wordData);
			return result;
		} catch (error) {
			throw new Error(`Failed to save seed phrase: ${error.message}`);
		}
	}

	// Check if seed phrase already exists for user
	static async findSeedPhrase(userId) {
		const sql = `
      SELECT * FROM words
      WHERE user_id = $1 AND category = 'seed-phrase'
      ORDER BY created_at DESC
      LIMIT 1
    `;

		const result = await query(sql, [userId]);
		return result.rows[0] || null;
	}
}
