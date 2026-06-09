import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { cacheService } from "../services/cacheService.js";
import {
	userCacheMiddleware,
	invalidateCacheMiddleware,
	cachePatterns,
} from "../middleware/cache.js";
import EmailService from "../services/emailService.js";

const router = express.Router();

// Refresh access token
router.post("/refresh", async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).json({ error: "Refresh token required" });
		}

		// Verify refresh token
		const decoded = jwt.verify(
			refreshToken,
			process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
		);

		if (decoded.type !== "refresh") {
			return res.status(401).json({ error: "Invalid refresh token" });
		}

		// Get user from database
		const user = await User.findById(decoded.id);
		if (!user || !user.is_active) {
			return res.status(401).json({ error: "User not found or inactive" });
		}

		// Generate new access token
		const newAccessToken = await User.generateToken(user);

		res.json({
			token: newAccessToken,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				isAdmin: user.is_admin,
			},
		});
	} catch (error) {
		console.error("Token refresh error:", error);
		if (
			error.name === "TokenExpiredError" ||
			error.name === "JsonWebTokenError"
		) {
			return res
				.status(401)
				.json({ error: "Invalid or expired refresh token" });
		}
		res.status(500).json({ error: "Failed to refresh token" });
	}
});

// Register new user
router.post("/register", async (req, res) => {
	try {
		const { email, password, name } = req.body;

		// Basic validation
		if (!email || !password || !name) {
			return res
				.status(400)
				.json({ error: "Email, password, and name are required" });
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({ error: "Password must be at least 6 characters" });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		const user = await User.create({ email, password, name });

		// Send verification email
		try {
			await EmailService.sendVerificationEmail(
				user.email,
				user.name,
				user.verification_token,
			);
		} catch (emailError) {
			console.error("Failed to send verification email:", emailError);
		}

		res.status(201).json({
			message: "User registered successfully. Please verify your email.",
			email: user.email,
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(400).json({ error: error.message });
	}
});

// Login user
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		const user = await User.authenticate(email, password);
		const token = await User.generateToken(user);
		const refreshToken = await User.generateRefreshToken(user);

		// Create session
		const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
		await User.createSession(
			user.id,
			tokenHash,
			7 * 24 * 60 * 60, // 7 days in seconds
			req.ip,
			req.get("User-Agent"),
		);

		// Invalidate any existing user cache on login
		cacheService.invalidatePattern(`user:id:${user.id}`);
		cacheService.invalidatePattern(`user:email:*`);

		res.json({
			message: "Login successful",
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				is_admin: user.is_admin,
			},
			token,
			refreshToken,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(401).json({ error: error.message });
	}
});

// Get current user profile
router.get(
	"/me",
	authenticateToken,
	userCacheMiddleware({ ttl: 600 }),
	async (req, res) => {
		try {
			const fullUser = await User.getFullUserWithWallets(req.user.id);
			res.json({
				user: fullUser,
			});
		} catch (error) {
			console.error("Get profile error:", error);
			res.status(500).json({ error: "Failed to fetch user profile" });
		}
	},
);

// Logout user
router.post("/logout", authenticateToken, async (req, res) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

		await User.invalidateSession(tokenHash);

		res.json({ message: "Logout successful" });
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({ error: "Failed to logout" });
	}
});

// Logout from all devices
router.post("/logout-all", authenticateToken, async (req, res) => {
	try {
		await User.invalidateAllSessions(req.user.id);

		res.json({ message: "Logged out from all devices" });
	} catch (error) {
		console.error("Logout all error:", error);
		res.status(500).json({ error: "Failed to logout from all devices" });
	}
});

// Update user profile
router.put(
	"/profile",
	authenticateToken,
	invalidateCacheMiddleware(cachePatterns.user()),
	async (req, res) => {
		try {
			const { avatar_url, bio, phone, location, date_of_birth } = req.body;

			const updatedProfile = await User.updateProfile(req.user.id, {
				avatar_url,
				bio,
				phone,
				location,
				date_of_birth,
			});

			res.json({
				message: "Profile updated successfully",
				profile: updatedProfile,
			});
		} catch (error) {
			console.error("Update profile error:", error);
			res.status(500).json({ error: "Failed to update profile" });
		}
	},
);

// Update user settings
router.put(
	"/settings",
	authenticateToken,
	invalidateCacheMiddleware(cachePatterns.user()),
	async (req, res) => {
		try {
			const {
				theme,
				language,
				timezone,
				email_notifications,
				push_notifications,
				two_factor_enabled,
			} = req.body;

			const updatedSettings = await User.updateSettings(req.user.id, {
				theme,
				language,
				timezone,
				email_notifications,
				push_notifications,
				two_factor_enabled,
			});

			res.json({
				message: "Settings updated successfully",
				settings: updatedSettings,
			});
		} catch (error) {
			console.error("Update settings error:", error);
			res.status(500).json({ error: "Failed to update settings" });
		}
	},
);

