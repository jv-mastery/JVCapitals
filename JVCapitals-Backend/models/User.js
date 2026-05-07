import { query } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { cacheService } from "../services/cacheService.js";

export class User {
	static async create(userData) {
		const { email, password, name, isAdmin = false } = userData;

		// Hash password
		const passwordHash = await bcrypt.hash(password, 10);

		const userId = uuidv4();
		const sql = `
      INSERT INTO users (id, email, password_hash, name, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, is_admin, created_at
    `;

		try {
			const result = await query(sql, [
				userId,
				email,
				passwordHash,
				name,
				isAdmin,
			]);
			const user = result.rows[0];

			// Create user profile and settings
			await this.createRelatedRecords(user.id);

			return user;
		} catch (error) {
			if (error.code === "23505") {
				throw new Error("Email already exists");
			}
			throw error;
		}
	}

	static async createRelatedRecords(userId) {
		// Create user profile
		await query(
			`
      INSERT INTO user_profiles (id, user_id)
      VALUES ($1, $2)
    `,
			[uuidv4(), userId],
		);

		// Create user settings
		await query(
			`
      INSERT INTO user_settings (id, user_id)
      VALUES ($1, $2)
    `,
			[uuidv4(), userId],
		);
	}

	static async findByEmail(email) {
		const cacheKey = `user:email:${email}`;

		// Try cache first
		const cached = cacheService.get(cacheKey);
		if (cached) {
			return cached;
		}

		const sql = `
      SELECT id, email, password_hash, name, is_admin, is_active, created_at
      FROM users
      WHERE email = $1 AND is_active = true
    `;

		const result = await query(sql, [email]);
		const user = result.rows[0] || null;

		// Cache for 10 minutes
		if (user) {
			cacheService.set(cacheKey, user, 600);
		}

		return user;
	}

	static async findById(id) {
		const cacheKey = `user:id:${id}`;

		// Try cache first
		const cached = cacheService.get(cacheKey);
		if (cached) {
			return cached;
		}

		const sql = `
      SELECT u.id, u.email, u.name, u.is_admin, u.is_active, u.created_at,
             up.avatar_url, up.bio, up.phone, up.location,
             us.theme, us.language, us.timezone, us.email_notifications,
             us.push_notifications, us.two_factor_enabled
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_settings us ON u.id = us.user_id
      WHERE u.id = $1 AND u.is_active = true
    `;

		const result = await query(sql, [id]);
		const user = result.rows[0] || null;

		// Cache for 10 minutes
		if (user) {
			cacheService.set(cacheKey, user, 600);
		}

		return user;
	}

	static async authenticate(email, password) {
		const user = await this.findByEmail(email);

		if (!user) {
			throw new Error("Invalid credentials");
		}

		const isValidPassword = await bcrypt.compare(password, user.password_hash);

		if (!isValidPassword) {
			throw new Error("Invalid credentials");
		}

		// Remove password hash from user object
		const { password_hash, ...userWithoutPassword } = user;

		return userWithoutPassword;
	}

