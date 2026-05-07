import NodeCache from "node-cache";

class CacheService {
	constructor(options = {}) {
		// Default cache settings: 10 minute TTL, check for expired keys every 120 seconds
		this.cache = new NodeCache({
			stdTTL: 600, // 10 minutes default TTL
			checkperiod: 120, // Check for expired keys every 2 minutes
			useClones: false, // Better performance, but be careful with mutations
			...options,
		});

		// Cache hit/miss statistics
		this.stats = {
			hits: 0,
			misses: 0,
			sets: 0,
			deletes: 0,
		};

		// Log cache events in development
		if (process.env.NODE_ENV !== "production") {
			this.cache.on("set", (key, value) => {
				console.log(`📦 Cache SET: ${key}`);
			});

			this.cache.on("del", (key, value) => {
				console.log(`🗑️  Cache DEL: ${key}`);
			});

			this.cache.on("expired", (key, value) => {
				console.log(`⏰ Cache EXPIRED: ${key}`);
			});
		}
	}

	// Get value from cache
	get(key) {
		const value = this.cache.get(key);
		if (value !== undefined) {
			this.stats.hits++;
			return value;
		} else {
			this.stats.misses++;
			return null;
		}
	}

	// Set value in cache with optional TTL
	set(key, value, ttl) {
		this.stats.sets++;
		return this.cache.set(key, value, ttl);
	}

	// Delete value from cache
	del(key) {
		this.stats.deletes++;
		return this.cache.del(key);
	}

	// Check if key exists
	has(key) {
		return this.cache.has(key);
	}

	// Get multiple keys
	mget(keys) {
		return this.cache.mget(keys);
	}

	// Set multiple keys
	mset(keyValuePairs, ttl) {
		return this.cache.mset(keyValuePairs, ttl);
	}

	// Delete multiple keys
	del(keys) {
		this.stats.deletes += keys.length;
		return this.cache.del(keys);
	}

	// Clear all cache
	flush() {
		return this.cache.flushAll();
	}

	// Get cache statistics
	getStats() {
		const cacheStats = this.cache.getStats();
		return {
			...cacheStats,
			...this.stats,
			hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
		};
	}

	// Get cache keys
	keys() {
		return this.cache.keys();
	}

	// Get cache size
	size() {
		return this.cache.keys().length;
	}

	// Cache a function result (memoization)
	async memoize(key, fn, ttl) {
		// Check cache first
		const cached = this.get(key);
		if (cached !== null) {
			return cached;
		}

		// Execute function and cache result
		try {
			const result = await fn();
			this.set(key, result, ttl);
			return result;
		} catch (error) {
			console.error(`Cache memoize error for key ${key}:`, error);
			throw error;
		}
	}

	// Cache middleware for Express routes
	middleware(options = {}) {
		const {
			keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
			ttl = 300, // 5 minutes default for route caching
			condition = () => true, // Cache only if condition returns true
		} = options;

		return (req, res, next) => {
			// Don't cache if condition fails
			if (!condition(req, res)) {
				return next();
			}

			const key = keyGenerator(req);
			const cached = this.get(key);

			if (cached) {
				// Return cached response
				res.set(cached.headers);
				return res.status(cached.status).json(cached.data);
			}

			// Intercept res.json to cache the response
			const originalJson = res.json;
			const cacheService = this; // Capture the correct context
			res.json = function (data) {
				// Only cache successful responses
				if (res.statusCode >= 200 && res.statusCode < 300) {
					const responseData = {
						status: res.statusCode,
						headers: res.getHeaders(),
						data,
					};
					cacheService.set(key, responseData, ttl);
				}
				return originalJson.call(this, data);
			};

			next();
		};
	}

	// Invalidate cache by pattern
	invalidatePattern(pattern) {
		const keys = this.keys();
		const regex = new RegExp(pattern);
		const keysToDelete = keys.filter((key) => regex.test(key));

		if (keysToDelete.length > 0) {
			this.del(keysToDelete);
			console.log(
				`🗑️  Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`,
			);
		}

		return keysToDelete.length;
	}
}

// Create singleton instance
export const cacheService = new CacheService();

// Export class for creating additional instances
export default CacheService;
