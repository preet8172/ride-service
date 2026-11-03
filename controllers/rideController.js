const Ride = require("../models/Ride");
const User = require("../models/User");

const {
  getRouteDetails
} = require("../services/mapboxService");

const {
  calculateFare,
  getSurgeMultiplier
} = require("../services/fareService");

exports.estimateFare = async (req, res) => {
  try {
    const {
      pickupCoordinates,
      destinationCoordinates
    } = req.body;

    if (
      !pickupCoordinates ||
      !destinationCoordinates
    ) {
      return res.status(400).json({
        message: "Pickup and destination are required"
      });
    }

    const route = await getRouteDetails(
      pickupCoordinates,
      destinationCoordinates
    );

    const surgeMultiplier =
      getSurgeMultiplier();

    const fare = calculateFare(
      route.distanceKm,
      route.durationMinutes,
      surgeMultiplier
    );

    res.json({
      distanceKm:
        Number(route.distanceKm.toFixed(2)),

      durationMinutes:
        Number(route.durationMinutes.toFixed(2)),

      surgeMultiplier,

      estimatedFare: fare
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.createRide = async (req, res) => {
  try {
    const {
      pickup,
      destination
    } = req.body;

    if (
      !pickup?.coordinates ||
      !destination?.coordinates
    ) {
      return res.status(400).json({
        message:
          "Pickup and destination coordinates required"
      });
    }

    const route = await getRouteDetails(
      pickup.coordinates,
      destination.coordinates
    );

    const surgeMultiplier =
      getSurgeMultiplier();

    const fare = calculateFare(
      route.distanceKm,
      route.durationMinutes,
      surgeMultiplier
    );

    const ride = await Ride.create({
      rider: req.user._id,

      pickup,

      destination,

      distance: route.distanceKm,

      duration: route.durationMinutes,

      estimatedFare: fare,

      surgeMultiplier
    });

    const io = req.app.get("io");

    io.emit("newRideRequest", {
      rideId: ride._id,
      pickup: ride.pickup,
      destination: ride.destination,
      fare: ride.estimatedFare
    });

    res.status(201).json({
      message: "Ride requested successfully",
      ride
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getMyRides = async (req, res) => {
  try {
    const filter =
      req.user.role === "driver"
        ? { driver: req.user._id }
        : { rider: req.user._id };

    const rides = await Ride.find(filter)
      .populate("rider", "name email rating")
      .populate("driver", "name email rating")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getAvailableRides = async (req, res) => {
  try {
    const {
      maxDistance,
      minRiderRating
    } = req.query;

    let rides = await Ride.find({
      status: "requested"
    })
      .populate("rider", "name rating")
      .sort({ createdAt: -1 });

    if (minRiderRating) {
      rides = rides.filter(
        (ride) =>
          ride.rider &&
          ride.rider.rating >= Number(minRiderRating)
      );
    }

    if (maxDistance) {
      rides = rides.filter(
        (ride) =>
          ride.distance <= Number(maxDistance)
      );
    }

    res.json(rides);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "requested"
      },
      {
        driver: req.user._id,
        status: "accepted",
        acceptedAt: new Date()
      },
      {
        new: true
      }
    );

    if (!ride) {
      return res.status(400).json({
        message:
          "Ride unavailable or already accepted"
      });
    }

    const io = req.app.get("io");

    io.to(`user:${ride.rider}`).emit(
      "rideAccepted",
      {
        rideId: ride._id,
        driver: req.user
      }
    );

    res.json({
      message: "Ride accepted",
      ride
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "arriving",
      "started",
      "completed"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const ride = await Ride.findOne({
      _id: req.params.id,
      driver: req.user._id
    });

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      });
    }

    ride.status = status;

    if (status === "started") {
      ride.startedAt = new Date();
    }

    if (status === "completed") {
      ride.completedAt = new Date();
      ride.finalFare = ride.estimatedFare;

      await User.findByIdAndUpdate(
        req.user._id,
        {
          isAvailable: true
        }
      );
    }

    await ride.save();

    req.app
      .get("io")
      .to(`user:${ride.rider}`)
      .emit("rideStatusChanged", {
        rideId: ride._id,
        status
      });

    res.json({
      message: "Ride status updated",
      ride
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      _id: req.params.id,
      rider: req.user._id
    });

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      });
    }

    if (
      ["completed", "cancelled"].includes(
        ride.status
      )
    ) {
      return res.status(400).json({
        message: "Ride cannot be cancelled"
      });
    }

    ride.status = "cancelled";

    await ride.save();

    req.app
      .get("io")
      .emit("rideCancelled", {
        rideId: ride._id
      });

    res.json({
      message: "Ride cancelled",
      ride
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};