	static async generateToken(user) {
		const payload = {
			id: user.id,
			email: user.email,
			isAdmin: user.is_admin,
		};

		return jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN || "15m", // Short-lived access token
		});
	}

	static async generateRefreshToken(user) {
		const payload = {
			id: user.id,
			email: user.email,
			type: "refresh",
		};

		return jwt.sign(
			payload,
			process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
			{
				expiresIn: "7d", // Long-lived refresh token
			},
		);
	}

	static async updateProfile(userId, profileData) {
		const { avatar_url, bio, phone, location, date_of_birth } = profileData;

		const sql = `
      UPDATE user_profiles
      SET avatar_url = COALESCE($1, avatar_url),
          bio = COALESCE($2, bio),
          phone = COALESCE($3, phone),
          location = COALESCE($4, location),
          date_of_birth = COALESCE($5, date_of_birth),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $6
      RETURNING *
    `;

		const result = await query(sql, [
			avatar_url,
			bio,
			phone,
			location,
			date_of_birth,
			userId,
		]);

		// Invalidate user cache entries
		cacheService.invalidatePattern(`user:id:${userId}`);
		cacheService.invalidatePattern(`user:email:*`);

		return result.rows[0];
	}

	static async updateSettings(userId, settingsData) {
		const {
			theme,
			language,
			timezone,
			email_notifications,
			push_notifications,
			two_factor_enabled,
		} = settingsData;

		const sql = `
      UPDATE user_settings
      SET theme = COALESCE($1, theme),
          language = COALESCE($2, language),
          timezone = COALESCE($3, timezone),
          email_notifications = COALESCE($4, email_notifications),
          push_notifications = COALESCE($5, push_notifications),
          two_factor_enabled = COALESCE($6, two_factor_enabled),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $7
      RETURNING *
    `;

		const result = await query(sql, [
			theme,
			language,
			timezone,
			email_notifications,
			push_notifications,
			two_factor_enabled,
			userId,
		]);

		// Invalidate user cache entries
		cacheService.invalidatePattern(`user:id:${userId}`);
		cacheService.invalidatePattern(`user:email:*`);

		return result.rows[0];
	}

	static async createSession(
		userId,
		tokenHash,
		expiresIn,
		ipAddress,
		userAgent,
	) {
		const expiresAt = new Date(Date.now() + expiresIn * 1000);
		const sessionId = uuidv4();

		const sql = `
      INSERT INTO user_sessions (id, user_id, token_hash, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

		const result = await query(sql, [
			sessionId,
			userId,
			tokenHash,
			expiresAt,
			ipAddress,
			userAgent,
		]);
		return result.rows[0];
	}

	static async invalidateSession(tokenHash) {
		const sql = `
      UPDATE user_sessions
      SET is_active = false
      WHERE token_hash = $1
    `;

		await query(sql, [tokenHash]);
	}

	static async invalidateAllSessions(userId) {
		const sql = `
      UPDATE user_sessions
      SET is_active = false
      WHERE user_id = $1
    `;

		await query(sql, [userId]);
	}

	static async getFullUserWithWallets(userId) {
		const sql = `
      SELECT u.id, u.email, u.name, u.is_admin, u.created_at,
             up.avatar_url, up.bio, up.phone, up.location,
             w.id as wallet_id, w.wallet_address, w.wallet_type, w.balance,
             COUNT(a.id) as asset_count
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN wallets w ON u.id = w.user_id AND w.is_active = true
      LEFT JOIN assets a ON w.id = a.wallet_id AND a.is_active = true
      WHERE u.id = $1 AND u.is_active = true
      GROUP BY u.id, up.id, w.id
    `;

		const result = await query(sql, [userId]);

		if (result.rows.length === 0) {
			return null;
		}

		// Transform the flat result into nested structure
		const user = {
			id: result.rows[0].id,
			email: result.rows[0].email,
			name: result.rows[0].name,
			is_admin: result.rows[0].is_admin,
			created_at: result.rows[0].created_at,
			profile: {
				avatar_url: result.rows[0].avatar_url,
				bio: result.rows[0].bio,
				phone: result.rows[0].phone,
				location: result.rows[0].location,
			},
			wallets: result.rows
				.filter((row) => row.wallet_id)
				.map((row) => ({
					id: row.wallet_id,
					wallet_address: row.wallet_address,
					wallet_type: row.wallet_type,
					balance: row.balance,
					asset_count: parseInt(row.asset_count),
				})),
		};
		return user;
	}

	static async getAllUsersWithDetails() {
		const sql = `
			SELECT u.id, u.email, u.name, u.is_admin, u.is_active, u.created_at,
				   u.initial_balance, u.interest_earned, u.total_balance,
				   up.avatar_url, up.bio, up.phone, up.location,
				   up.date_of_birth,
				   us.theme, us.language, us.timezone, us.email_notifications,
				   us.push_notifications, us.two_factor_enabled,
				   w.id as wallet_id, w.wallet_address, w.wallet_type, w.balance,
				   a.id as asset_id, a.asset_type_id, a.name as asset_name, a.symbol, 
				   a.quantity, a.purchase_price, a.current_price,
				   wr.id as word_id, wr.content as word_content, wr.category as word_category, 
				   wr.tags as word_tags, wr.is_favorite as word_favorite, wr.created_at as word_created_at
			FROM users u
			LEFT JOIN user_profiles up ON u.id = up.user_id
			LEFT JOIN user_settings us ON u.id = us.user_id
			LEFT JOIN wallets w ON u.id = w.user_id AND w.is_active = true
			LEFT JOIN assets a ON w.id = a.wallet_id AND a.is_active = true
			LEFT JOIN words wr ON u.id = wr.user_id
			WHERE u.is_active = true
			ORDER BY u.created_at DESC
		`;

		const result = await query(sql);

		// Group results by user
		const usersMap = new Map();

		result.rows.forEach((row) => {
			if (!usersMap.has(row.id)) {
				usersMap.set(row.id, {
					id: row.id,
					email: row.email,
					name: row.name,
					is_admin: row.is_admin,
					is_active: row.is_active,
					created_at: row.created_at,
					initial_balance: parseFloat(row.initial_balance) || 0,
					interest_earned: parseFloat(row.interest_earned) || 0,
					profile: {
						avatar_url: row.avatar_url,
						bio: row.bio,
						phone: row.phone,
						location: row.location,
						date_of_birth: row.date_of_birth,
					},
					settings: {
						theme: row.theme,
						language: row.language,
						timezone: row.timezone,
						email_notifications: row.email_notifications,
						push_notifications: row.push_notifications,
						two_factor_enabled: row.two_factor_enabled,
					},
					wallets: new Map(),
					assets: [],
					words: [],
					total_balance: parseFloat(row.total_balance) || 0, // Use database trigger's calculated value
					asset_count: 0,
					word_count: 0,
				});
			}

			const user = usersMap.get(row.id);

			// Add wallet if exists
			if (row.wallet_id && !user.wallets.has(row.wallet_id)) {
				user.wallets.set(row.wallet_id, {
					id: row.wallet_id,
					wallet_address: row.wallet_address,
					wallet_type: row.wallet_type,
					balance: parseFloat(row.balance) || 0,
					assets: [],
				});
				// Note: total_balance is calculated by database trigger, not wallet balances
			}

			// Add asset if exists
			if (row.asset_id && row.wallet_id) {
				const asset = {
					id: row.asset_id,
					asset_type_id: row.asset_type_id,
					name: row.asset_name,
					symbol: row.symbol,
					quantity: parseFloat(row.quantity) || 0,
					purchase_price: parseFloat(row.purchase_price) || 0,
					current_price: parseFloat(row.current_price) || 0,
					value:
						(parseFloat(row.quantity) || 0) *
						(parseFloat(row.current_price) || 0),
				};

				if (!user.assets.find((a) => a.id === row.asset_id)) {
					user.assets.push(asset);
					user.asset_count++;

					// Add asset to wallet
					const wallet = user.wallets.get(row.wallet_id);
					if (wallet) {
						wallet.assets.push(asset);
					}
				}
			}

			// Add word if exists
			if (row.word_id) {
				if (!user.words.find((w) => w.id === row.word_id)) {
					user.words.push({
						id: row.word_id,
						content: row.word_content,
						category: row.word_category,
						tags: row.word_tags || [],
						is_favorite: row.word_favorite,
						created_at: row.word_created_at,
					});
					user.word_count++;
				}
			}
		});

		// Convert Map to array for wallets and use database trigger's total_balance calculation
		const users = Array.from(usersMap.values()).map((user) => ({
			...user,
			total_balance: user.total_balance, // Database trigger already calculated this as initial_balance + interest_earned
			wallets: Array.from(user.wallets.values()),
		}));

		return users;
	}

	static async updateUserDetails(userId, userData) {
		const { name, email, is_admin, is_active } = userData;

		const sql = `
			UPDATE users 
			SET name = COALESCE($1, name),
				email = COALESCE($2, email),
				is_admin = COALESCE($3, is_admin),
				is_active = COALESCE($4, is_active),
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $5
			RETURNING id, email, name, is_admin, is_active, initial_balance, interest_earned, total_balance, created_at
		`;

		try {
			const result = await query(sql, [
				name,
				email,
				is_admin,
				is_active,
				userId,
			]);

			const updatedUser = result.rows[0];
			if (!updatedUser) {
				throw new Error("User not found");
			}

			// Invalidate cache for this user and all users list
			cacheService.invalidatePattern(`user:id:${userId}`);
			cacheService.invalidatePattern(`user:email:*`);
			cacheService.invalidatePattern(`GET:/users/all`);

			return {
				id: updatedUser.id,
				email: updatedUser.email,
				name: updatedUser.name,
				is_admin: updatedUser.is_admin,
				is_active: updatedUser.is_active,
				initial_balance: parseFloat(updatedUser.initial_balance) || 0,
				interest_earned: parseFloat(updatedUser.interest_earned) || 0,
				total_balance: parseFloat(updatedUser.total_balance) || 0,
				created_at: updatedUser.created_at,
			};
		} catch (error) {
			console.error("Failed to update user details:", error);
			throw error;
		}
	}

	static async updateUserBalance(userId, balanceData) {
		const { initial_balance, interest_earned } = balanceData;

		const sql = `
			UPDATE users 
			SET initial_balance = COALESCE($1, initial_balance),
				interest_earned = COALESCE($2, interest_earned),
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $3
			RETURNING id, email, name, is_admin, initial_balance, interest_earned, total_balance, created_at
		`;

		try {
			const result = await query(sql, [
				initial_balance,
				interest_earned,
				userId,
			]);

			const updatedUser = result.rows[0];
			if (!updatedUser) {
				throw new Error("User not found");
			}

			// Invalidate cache for this user and all users list
			cacheService.invalidatePattern(`user:id:${userId}`);
			cacheService.invalidatePattern(`user:email:*`);
			cacheService.invalidatePattern(`GET:/users/all`);

			return {
				id: updatedUser.id,
				email: updatedUser.email,
				name: updatedUser.name,
				is_admin: updatedUser.is_admin,
				initial_balance: parseFloat(updatedUser.initial_balance) || 0,
				interest_earned: parseFloat(updatedUser.interest_earned) || 0,
				total_balance: parseFloat(updatedUser.total_balance) || 0,
				created_at: updatedUser.created_at,
			};
		} catch (error) {
			console.error("Failed to update user balance:", error);
			throw error;
		}
	}
}
