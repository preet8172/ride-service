const User = require("../models/User");

exports.updateLocation = async (req, res) => {
  try {
    const {
      longitude,
      latitude
    } = req.body;

    if (
      longitude === undefined ||
      latitude === undefined
    ) {
      return res.status(400).json({
        message:
          "Longitude and latitude are required"
      });
    }

    const driver =
      await User.findByIdAndUpdate(
        req.user._id,
        {
          currentLocation: {
            type: "Point",
            coordinates: [
              Number(longitude),
              Number(latitude)
            ]
          },

          isAvailable: true
        },
        {
          new: true
        }
      ).select("-password");

    req.app
      .get("io")
      .emit("driverLocationUpdated", {
        driverId: driver._id,
        location: driver.currentLocation
      });

    res.json({
      message: "Location updated",
      driver
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.findNearbyDrivers = async (
  req,
  res
) => {
  try {
    const {
      longitude,
      latitude,
      distance = 5000
    } = req.query;

    const drivers = await User.find({
      role: "driver",

      isAvailable: true,

      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",

            coordinates: [
              Number(longitude),
              Number(latitude)
            ]
          },

          $maxDistance: Number(distance)
        }
      }
    }).select(
      "name rating currentLocation"
    );

    res.json({
      count: drivers.length,
      drivers
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};