require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes =
  require("./routes/authRoutes");

const rideRoutes =
  require("./routes/rideRoutes");

const driverRoutes =
  require("./routes/driverRoutes");

const reviewRoutes =
  require("./routes/reviewRoutes");

const analyticsRoutes =
  require("./routes/analyticsRoutes");

const exportRoutes =
  require("./routes/exportRoutes");

const app = express();

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

app.set("io", io);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Ride Sharing API is running"
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/rides",
  rideRoutes
);

app.use(
  "/api/drivers",
  driverRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/export",
  exportRoutes
);

// Socket.IO
io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  socket.on(
    "joinUser",
    (userId) => {
      socket.join(
        `user:${userId}`
      );
    }
  );

  socket.on(
    "driverLocation",
    (data) => {
      io.emit(
        "driverLocationChanged",
        data
      );
    }
  );

  socket.on(
    "disconnect",
    () => {
      console.log(
        "Socket disconnected:",
        socket.id
      );
    }
  );
});

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(
      PORT,
      () => {
        console.log(
          `Server running on http://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup error:",
      error.message
    );
  }
};

startServer();