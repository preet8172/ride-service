const Ride = require("../models/Ride");
const {
  createObjectCsvStringifier
} = require("csv-writer");

exports.exportCSV = async (req, res) => {
  try {
    const filter =
      req.user.role === "driver"
        ? { driver: req.user._id }
        : { rider: req.user._id };

    const rides = await Ride.find(filter)
      .populate("rider", "name")
      .populate("driver", "name");

    const csvStringifier =
      createObjectCsvStringifier({
        header: [
          {
            id: "id",
            title: "Ride ID"
          },
          {
            id: "rider",
            title: "Rider"
          },
          {
            id: "driver",
            title: "Driver"
          },
          {
            id: "pickup",
            title: "Pickup"
          },
          {
            id: "destination",
            title: "Destination"
          },
          {
            id: "distance",
            title: "Distance KM"
          },
          {
            id: "fare",
            title: "Fare"
          },
          {
            id: "status",
            title: "Status"
          },
          {
            id: "date",
            title: "Date"
          }
        ]
      });

    const records = rides.map(
      (ride) => ({
        id: ride._id.toString(),

        rider:
          ride.rider?.name || "",

        driver:
          ride.driver?.name ||
          "Not assigned",

        pickup:
          ride.pickup.address || "",

        destination:
          ride.destination.address || "",

        distance:
          ride.distance,

        fare:
          ride.finalFare ||
          ride.estimatedFare,

        status:
          ride.status,

        date:
          ride.createdAt.toISOString()
      })
    );

    const csv =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(
        records
      );

    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="ride-history.csv"'
    );

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};