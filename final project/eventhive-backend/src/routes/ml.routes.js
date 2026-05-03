const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const mlController = require("../controllers/ml.controller");

const router = express.Router();

// Public: anyone can see event clusters
router.get("/event-clusters", asyncHandler(mlController.getEventClusters));

// Admin only: user segmentation
router.get(
  "/user-segments",
  protect,
  allowRoles("admin"),
  asyncHandler(mlController.getUserSegments)
);

// Admin only: anomaly detection
router.get(
  "/anomalies",
  protect,
  allowRoles("admin"),
  asyncHandler(mlController.getAnomalies)
);

module.exports = router;
