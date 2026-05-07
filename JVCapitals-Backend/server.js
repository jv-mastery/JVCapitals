import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import EnvValidator from "./utils/envValidator.js";
import ErrorHandler from "./middleware/errorHandler.js";
import SecurityMiddleware from "./middleware/security.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import cacheRoutes from "./routes/cache.js";
import seedPhraseRoutes from "./routes/seedPhrase.js";
import healthRoutes from "./routes/health.js";
import { cacheService } from "./services/cacheService.js";

dotenv.config();

// Validate environment variables
const envValidation = EnvValidator.validate();
if (!envValidation.isValid) {
	console.error("❌ Environment validation failed:");
	envValidation.errors.forEach((error) => console.error(`  - ${error}`));
	process.exit(1);
}

if (envValidation.warnings.length > 0) {
	console.warn("⚠️  Environment warnings:");
	envValidation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
}

console.log(`✅ Environment validated for ${envValidation.env}`);

const app = express();
const PORT = process.env.PORT || 3000;

// Production-ready security middleware
app.use(SecurityMiddleware.helmetConfig());
app.use(SecurityMiddleware.corsConfig());
app.use(SecurityMiddleware.securityHeaders());
app.use(SecurityMiddleware.requestSizeLimit());

// Request logging
app.use(ErrorHandler.requestLogger);

// Rate limiting - optimized for Render
const isDevelopment = process.env.NODE_ENV !== "production";
const limiter = rateLimit({
	windowMs: isDevelopment ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 min dev, 5 min prod
	max: isDevelopment ? 1000 : 500, // 1000 dev, 500 prod per windowMs
	message: "Too many requests from this IP, please try again later.",
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => {
		// Skip rate limiting for health checks and static assets
		return req.path.startsWith("/health") || req.path.startsWith("/static");
	},
});
app.use("/api/", limiter);

// Stricter rate limiting for auth endpoints - more lenient for development
const authLimiter = rateLimit({
	windowMs: isDevelopment ? 1 * 60 * 1000 : 10 * 60 * 1000, // 1 min dev, 10 min prod
	max: isDevelopment ? 50 : 20, // 50 dev, 20 prod per windowMs
	message: "Too many authentication attempts, please try again later.",
	standardHeaders: true,
	legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/refresh", authLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
	if (process.env.NODE_ENV !== "production") {
		console.log(
			`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`,
		);
	}
	next();
});

// Health check endpoint
// Health check routes
app.use("/health", healthRoutes);

// API routes with caching and rate limiting
app.use("/api/users", cacheService.middleware({ ttl: 60 }), userRoutes); // Cache user data for 1 minute
app.use("/api/cache", cacheRoutes);
app.use("/api/auth", SecurityMiddleware.rateLimiter(), authRoutes);
app.use(
	"/api/seed-phrase",
	SecurityMiddleware.strictRateLimiter(),
	seedPhraseRoutes,
);

// 404 handler
app.use(ErrorHandler.notFoundHandler);

// Global error handler
app.use(ErrorHandler.errorHandler);

// Start server
app.listen(PORT, () => {
	console.log(`🚀 JVCapitals Backend Server running on port ${PORT}`);
	console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
	console.log(
		`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`,
	);
	console.log(`🔐 Health checks available at /health`);
});

export default app;
