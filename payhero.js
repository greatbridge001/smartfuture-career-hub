// backend/config/payhero.js
// PayHero API configuration and credentials loader

require("dotenv").config();

const payheroConfig = {
  username: process.env.PAYHERO_USERNAME,
  password: process.env.PAYHERO_PASSWORD,
  channelId: process.env.PAYHERO_CHANNEL_ID,
  apiUrl: "https://backend.payhero.co.ke/api/v2/payments",

  // Generate Basic Auth header from username + password
  getAuthHeader() {
    const credentials = `${this.username}:${this.password}`;
    const encoded = Buffer.from(credentials).toString("base64");
    return `Basic ${encoded}`;
  },

  // Validate that all required credentials are set
  isConfigured() {
    return !!(this.username && this.password && this.channelId);
  },
};

module.exports = payheroConfig;