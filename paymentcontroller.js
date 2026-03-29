// backend/controllers/paymentController.js
// Handles all PayHero STK Push payment logic

const axios = require("axios");
const payheroConfig = require("../config/payhero");

/**
 * Validate Kenyan phone number
 * Must be in 2547XXXXXXXX or 2541XXXXXXXX format
 */
function validatePhone(phone) {
  const phoneStr = String(phone).trim();
  // Accept 254 format (12 digits starting with 2547 or 2541)
  const regex = /^254(7|1)\d{8}$/;
  return regex.test(phoneStr);
}

/**
 * Initiate STK Push via PayHero API
 * POST /stk-push
 */
async function initiateStkPush(req, res) {
  try {
    const { phone, amount } = req.body;

    // --- Input Validation ---
    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone number and amount are required.",
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid phone number. Use format: 2547XXXXXXXX or 2541XXXXXXXX",
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number (minimum KES 1).",
      });
    }

    // --- Check PayHero Config ---
    if (!payheroConfig.isConfigured()) {
      console.error("PayHero credentials are not configured in .env");
      return res.status(500).json({
        success: false,
        message: "Payment service not configured. Contact support.",
      });
    }

    // --- Build PayHero Request ---
    const requestPayload = {
      amount: parsedAmount,
      phone_number: String(phone).trim(),
      channel_id: parseInt(payheroConfig.channelId),
      provider: "m-pesa",
      external_reference: `SF-${Date.now()}`, // Unique reference per transaction
      callback_url: "https://your-callback-url.com/payment-callback", // Update this on Render
    };

    console.log(`[PayHero] Initiating STK Push → Phone: ${phone}, Amount: KES ${parsedAmount}`);

    // --- Call PayHero API ---
    const response = await axios.post(payheroConfig.apiUrl, requestPayload, {
      headers: {
        Authorization: payheroConfig.getAuthHeader(),
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    console.log("[PayHero] API Response:", response.data);

    // --- Return Success ---
    return res.status(200).json({
      success: true,
      message: "STK Push sent successfully. Please enter your M-Pesa PIN.",
      data: response.data,
    });
  } catch (error) {
    // --- Handle Axios / API Errors ---
    if (error.response) {
      console.error("[PayHero] API Error:", error.response.status, error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message:
          error.response.data?.message ||
          "Payment request failed. Please try again.",
        error: error.response.data,
      });
    } else if (error.request) {
      console.error("[PayHero] No response received:", error.message);
      return res.status(503).json({
        success: false,
        message: "Payment service unavailable. Check your internet connection.",
      });
    } else {
      console.error("[PayHero] Request setup error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error. Please try again.",
      });
    }
  }
}

/**
 * Health check endpoint for payment service
 * GET /payment-status
 */
function paymentStatus(req, res) {
  res.json({
    success: true,
    service: "SmartFuture Career Hub Payment API",
    payheroConfigured: payheroConfig.isConfigured(),
    timestamp: new Date().toISOString(),
  });
}

module.exports = { initiateStkPush, paymentStatus };