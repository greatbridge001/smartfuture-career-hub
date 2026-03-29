// backend/routes/payment.js
// Express routes for payment endpoints

const express = require("express");
const router = express.Router();
const { initiateStkPush, paymentStatus } = require("../controllers/paymentController");

// POST /stk-push - Initiate M-Pesa STK Push
router.post("/stk-push", initiateStkPush);

// GET /payment-status - Check payment service health
router.get("/payment-status", paymentStatus);

module.exports = router;