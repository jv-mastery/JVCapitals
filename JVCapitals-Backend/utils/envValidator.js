import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Required environment variables for production
const REQUIRED_ENV_VARS = {
	// Database
	DATABASE_URL: "Database connection URL",

	// JWT
	JWT_SECRET: "JWT secret key",
	JWT_EXPIRES_IN: "JWT expiration time",

	// Server
	PORT: "Server port",
	NODE_ENV: "Environment (development/production)",
	FRONTEND_URL: "Frontend URL for CORS",

	// Admin
	ADMIN_CODE: "Admin registration code",
};

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = {
	PORT: "3000",
	NODE_ENV: "development",
	JWT_EXPIRES_IN: "7d",
	FRONTEND_URL: "http://localhost:5173",
};

class EnvValidator {
	static validate() {
		const errors = [];
		const warnings = [];

		// Check required variables
		for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
			if (!process.env[key] || process.env[key].trim() === "") {
				errors.push(
					`Missing required environment variable: ${key} (${description})`,
				);
			}
		}

		// Validate DATABASE_URL format
		if (process.env.DATABASE_URL) {
			try {
				new URL(process.env.DATABASE_URL);
			} catch (error) {
				errors.push("Invalid DATABASE_URL format");
			}
		}

		// Security checks
		if (process.env.NODE_ENV === "production") {
			// In production, JWT_SECRET should be long and random
			const jwtSecret = process.env.JWT_SECRET;
			if (jwtSecret && jwtSecret.length < 32) {
				warnings.push(
					"JWT_SECRET should be at least 32 characters long in production",
				);
			}

			// Check for default secrets
			if (
				jwtSecret === "your_super_secret_jwt_key_here" ||
				jwtSecret === "your-super-secret-jwt-key-change-this-in-production"
			) {
				errors.push(
					"JWT_SECRET is using a default value - change it in production",
				);
			}

			// Database password should not be default
			const dbPassword = process.env.DB_PASSWORD;
			if (dbPassword === "your_password") {
				errors.push(
					"DB_PASSWORD is using a default value - change it in production",
				);
			}
		}

		// Set defaults for optional variables
		for (const [key, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
			if (!process.env[key] || process.env[key].trim() === "") {
				process.env[key] = defaultValue;
				warnings.push(`Using default value for ${key}: ${defaultValue}`);
			}
		}

		// Validate port number
		const port = parseInt(process.env.PORT);
		if (isNaN(port) || port < 1 || port > 65535) {
			errors.push(
				`Invalid PORT number: ${process.env.PORT}. Must be between 1 and 65535`,
			);
		}

		// Validate environment
		const validEnvs = ["development", "production", "test"];
		if (!validEnvs.includes(process.env.NODE_ENV)) {
			errors.push(
				`Invalid NODE_ENV: ${process.env.NODE_ENV}. Must be one of: ${validEnvs.join(", ")}`,
			);
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
			env: process.env.NODE_ENV,
		};
	}

	static getDatabaseConfig() {
		return {
			connectionString: process.env.DATABASE_URL,
			// Connection pooling for production
			max: process.env.NODE_ENV === "production" ? 20 : 10,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 30000,
			ssl: { rejectUnauthorized: false }, // SSL for external databases
		};
	}

	static isProduction() {
		return process.env.NODE_ENV === "production";
	}

	static getSecurityConfig() {
		return {
			jwtSecret: process.env.JWT_SECRET,
			jwtExpiresIn: process.env.JWT_EXPIRES_IN,
			adminCode: process.env.ADMIN_CODE,
			corsOrigin: process.env.FRONTEND_URL,
			isProduction: this.isProduction(),
		};
	}
}

export default EnvValidator;
