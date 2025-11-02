// backend/utils/selfPing.js

import https from "https";

const BACKEND_URL = process.env.BACKEND_URL || "https://stackmentor-backend-corq.onrender.com";

class SelfPingService {
  constructor(url, intervalMinutes = 5) {
    this.url = url;
    this.interval = intervalMinutes * 60 * 1000;
    this.timer = null;
  }

  start() {
    // Ping immediately on start
    this.ping();

    // Then ping at regular intervals
    this.timer = setInterval(() => {
      this.ping();
    }, this.interval);

    console.log(`🔥 Self-Ping Service Started`);
    console.log(`⏰ Pinging ${this.url} every ${this.interval / 60000} minutes`);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      console.log("Self-Ping Service Stopped");
    }
  }

  ping() {
    const now = new Date().toISOString();
    
    https.get(`${this.url}/health`, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ [${now}] Keep-Alive Ping Successful`);
      } else {
        console.log(`⚠️ [${now}] Keep-Alive Ping - Status: ${res.statusCode}`);
      }
    }).on('error', (error) => {
      console.error(`❌ [${now}] Keep-Alive Ping Failed: ${error.message}`);
    });
  }
}

// Create and export singleton instance
const selfPing = new SelfPingService(BACKEND_URL, 5);

export default selfPing;