const Review = require("../models/Review");
const Ride = require("../models/Ride");
const User = require("../models/User");

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const ride = await Ride.findOne({
      _id: req.params.rideId,
      rider: req.user._id,
      status: "completed"
    });

    if (!ride) {
      return res.status(404).json({
        message:
          "Completed ride not found"
      });
    }

    if (!ride.driver) {
      return res.status(400).json({
        message:
          "This ride has no driver"
      });
    }

    const existingReview =
      await Review.findOne({
        ride: ride._id
      });

    if (existingReview) {
      return res.status(400).json({
        message:
          "You already reviewed this ride"
      });
    }

    const review = await Review.create({
      ride: ride._id,
      rider: req.user._id,
      driver: ride.driver,
      rating,
      comment
    });

    const stats = await Review.aggregate([
      {
        $match: {
          driver: ride.driver
        }
      },

      {
        $group: {
          _id: "$driver",
          averageRating: {
            $avg: "$rating"
          },
          totalRatings: {
            $sum: 1
          }
        }
      }
    ]);

    if (stats.length) {
      await User.findByIdAndUpdate(
        ride.driver,
        {
          rating:
            stats[0].averageRating,

          totalRatings:
            stats[0].totalRatings
        }
      );
    }

    res.status(201).json({
      message:
        "Driver reviewed successfully",
      review
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getDriverReviews = async (
  req,
  res
) => {
  try {
    const reviews = await Review.find({
      driver: req.params.driverId
    })
      .populate("rider", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};