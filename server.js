// backend/server.js
// SmartFuture Career Hub - Main Express Server

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/payment");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - allow frontend to connect
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
      // Add your deployed frontend URL here e.g. https://smartfuture.netlify.app
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Routes ───────────────────────────────────────────────────
// Mount payment routes at root (so /stk-push works directly)
app.use("/", paymentRoutes);

// Root health check
app.get("/", (req, res) => {
  res.json({
    message: "SmartFuture Career Hub API is running 🚀",
    version: "1.0.0",
    endpoints: {
      stkPush: "POST /stk-push",
      paymentStatus: "GET /payment-status",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SmartFuture Career Hub API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/`);
  console.log(`💳 STK Push:     POST http://localhost:${PORT}/stk-push\n`);
});