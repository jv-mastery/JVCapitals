import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 50, // Increased from 20 to 50 for better concurrency
	idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
	connectionTimeoutMillis: 30000, // How long to wait when connecting a new client
	ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on("connect", () => {
	if (process.env.NODE_ENV !== "production") {
		console.log("Connected to PostgreSQL database");
	}
});

pool.on("error", (err) => {
	console.error("Unexpected error on idle client", err);
	process.exit(-1);
});

export const query = async (text, params) => {
	const start = Date.now();
	try {
		const res = await pool.query(text, params);
		const duration = Date.now() - start;
		if (process.env.NODE_ENV !== "production") {
			console.log("Executed query", { text, duration, rows: res.rowCount });
		}
		return res;
	} catch (error) {
		console.error("Database query error:", error);
		throw error;
	}
};

export const getClient = () => {
	return pool.connect();
};

export default pool;
