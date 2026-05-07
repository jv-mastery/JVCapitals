import express from "express";
import { Wallet } from "../models/Wallet.js";
import { Asset } from "../models/Asset.js";
import { Word } from "../models/Word.js";
import { User } from "../models/User.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
	cacheMiddleware,
	invalidateCacheMiddleware,
	cachePatterns,
} from "../middleware/cache.js";

const router = express.Router();

// Get user's wallets
router.get("/wallets", authenticateToken, async (req, res) => {
	try {
		const wallets = await Wallet.findByUserId(req.user.id);
		res.json({ wallets });
	} catch (error) {
		console.error("Get wallets error:", error);
		res.status(500).json({ error: "Failed to fetch wallets" });
	}
});

// Create new wallet
router.post(
	"/wallets",
	authenticateToken,
	invalidateCacheMiddleware([() => `GET:/users/all`]),
	async (req, res) => {
		try {
			const { wallet_address, wallet_type, balance = 0 } = req.body;

			if (!wallet_address || !wallet_type) {
				return res
					.status(400)
					.json({ error: "Wallet address and type are required" });
			}

			const wallet = await Wallet.create({
				user_id: req.user.id,
				wallet_address,
				wallet_type,
				balance,
			});

			res.status(201).json({
				message: "Wallet created successfully",
				wallet,
			});
		} catch (error) {
			console.error("Create wallet error:", error);
			res.status(400).json({ error: error.message });
		}
	},
);

// Get wallet details with assets
router.get("/wallets/:id", authenticateToken, async (req, res) => {
	try {
		const wallet = await Wallet.findById(req.params.id);

		if (!wallet || wallet.user_id !== req.user.id) {
			return res.status(404).json({ error: "Wallet not found" });
		}

		const assets = await Wallet.getAssets(wallet.id);

		res.json({
			wallet: { ...wallet, assets },
		});
	} catch (error) {
		console.error("Get wallet error:", error);
		res.status(500).json({ error: "Failed to fetch wallet" });
	}
});

// Update wallet balance
router.put(
	"/wallets/:id/balance",
	authenticateToken,
	invalidateCacheMiddleware([() => `GET:/users/all`]),
	async (req, res) => {
		try {
			const { balance } = req.body;

			if (typeof balance !== "number") {
				return res.status(400).json({ error: "Balance must be a number" });
			}

			const wallet = await Wallet.findById(req.params.id);

			if (!wallet || wallet.user_id !== req.user.id) {
				return res.status(404).json({ error: "Wallet not found" });
			}

			const updatedWallet = await Wallet.updateBalance(req.params.id, balance);

			res.json({
				message: "Wallet balance updated successfully",
				wallet: updatedWallet,
			});
		} catch (error) {
			console.error("Update wallet balance error:", error);
			res.status(500).json({ error: "Failed to update wallet balance" });
		}
	},
);

// Get user's assets
router.get("/assets", authenticateToken, async (req, res) => {
	try {
		const assets = await Asset.findByUserId(req.user.id);
		res.json({ assets });
	} catch (error) {
		console.error("Get assets error:", error);
		res.status(500).json({ error: "Failed to fetch assets" });
	}
});

// Create new asset
router.post(
	"/assets",
	authenticateToken,
	invalidateCacheMiddleware([() => `GET:/users/all`]),
	async (req, res) => {
		try {
			const {
				asset_type_id,
				name,
				symbol,
				quantity,
				purchase_price,
				current_price,
				wallet_id,
			} = req.body;

			if (!asset_type_id || !name || !quantity || !purchase_price) {
				return res.status(400).json({
					error: "Asset type, name, quantity, and purchase price are required",
				});
			}

			const asset = await Asset.create({
				user_id: req.user.id,
				asset_type_id,
				name,
				symbol,
				quantity,
				purchase_price,
				current_price: current_price || purchase_price,
				wallet_id,
			});

			res.status(201).json({
				message: "Asset created successfully",
				asset,
			});
		} catch (error) {
			console.error("Create asset error:", error);
			res.status(400).json({ error: error.message });
		}
	},
);

// Get asset types
router.get("/asset-types", authenticateToken, async (req, res) => {
	try {
		const assetTypes = await Asset.getAssetTypes();
		res.json({ asset_types: assetTypes });
	} catch (error) {
		console.error("Get asset types error:", error);
		res.status(500).json({ error: "Failed to fetch asset types" });
	}
});

// Get portfolio summary
router.get("/portfolio-summary", authenticateToken, async (req, res) => {
	try {
		const summary = await Asset.getUserPortfolioSummary(req.user.id);
		res.json({ summary });
	} catch (error) {
		console.error("Get portfolio summary error:", error);
		res.status(500).json({ error: "Failed to fetch portfolio summary" });
	}
});

