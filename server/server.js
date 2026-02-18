const express = require("express");
const cors = require("cors");
const config = require("./config");
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Event types route (for dropdown)
const { requireAuth } = require("./middleware/auth");
const eventController = require("./controllers/event.controller");
app.get("/api/event-types", requireAuth, eventController.getEventTypes);

async function start() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

start();
