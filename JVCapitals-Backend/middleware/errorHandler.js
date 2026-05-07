import { request } from "http";

class ErrorHandler {
  static async errorHandler(err, req, res, next) {
    console.error("Error occurred:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === "development";
    
    let statusCode = err.statusCode || 500;
    let message = "Internal Server Error";
    let details = null;

    // Handle specific error types
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = "Validation Error";
      details = isDevelopment ? err.details : "Invalid input data";
    } else if (err.name === "UnauthorizedError") {
      statusCode = 401;
      message = "Unauthorized";
      details = "Invalid or missing authentication token";
    } else if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Unauthorized";
      details = "Invalid token";
    } else if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Unauthorized";
      details = "Token expired";
    } else if (err.code === "23505") { // PostgreSQL unique violation
      statusCode = 409;
      message = "Conflict";
      details = "Resource already exists";
    } else if (err.code === "23503") { // PostgreSQL foreign key violation
      statusCode = 400;
      message = "Bad Request";
      details = "Invalid reference";
    }

    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };

    if (details && isDevelopment) {
      response.details = details;
    }

    if (isDevelopment) {
      response.stack = err.stack;
    }

    res.status(statusCode).json(response);
  }

  static async notFoundHandler(req, res) {
    console.warn("404 Not Found:", {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });

    res.status(404).json({
      success: false,
      error: "Not Found",
      message: `Route ${req.method} ${req.url} not found`,
      timestamp: new Date().toISOString(),
    });
  }

  static async requestLogger(req, res, next) {
    const start = Date.now();
    
    // Log request
    console.log("Incoming request:", {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });

    // Capture response
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - start;
      
      console.log("Request completed:", {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      originalSend.call(this, body);
    };

    next();
  }
}

export default ErrorHandler;