// Public admin signup endpoint (for initial admin creation)
router.post("/admin-signup", async (req, res) => {
	try {
		const { email, password, name, adminCode } = req.body;

		// Basic validation
		if (!email || !password || !name || !adminCode) {
			return res
				.status(400)
				.json({ error: "Email, password, name, and admin code are required" });
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({ error: "Password must be at least 6 characters" });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Validate admin code
		if (adminCode !== process.env.ADMIN_CODE) {
			return res.status(400).json({ error: "Invalid admin code" });
		}

		// Create admin user
		const user = await User.create({ email, password, name, isAdmin: true });

		// Generate token for the new admin
		const token = await User.generateToken(user);

		// Create session
		const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
		await User.createSession(
			user.id,
			tokenHash,
			7 * 24 * 60 * 60, // 7 days in seconds
			req.ip,
			req.get("User-Agent"),
		);

		// Invalidate cache
		cacheService.invalidatePattern(`user:email:*`);
		cacheService.invalidatePattern(`users:*`);

		res.status(201).json({
			message: "Admin account created successfully",
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				is_admin: user.is_admin,
				created_at: user.created_at,
			},
			token,
		});
	} catch (error) {
		console.error("Admin signup error:", error);
		res.status(400).json({ error: error.message });
	}
});

// Admin create user endpoint (for existing admins to create users)
router.post("/admin/create-user", authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { email, password, name, adminCode } = req.body;

		// Basic validation
		if (!email || !password || !name) {
			return res
				.status(400)
				.json({ error: "Email, password, and name are required" });
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({ error: "Password must be at least 6 characters" });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Check if admin code is provided and valid
		let isAdmin = false;
		if (adminCode) {
			if (adminCode !== process.env.ADMIN_CODE) {
				return res.status(400).json({ error: "Invalid admin code" });
			}
			isAdmin = true;
		}

		// Create user with admin flag
		const user = await User.create({ email, password, name, isAdmin });

		// Invalidate cache
		cacheService.invalidatePattern(`user:email:*`);
		cacheService.invalidatePattern(`users:*`);

		res.status(201).json({
			message: `User created successfully${isAdmin ? " as admin" : ""}`,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				is_admin: user.is_admin,
				created_at: user.created_at,
			},
		});
	} catch (error) {
		console.error("Admin create user error:", error);
		res.status(400).json({ error: error.message });
	}
});

// Verify email address
router.get("/verify-email", async (req, res) => {
	try {
		const { token } = req.query;
		if (!token) return res.status(400).json({ error: "Token is required" });

		const user = await User.findByVerificationToken(token);
		if (!user)
			return res
				.status(400)
				.json({ error: "Invalid or expired verification token" });

		await User.verifyUser(user.id);

		res.json({ message: "Email verified successfully. You can now login." });
	} catch (error) {
		console.error("Verification error:", error);
		res.status(500).json({ error: "Verification failed" });
	}
});

// Request password reset
router.post("/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ error: "Email is required" });

		const token = crypto.randomBytes(32).toString("hex");
		const expires = new Date(Date.now() + 3600000); // 1 hour

		const user = await User.setResetToken(email, token, expires);

		// Even if user doesn't exist, we return 200 for security reasons
		if (user) {
			await EmailService.sendPasswordResetEmail(user.email, user.name, token);
		}

		res.json({
			message:
				"If an account with that email exists, a password reset link has been sent.",
		});
	} catch (error) {
		console.error("Forgot password error:", error);
		res.status(500).json({ error: "Failed to process request" });
	}
});

// Reset password using token
router.post("/reset-password", async (req, res) => {
	try {
		const { token, password } = req.body;

		if (!token || !password) {
			return res.status(400).json({ error: "Token and password are required" });
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({ error: "Password must be at least 6 characters" });
		}

		const user = await User.findByResetToken(token);
		if (!user) {
			return res.status(400).json({ error: "Invalid or expired reset token" });
		}

		await User.updatePassword(user.id, password);

		// Send confirmation email
		try {
			await EmailService.sendPasswordChangedEmail(user.email, user.name);
		} catch (emailError) {
			console.error("Confirmation email failed:", emailError);
		}

		res.json({ message: "Password updated successfully" });
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(500).json({ error: "Failed to reset password" });
	}
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ error: "Email is required" });
		}

		const user = await User.findByEmail(email);
		if (!user) {
			// Return success even if user not found for security reasons
			return res.json({
				message: "Verification email sent if account exists.",
			});
		}

		if (user.is_verified) {
			return res.status(400).json({ error: "Email is already verified" });
		}

		await EmailService.sendVerificationEmail(
			user.email,
			user.name,
			user.verification_token,
		);

		res.json({ message: "Verification email resent successfully" });
	} catch (error) {
		console.error("Resend verification error:", error);
		res.status(500).json({ error: "Failed to resend verification email" });
	}
});

export default router;
