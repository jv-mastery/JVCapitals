import crypto from "crypto";

class EncryptionService {
	constructor() {
		// In production, use environment variables for encryption keys
		this.algorithm = "aes-256-gcm";
		this.keyLength = 32; // 256 bits
		this.ivLength = 16; // 128 bits
		this.tagLength = 16; // 128 bits
		this.secretKey = null;
		this.initialized = false;
	}

	ensureInitialized() {
		if (!this.initialized) {
			this.secretKey = this.getOrCreateKey();
			this.initialized = true;
		}
	}

	getOrCreateKey() {
		// In production, always use environment variable
		if (process.env.ENCRYPTION_KEY) {
			return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
		}

		// For development, generate a key (but warn in production)
		if (process.env.NODE_ENV === "production") {
			throw new Error(
				"ENCRYPTION_KEY environment variable is required in production",
			);
		}

		// Development: generate and store a key
		const key = crypto.randomBytes(this.keyLength);
		console.warn("⚠️  Using generated encryption key for development only");
		console.warn("Set ENCRYPTION_KEY environment variable in production");
		return key;
	}

	encrypt(text) {
		try {
			if (!text) return null;

			this.ensureInitialized();

			const iv = crypto.randomBytes(this.ivLength);
			const cipher = crypto.createCipherGCM(this.algorithm, this.secretKey);
			cipher.setAAD(Buffer.from("wallet-private-key", "utf8"));

			let encrypted = cipher.update(text, "utf8", "hex");
			encrypted += cipher.final("hex");

			const tag = cipher.getAuthTag();

			// Combine iv + tag + encrypted data
			const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, "hex")]);

			return combined.toString("hex");
		} catch (error) {
			console.error("Encryption error:", error);
			throw new Error("Failed to encrypt data");
		}
	}

	decrypt(encryptedData) {
		try {
			if (!encryptedData) return null;

			this.ensureInitialized();

			const combined = Buffer.from(encryptedData, "hex");

			// Extract iv, tag, and encrypted data
			const iv = combined.slice(0, this.ivLength);
			const tag = combined.slice(this.ivLength, this.ivLength + this.tagLength);
			const encrypted = combined.slice(this.ivLength + this.tagLength);

			const decipher = crypto.createDecipherGCM(this.algorithm, this.secretKey);
			decipher.setAAD(Buffer.from("wallet-private-key", "utf8"));
			decipher.setAuthTag(tag);

			let decrypted = decipher.update(encrypted, "hex", "utf8");
			decrypted += decipher.final("utf8");

			return decrypted;
		} catch (error) {
			console.error("Decryption error:", error);
			throw new Error("Failed to decrypt data");
		}
	}

	// Generate a new encryption key for production setup
	static generateKey() {
		return crypto.randomBytes(32).toString("hex");
	}

	// Validate encryption key format
	static validateKey(key) {
		try {
			const buffer = Buffer.from(key, "hex");
			return buffer.length === 32;
		} catch {
			return false;
		}
	}
}

export default EncryptionService;
