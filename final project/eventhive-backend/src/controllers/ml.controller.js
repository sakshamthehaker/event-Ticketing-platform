const mlService = require("../services/ml.service");
const { success } = require("../utils/apiResponse");

/**
 * GET /api/v1/ml/event-clusters
 * Returns events grouped by K-Means clusters with auto-generated labels
 */
const getEventClusters = async (req, res) => {
  const result = await mlService.getEventClusters();
  return success(res, 200, "Event clusters computed", result);
};

/**
 * GET /api/v1/ml/user-segments
 * Returns user behavior segments (admin only)
 */
const getUserSegments = async (req, res) => {
  const result = await mlService.getUserSegments();
  return success(res, 200, "User segments computed", result);
};

/**
 * GET /api/v1/ml/anomalies
 * Returns detected anomalous bookings (admin only)
 */
const getAnomalies = async (req, res) => {
  const result = await mlService.detectAnomalies();
  return success(res, 200, "Anomaly detection completed", result);
};

module.exports = {
  getEventClusters,
  getUserSegments,
  getAnomalies
};
