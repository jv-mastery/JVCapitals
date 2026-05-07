import fs from "fs";
import path from "path";
import { query } from "../config/db.js";

async function runAllMigrations() {
	try {
		console.log("🚀 Starting complete database migration...");

		// Run comprehensive schema with all features
		console.log("� Creating complete schema with UUID and balance fields...");
		const schemaPath = path.join(
			process.cwd(),
			"database",
			"schema_complete.sql",
		);
		const schema = fs.readFileSync(schemaPath, "utf8");
		await query(schema);
		console.log("✅ Complete schema created successfully");

		console.log("🎉 Migration completed successfully!");
		console.log("📝 Database is ready with:");
		console.log("   - UUID primary keys");
		console.log("   - Balance fields (initial, interest, total)");
		console.log("   - Complete schema with all indexes");
		console.log("   - Default data for asset types and transaction types");
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
