import fs from "fs";
import path from "path";
import { query } from "../config/db.js";

async function runAllMigrations() {
	try {
		console.log("🚀 Starting complete database migration...");

		// Run comprehensive schema with all features
		console.log("� Updating users table with auth fields...");
		const schemaPath = path.join(
			process.cwd(),
			"database",
			"update_users_auth_fields.sql",
		);
		const schema = fs.readFileSync(schemaPath, "utf8");
		await query(schema);
		console.log("✅ Users table updated successfully");

		console.log("🎉 Migration completed successfully!");
		console.log("📝 Database is ready with:");
		console.log("   - Auth fields (verification, reset password)");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
}

// Run all migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runAllMigrations();
}

export default runAllMigrations;