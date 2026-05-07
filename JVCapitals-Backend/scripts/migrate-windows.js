// Windows-compatible migration script
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Import database config (CommonJS version for Windows compatibility)
const { query } = require("../config/db-commonjs.js");

async function runAllMigrations() {
	try {
		console.log("🚀 Starting complete database migration...");

		// Run comprehensive schema with all features
		console.log("📝 Creating complete schema with UUID and balance fields...");

		// Use path.resolve for Windows compatibility
		const schemaPath = path.resolve(
			process.cwd(),
			"database",
			"schema_complete.sql",
		);

		console.log(`📂 Reading schema from: ${schemaPath}`);

		if (!fs.existsSync(schemaPath)) {
			throw new Error(`Schema file not found: ${schemaPath}`);
		}

		const schema = fs.readFileSync(schemaPath, "utf8");
		console.log("📄 Schema file read successfully");

		await query(schema);
		console.log("✅ Complete schema created successfully");

		console.log("🎉 Migration completed successfully!");
		console.log("📝 Database is ready with:");
		console.log("   - UUID primary keys");
		console.log("   - Balance fields (initial, interest, total)");
		console.log("   - Complete schema with all indexes");
		console.log("   - Default data for asset types and transaction types");
	} catch (error) {
		console.error("❌ Migration failed:", error.message);
		console.error("📍 Stack trace:", error.stack);
		process.exit(1);
	}
}

// Run all migrations if this script is executed directly
if (require.main === module) {
	runAllMigrations()
		.then(() => {
			console.log("🏁 Migration script finished");
			process.exit(0);
		})
		.catch((error) => {
			console.error("💥 Unhandled error:", error);
			process.exit(1);
		});
}

module.exports = runAllMigrations;
