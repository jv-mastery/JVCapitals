import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// Basic health check
router.get("/", async (req, res) => {
	try {
		const healthCheck = {
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV || "development",
			version: process.env.npm_package_version || "1.0.0",
			memory: process.memoryUsage(),
		};

		res.json(healthCheck);
	} catch (error) {
		console.error("Health check error:", error);
		res.status(503).json({
			status: "unhealthy",
			timestamp: new Date().toISOString(),
			error: error.message,
		});
	}
});

// Detailed health check with database
router.get("/detailed", async (req, res) => {
	try {
		const startTime = Date.now();

		// Test database connection
		let dbStatus = "disconnected";
		let dbResponseTime = null;

		try {
			const dbStart = Date.now();
			await query("SELECT 1");
			dbResponseTime = Date.now() - dbStart;
			dbStatus = "connected";
		} catch (dbError) {
			console.error("Database health check failed:", dbError);
		}

		// Test external services
		let services = {
			ethereum: { status: "unknown", responseTime: null },
		};

		// Test Ethereum service
		try {
			const ethStart = Date.now();
			const { default: EthereumBalanceService } =
				await import("../services/ethereumBalanceService.js");
			const isConnected = await EthereumBalanceService.testConnection();
			services.ethereum = {
				status: isConnected ? "connected" : "disconnected",
				responseTime: Date.now() - ethStart,
			};
		} catch (ethError) {
			services.ethereum.status = "error";
		}

		const healthCheck = {
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV || "development",
			version: process.env.npm_package_version || "1.0.0",
			responseTime: Date.now() - startTime,
			database: {
				status: dbStatus,
				responseTime: dbResponseTime,
			},
			services,
			memory: process.memoryUsage(),
			cpu: process.cpuUsage(),
		};

		// Determine overall health
		const isHealthy =
			dbStatus === "connected" && services.ethereum.status !== "error";

		if (!isHealthy) {
			healthCheck.status = "degraded";
		}

		res.status(isHealthy ? 200 : 503).json(healthCheck);
	} catch (error) {
		console.error("Detailed health check error:", error);
		res.status(503).json({
			status: "unhealthy",
			timestamp: new Date().toISOString(),
			error: error.message,
		});
	}
});

// Readiness probe (for Kubernetes/container orchestration)
router.get("/ready", async (req, res) => {
	try {
		// Check if database is ready
		await query("SELECT 1");

		res.json({
			status: "ready",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Readiness check failed:", error);
		res.status(503).json({
			status: "not ready",
			timestamp: new Date().toISOString(),
			error: "Database not ready",
		});
	}
});

// Liveness probe (for Kubernetes/container orchestration)
router.get("/live", async (req, res) => {
	res.json({
		status: "alive",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

export default router;
