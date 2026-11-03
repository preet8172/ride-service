const Ride = require("../models/Ride");

exports.rideAnalytics = async (req, res) => {
  try {
    const data = await Ride.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt"
            },

            month: {
              $month: "$createdAt"
            }
          },

          totalRides: {
            $sum: 1
          },

          completedRides: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "completed"
                  ]
                },
                1,
                0
              ]
            }
          },

          totalRevenue: {
            $sum: "$finalFare"
          }
        }
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.driverPerformance = async (
  req,
  res
) => {
  try {
    const data = await Ride.aggregate([
      {
        $match: {
          status: "completed",
          driver: {
            $ne: null
          }
        }
      },

      {
        $group: {
          _id: "$driver",

          totalRides: {
            $sum: 1
          },

          earnings: {
            $sum: "$finalFare"
          },

          averageFare: {
            $avg: "$finalFare"
          }
        }
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "driver"
        }
      },

      {
        $unwind: "$driver"
      },

      {
        $project: {
          driverName: "$driver.name",
          rating: "$driver.rating",
          totalRides: 1,
          earnings: 1,
          averageFare: 1
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};