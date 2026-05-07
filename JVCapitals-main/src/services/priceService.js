class PriceService {
	constructor() {
		// Cache prices for 5 minutes to avoid API rate limits
		this.priceCache = new Map();
		this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
	}

	// Utility function to add delay before API calls
	async delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Get current Ethereum price from CoinGecko
	async getEthereumPrice() {
		const cacheKey = "ethereum_price";

		// Check cache first
		const cachedData = this.priceCache.get(cacheKey);
		if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
			if (process.env.NODE_ENV !== "production") {
				console.log("Using cached ETH price:", cachedData.price);
			}
			return cachedData.price;
		}

		try {
			if (process.env.NODE_ENV !== "production") {
				console.log("Fetching ETH price from CoinGecko...");
			}

			await this.delay(200);
			const response = await fetch(
				"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
				{
					method: "GET",
					headers: {
						Accept: "application/json",
					},
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			if (process.env.NODE_ENV !== "production") {
				console.log("CoinGecko response:", data);
			}

			const price = data.ethereum?.usd;

			if (process.env.NODE_ENV !== "production") {
				console.log("eth: ", price);
			}

			if (!price || isNaN(price) || price <= 0) {
				throw new Error(`Invalid price data received: ${price}`);
			}

			// Cache the price with timestamp
			this.priceCache.set(cacheKey, {
				price,
				timestamp: Date.now(),
			});

			if (process.env.NODE_ENV !== "production") {
				console.log("✅ ETH price fetched successfully:", price);
			}
			return price;
		} catch (error) {
			console.error(
				"❌ Failed to fetch ETH price from CoinGecko:",
				error.message,
			);

			// Use fallback price if API fails
			const fallbackPrice = 3500;
			if (process.env.NODE_ENV !== "production") {
				console.log("Using fallback ETH price:", fallbackPrice);
			}
			return fallbackPrice;
		}
	}

	// Get price for multiple cryptocurrencies
	async getPrices(cryptoIds = ["ethereum"]) {
		const cacheKey = `prices_${cryptoIds.join(",")}`;

		// Check cache first
		const cachedData = this.priceCache.get(cacheKey);
		if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
			if (process.env.NODE_ENV !== "production") {
				console.log("Using cached prices:", cachedData.prices);
			}
			return cachedData.prices;
		}

		try {
			const ids = cryptoIds.join(",");
			await this.delay(200);
			const response = await fetch(
				`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
				{
					method: "GET",
					headers: {
						Accept: "application/json",
					},
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			// Transform data to simple format
			const prices = {};
			cryptoIds.forEach((id) => {
				prices[id] = data[id]?.usd || 0;
			});

			// Cache the prices with timestamp
			this.priceCache.set(cacheKey, {
				prices,
				timestamp: Date.now(),
			});

			if (process.env.NODE_ENV !== "production") {
				console.log("Fetched new prices:", prices);
			}
			return prices;
		} catch (error) {
			console.error("Failed to fetch prices:", error);

			// Return fallback prices
			const fallbackPrices = {};
			cryptoIds.forEach((id) => {
				fallbackPrices[id] = id === "ethereum" ? 3500 : 2000;
			});
			if (process.env.NODE_ENV !== "production") {
				console.log("Using fallback prices:", fallbackPrices);
			}
			return fallbackPrices;
		}
	}

	// Clear cache manually
	clearCache() {
		this.priceCache.clear();
		if (process.env.NODE_ENV !== "production") {
			console.log("Price cache cleared");
		}
	}

	// Get cache info
	getCacheInfo() {
		return {
			size: this.priceCache.size,
			keys: Array.from(this.priceCache.keys()),
		};
	}
}

// Export singleton instance
export const priceService = new PriceService();
export default priceService;