// Get user's words
router.get("/words", authenticateToken, async (req, res) => {
	try {
		const { category, tags, limit = 50, offset = 0, favorite_only } = req.query;

		const options = {
			category: category || undefined,
			tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
			limit: parseInt(limit),
			offset: parseInt(offset),
			favorite_only: favorite_only === "true",
		};

		const words = await Word.findByUserId(req.user.id, options);
		res.json({ words });
	} catch (error) {
		console.error("Get words error:", error);
		res.status(500).json({ error: "Failed to fetch words" });
	}
});

// Create new word
router.post(
	"/words",
	authenticateToken,
	invalidateCacheMiddleware([() => `GET:/users/all`]),
	async (req, res) => {
		try {
			const { content, category, tags, is_favorite = false } = req.body;

			if (!content || content.trim() === "") {
				return res.status(400).json({ error: "Content is required" });
			}

			const word = await Word.create({
				user_id: req.user.id,
				content: content.trim(),
				category,
				tags: tags || [],
				is_favorite,
			});

			res.status(201).json({
				message: "Word created successfully",
				word,
			});
		} catch (error) {
			console.error("Create word error:", error);
			res.status(400).json({ error: error.message });
		}
	},
);

// Search words
router.get("/words/search", authenticateToken, async (req, res) => {
	try {
		const { q: searchTerm, category, tags, limit = 20 } = req.query;

		if (!searchTerm || searchTerm.trim() === "") {
			return res.status(400).json({ error: "Search term is required" });
		}

		const options = {
			category: category || undefined,
			tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
			limit: parseInt(limit),
		};

		const words = await Word.search(req.user.id, searchTerm, options);
		res.json({ words });
	} catch (error) {
		console.error("Search words error:", error);
		res.status(500).json({ error: "Failed to search words" });
	}
});

// Get word categories
router.get("/words/categories", authenticateToken, async (req, res) => {
	try {
		const categories = await Word.getCategories(req.user.id);
		res.json({ categories });
	} catch (error) {
		console.error("Get categories error:", error);
		res.status(500).json({ error: "Failed to fetch categories" });
	}
});

// Get word tags
router.get("/words/tags", authenticateToken, async (req, res) => {
	try {
		const tags = await Word.getTags(req.user.id);
		res.json({ tags });
	} catch (error) {
		console.error("Get tags error:", error);
		res.status(500).json({ error: "Failed to fetch tags" });
	}
});

// Get word statistics
router.get("/words/stats", authenticateToken, async (req, res) => {
	try {
		const stats = await Word.getStats(req.user.id);
		res.json({ stats });
	} catch (error) {
		console.error("Get word stats error:", error);
		res.status(500).json({ error: "Failed to fetch word statistics" });
	}
});

// Toggle word favorite status
router.put(
	"/words/:id/favorite",
	authenticateToken,
	invalidateCacheMiddleware([() => `GET:/users/all`]),
	async (req, res) => {
		try {
			const word = await Word.findById(req.params.id);

			if (!word || word.user_id !== req.user.id) {
				return res.status(404).json({ error: "Word not found" });
			}

			const updatedWord = await Word.toggleFavorite(req.params.id);

			res.json({
				message: "Word favorite status updated",
				is_favorite: updatedWord.is_favorite,
			});
		} catch (error) {
			console.error("Toggle favorite error:", error);
			res.status(500).json({ error: "Failed to toggle favorite status" });
		}
	},
);

// Update word
router.put(
	"/words/:id",
	authenticateToken,
	invalidateCacheMiddleware([() => `GET:/users/all`]),
	async (req, res) => {
		try {
			const word = await Word.findById(req.params.id);

			if (!word || word.user_id !== req.user.id) {
				return res.status(404).json({ error: "Word not found" });
			}

			const { content, category, tags, is_favorite } = req.body;

			const updatedWord = await Word.update(req.params.id, {
				content,
				category,
				tags,
				is_favorite,
			});

			res.json({
				message: "Word updated successfully",
				word: updatedWord,
			});
		} catch (error) {
			console.error("Update word error:", error);
			res.status(500).json({ error: "Failed to update word" });
		}
	},
);

// Delete word
router.delete("/words/:id", authenticateToken, async (req, res) => {
	try {
		const word = await Word.findById(req.params.id);

		if (!word || word.user_id !== req.user.id) {
			return res.status(404).json({ error: "Word not found" });
		}

		await Word.delete(req.params.id);

		res.json({ message: "Word deleted successfully" });
	} catch (error) {
		console.error("Delete word error:", error);
		res.status(500).json({ error: "Failed to delete word" });
	}
});

