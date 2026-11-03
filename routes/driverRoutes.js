const express = require("express");

const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
  updateLocation,
  findNearbyDrivers
} = require("../controllers/driverController");

const router = express.Router();

router.use(protect);

router.patch(
  "/location",
  authorize("driver"),
  updateLocation
);

router.get(
  "/nearby",
  authorize("rider"),
  findNearbyDrivers
);

module.exports = router;