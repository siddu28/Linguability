// Load environment variables first so SENTRY_DSN is available
require('dotenv').config()

// Import Sentry SDK
const Sentry = require("@sentry/node");

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // Send default PII data (e.g., automatic IP address collection)
    sendDefaultPii: true,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    environment: process.env.NODE_ENV || 'development',
});