// Admin: Update user details
router.put(
	"/:id",
	authenticateToken,
	requireAdmin,
	invalidateCacheMiddleware([() => `GET:/users/all`]),
	async (req, res) => {
		try {
			const { name, email, is_admin, is_active } = req.body;
			const userId = req.params.id;

			// Validate input
			if (email && typeof email !== "string") {
				return res.status(400).json({ error: "Email must be a string" });
			}

			if (name && typeof name !== "string") {
				return res.status(400).json({ error: "Name must be a string" });
			}

			if (is_admin !== undefined && typeof is_admin !== "boolean") {
				return res
					.status(400)
					.json({ error: "Admin status must be a boolean" });
			}

			if (is_active !== undefined && typeof is_active !== "boolean") {
				return res
					.status(400)
					.json({ error: "Active status must be a boolean" });
			}

			const updatedUser = await User.updateUserDetails(userId, {
				name,
				email,
				is_admin,
				is_active,
			});

			res.json({
				message: "User details updated successfully",
				user: updatedUser,
			});
		} catch (error) {
			console.error("Update user details error:", error);
			res
				.status(500)
				.json({ error: error.message || "Failed to update user details" });
		}
	},
);

// Admin: Update user balance
router.put(
	"/:id/balance",
	authenticateToken,
	requireAdmin,
	invalidateCacheMiddleware([() => `GET:/users/all`]),
	async (req, res) => {
		try {
			const { initial_balance, interest_earned, total_balance } = req.body;
			const userId = req.params.id;

			// Validate input
			if (
				initial_balance !== undefined &&
				(typeof initial_balance !== "number" || initial_balance < 0)
			) {
				return res
					.status(400)
					.json({ error: "Initial balance must be a non-negative number" });
			}
			if (
				interest_earned !== undefined &&
				(typeof interest_earned !== "number" || interest_earned < 0)
			) {
				return res
					.status(400)
					.json({ error: "Interest earned must be a non-negative number" });
			}
			if (
				total_balance !== undefined &&
				(typeof total_balance !== "number" || total_balance < 0)
			) {
				return res
					.status(400)
					.json({ error: "Total balance must be a non-negative number" });
			}

			const updatedUser = await User.updateUserBalance(userId, {
				initial_balance,
				interest_earned,
				total_balance,
			});

			res.json({
				message: "User balance updated successfully",
				user: updatedUser,
			});
		} catch (error) {
			console.error("Update user balance error:", error);
			res
				.status(500)
				.json({ error: error.message || "Failed to update user balance" });
		}
	},
);

// Admin: Get all users with complete details
router.get("/all", authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { page = 1, limit = 50, search, is_admin, is_active } = req.query;

		const users = await User.getAllUsersWithDetails();

		// Apply filters if provided
		let filteredUsers = users;

		if (search) {
			const searchLower = search.toLowerCase();
			filteredUsers = filteredUsers.filter(
				(user) =>
					user.name.toLowerCase().includes(searchLower) ||
					user.email.toLowerCase().includes(searchLower),
			);
		}

		if (is_admin !== undefined) {
			const adminFilter = is_admin === "true";
			filteredUsers = filteredUsers.filter(
				(user) => user.is_admin === adminFilter,
			);
		}

		if (is_active !== undefined) {
			const activeFilter = is_active === "true";
			filteredUsers = filteredUsers.filter(
				(user) => user.is_active === activeFilter,
			);
		}

		// Pagination
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + parseInt(limit);
		const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

		// Calculate summary statistics
		const stats = {
			total_users: users.length,
			filtered_users: filteredUsers.length,
			admin_users: users.filter((u) => u.is_admin).length,
			active_users: users.filter((u) => u.is_active).length,
			total_balance: users.reduce((sum, u) => sum + u.total_balance, 0),
			total_assets: users.reduce((sum, u) => sum + u.asset_count, 0),
			total_words: users.reduce((sum, u) => sum + u.word_count, 0),
			users_with_wallets: users.filter((u) => u.wallets.length > 0).length,
			users_with_assets: users.filter((u) => u.assets.length > 0).length,
			users_with_words: users.filter((u) => u.words.length > 0).length,
		};

		res.json({
			users: paginatedUsers,
			stats,
			pagination: {
				current_page: parseInt(page),
				per_page: parseInt(limit),
				total_pages: Math.ceil(filteredUsers.length / limit),
				total_items: filteredUsers.length,
			},
		});
	} catch (error) {
		console.error("Get all users error:", error);
		console.error("Error details:", {
			message: error.message,
			code: error.code,
			detail: error.detail,
			hint: error.hint,
		});
		res.status(500).json({
			error: "Failed to fetch users",
			details:
				process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
});

export default router;
