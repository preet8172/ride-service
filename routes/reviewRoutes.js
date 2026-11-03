const express = require ("express")

const protect = require ("../middleware/auth");
const authorize = require ("../middleware/role");

const {
  createReview,
  getDriverReviews
} = require("../controllers/reviewController");

const router = express.Router();

router.post(
  "/ride/:rideId",
  protect,
  authorize("rider"),
  createReview
);

router.get(
  "/driver/:driverId",
  protect,
  getDriverReviews
);

module.exports = router;