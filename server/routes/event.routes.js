const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

// All routes require authentication
router.use(requireAuth);

// List events (filtered by role)
router.get("/", eventController.getEvents);

// Get single event
router.get("/:id", eventController.getEventById);

// Create event (HR only)
router.post("/", requireRole("hr"), eventController.createEvent);

// Approve event (Vendor only)
router.patch(
  "/:id/approve",
  requireRole("vendor"),
  eventController.approveEvent,
);

// Reject event (Vendor only)
router.patch("/:id/reject", requireRole("vendor"), eventController.rejectEvent);

module.exports = router;
