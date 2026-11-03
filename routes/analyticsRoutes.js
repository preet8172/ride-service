const express = require("express");

const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
  rideAnalytics,
  driverPerformance
} = require("../controllers/analyticsController");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get(
  "/rides",
  rideAnalytics
);

router.get(
  "/drivers",
  driverPerformance
);

module.exports = router;