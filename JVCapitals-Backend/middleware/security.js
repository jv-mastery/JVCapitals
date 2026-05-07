import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { request } from "http";

class SecurityMiddleware {
	static rateLimiter() {
		return rateLimit({
			windowMs: 5 * 60 * 1000, // 5 minutes
			max: process.env.NODE_ENV === "production" ? 3000 : 1000, // Increased for multi-user hosting
			message: {
				success: false,
				error: "Too many requests...",
				message: "Rate limit exceeded. Please try again later.",
				retryAfter: "5 minutes",
			},
			standardHeaders: true, // Return rate limit info in headers
			legacyHeaders: false, // Disable the `X-RateLimit-*` headers
			handler: (req, res) => {
				if (process.env.NODE_ENV !== "production") {
					console.warn("Rate limit exceeded:", {
						ip: req.ip,
						url: req.url,
						userAgent: req.get("User-Agent"),
						timestamp: new Date().toISOString(),
					});
				}
				res.status(429).json({
					success: false,
					error: "Too many requests",
					message: "Rate limit exceeded. Please try again later.",
					retryAfter: "5 minutes",
				});
			},
		});
	}

	static strictRateLimiter() {
		return rateLimit({
			windowMs: 10 * 60 * 1000, // 10 minutes
			max: process.env.NODE_ENV === "production" ? 300 : 50, // Increased for multi-user hosting
			message: {
				success: false,
				error: "Too many requests",
				message:
					"Rate limit exceeded for sensitive operation. Please try again later.",
				retryAfter: "10 minutes",
			},
			skipSuccessfulRequests: false,
		});
	}

	static helmetConfig() {
		return helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					scriptSrc: ["'self'"],
					imgSrc: ["'self'", "data:", "https:"],
					connectSrc: ["'self'"],
					fontSrc: ["'self'"],
					objectSrc: ["'none'"],
					mediaSrc: ["'self'"],
					frameSrc: ["'none'"],
				},
			},
			crossOriginEmbedderPolicy: false, // Disable for development compatibility
		});
	}

	static corsConfig() {
		const allowedOrigins = process.env.FRONTEND_URL
			? [process.env.FRONTEND_URL]
			: ["http://localhost:5173", "http://localhost:3000"];

		return cors({
			origin: (origin, callback) => {
				// Allow requests with no origin (like mobile apps or curl requests)
				if (!origin) return callback(null, true);

				if (allowedOrigins.includes(origin)) {
					callback(null, true);
				} else {
					console.warn("CORS blocked request:", {
						origin,
						allowedOrigins,
						timestamp: new Date().toISOString(),
					});
					callback(new Error("Not allowed by CORS"));
				}
			},
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
			exposedHeaders: [
				"X-Total-Count",
				"X-RateLimit-Limit",
				"X-RateLimit-Remaining",
			],
		});
	}

	static requestSizeLimit() {
		return (req, res, next) => {
			const contentLength = req.get("content-length");
			const maxSize = 10 * 1024 * 1024; // 10MB

			if (contentLength && parseInt(contentLength) > maxSize) {
				return res.status(413).json({
					success: false,
					error: "Request too large",
					message: "Request body exceeds maximum size limit",
				});
			}

			next();
		};
	}

	static ipWhitelist() {
		return (req, res, next) => {
			// Only in production, implement IP whitelist if needed
			if (process.env.NODE_ENV === "production" && process.env.ALLOWED_IPS) {
				const allowedIPs = process.env.ALLOWED_IPS.split(",");
				const clientIP = req.ip || req.connection.remoteAddress;

				if (!allowedIPs.includes(clientIP)) {
					console.warn("IP blocked by whitelist:", {
						ip: clientIP,
						allowedIPs,
						timestamp: new Date().toISOString(),
					});

					return res.status(403).json({
						success: false,
						error: "Access denied",
						message: "Your IP address is not allowed to access this resource",
					});
				}
			}

			next();
		};
	}

	static securityHeaders() {
		return (req, res, next) => {
			// Additional security headers
			res.setHeader("X-Content-Type-Options", "nosniff");
			res.setHeader("X-Frame-Options", "DENY");
			res.setHeader("X-XSS-Protection", "1; mode=block");
			res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
			res.setHeader(
				"Permissions-Policy",
				"geolocation=(), microphone=(), camera=()",
			);

			next();
		};
	}
}

export default SecurityMiddleware;
