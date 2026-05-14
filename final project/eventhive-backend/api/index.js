const app = require("../src/app");
const connectDB = require("../src/config/db");

// Establish database connection
// In serverless, variables in the global scope can persist between invocations
connectDB();

module.exports = app;
