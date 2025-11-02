// backend/utils/keepAlive.js

import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || "https://stackmentor-backend-corq.onrender.com";

// Ping the server every 5 minutes to keep it awake
const keepAlive = () => {
  const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

  setInterval(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`);
      console.log(`✅ Keep-Alive Ping: ${new Date().toISOString()} - Status: ${response.status}`);
    } catch (error) {
      console.error(`❌ Keep-Alive Ping Failed: ${error.message}`);
    }
  }, PING_INTERVAL);

  console.log(`🔥 Keep-Alive service started. Pinging every 5 minutes...`);
};

export default keepAlive;