const express = require("express");

const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
  estimateFare,
  createRide,
  getMyRides,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  cancelRide
} = require("../controllers/rideController");

const router = express.Router();

router.use(protect);

router.post(
  "/estimate-fare",
  authorize("rider"),
  estimateFare
);

router.post(
  "/",
  authorize("rider"),
  createRide
);

router.get(
  "/my-rides",
  getMyRides
);

router.get(
  "/available",
  authorize("driver"),
  getAvailableRides
);

router.patch(
  "/:id/accept",
  authorize("driver"),
  acceptRide
);

router.patch(
  "/:id/status",
  authorize("driver"),
  updateRideStatus
);

router.patch(
  "/:id/cancel",
  authorize("rider"),
  cancelRide
);

module.exports = router;