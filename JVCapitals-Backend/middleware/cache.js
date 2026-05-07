import { cacheService } from "../services/cacheService.js";

// Cache middleware for GET requests
export const cacheMiddleware = (options = {}) => {
	const {
		ttl = 300, // 5 minutes default
		keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
		condition = (req) => req.method === "GET", // Only cache GET requests by default
	} = options;

	return cacheService.middleware({
		ttl,
		keyGenerator,
		condition,
	});
};

// Cache middleware for specific user data
export const userCacheMiddleware = (options = {}) => {
	const {
		ttl = 600, // 10 minutes for user data
		keyGenerator = (req) => {
			// Include user ID in cache key for personalized data
			const userId = req.user?.id;
			return userId
				? `user:${userId}:${req.method}:${req.originalUrl}`
				: `${req.method}:${req.originalUrl}`;
		},
	} = options;

	return cacheService.middleware({
		ttl,
		keyGenerator,
		condition: (req) => req.method === "GET" && !!req.user?.id,
	});
};

// Cache invalidation middleware for POST/PUT/DELETE requests
export const invalidateCacheMiddleware = (patterns = []) => {
	return (req, res, next) => {
		const originalSend = res.send;

		res.send = function (data) {
			// Invalidate cache patterns after successful response
			if (res.statusCode >= 200 && res.statusCode < 300) {
				patterns.forEach((pattern) => {
					// Handle dynamic patterns (functions)
					if (typeof pattern === "function") {
						const patternString = pattern(req.user?.id);
						if (patternString) {
							cacheService.invalidatePattern(patternString);
						}
					} else {
						// Handle static patterns (strings)
						cacheService.invalidatePattern(pattern);
					}
				});
			}

			return originalSend.call(this, data);
		};

		next();
	};
};

// Specific cache invalidation patterns for different endpoints
export const cachePatterns = {
	// User-related patterns - will be dynamically resolved with userId
	user: () => [
		(userId) => `user:id:${userId}`,
		() => `user:email:*`,
		() => `GET:/users/wallets`,
		() => `GET:/users/assets`,
		() => `GET:/users/words`,
		() => `GET:/auth/me`,
	],

	// Wallet-related patterns
	wallet: () => [
		() => `GET:/users/wallets`,
		() => `GET:/users/assets`,
		() => `GET:/users/portfolio-summary`,
	],

	// Asset-related patterns
	asset: () => [
		() => `GET:/users/assets`,
		() => `GET:/users/asset-types`,
		() => `GET:/users/portfolio-summary`,
	],

	// Word-related patterns
	word: () => [
		() => `GET:/users/words`,
		() => `GET:/users/words/categories`,
		() => `GET:/users/words/tags`,
		() => `GET:/users/words/stats`,
	],
};

export default {
	cacheMiddleware,
	userCacheMiddleware,
	invalidateCacheMiddleware,
	cachePatterns,
};
