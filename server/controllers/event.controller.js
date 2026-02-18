const Event = require("../models/Event");
const EventType = require("../models/EventType");

/**
 * GET /api/events
 * HR sees their own events, Vendor sees events assigned to them
 */
exports.getEvents = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "hr") {
      query.createdBy = req.user._id;
    } else if (req.user.role === "vendor") {
      query.vendor = req.user._id;
    }

    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip  = (page - 1) * limit;

    const [events, totalEvents] = await Promise.all([
      Event.find(query)
        .populate("eventType", "name description")
        .populate("vendor", "companyName username")
        .populate("createdBy", "companyName username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalEvents / limit);

    res.json({ data: events, currentPage: page, totalPages, totalEvents });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/events/:id
 * Get a single event with authorization check
 */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("eventType", "name description")
      .populate("vendor", "companyName username")
      .populate("createdBy", "companyName username");

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Users can only view their own events
    if (
      req.user.role === "hr" &&
      event.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (
      req.user.role === "vendor" &&
      event.vendor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json({ data: event });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/events
 * Create a new event (HR only)
 */
exports.createEvent = async (req, res) => {
  try {
    const { eventTypeId, proposedDates, location } = req.body;

    // Validate 3 dates
    if (!proposedDates || proposedDates.length !== 3) {
      return res
        .status(400)
        .json({ error: "Exactly 3 proposed dates are required" });
    }

    const uniqueDates = new Set(proposedDates.map(d => new Date(d).getTime()));
    if (uniqueDates.size !== 3) {
      return res.status(400).json({ error: "All 3 proposed dates must be different" });
    }

    // Validate event type exists and get the tagged vendor
    const eventType = await EventType.findById(eventTypeId).populate("vendor");
    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    // Validate location
    if (!location || !location.postalCode) {
      return res.status(400).json({ error: "Postal code is required" });
    }

    // Create the event
    const event = await Event.create({
      eventType: eventType._id,
      companyName: req.user.companyName, // auto-populated from HR account
      proposedDates: proposedDates.map((d) => new Date(d)),
      location: {
        postalCode: location.postalCode,
        streetName: location.streetName || "",
      },
      createdBy: req.user._id,
      vendor: eventType.vendor._id, // auto-assigned from event type
    });

    // Return populated event
    const populated = await Event.findById(event._id)
      .populate("eventType", "name description")
      .populate("vendor", "companyName username")
      .populate("createdBy", "companyName username");

    res.status(201).json({ data: populated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * PATCH /api/events/:id/approve
 * Vendor approves and selects one of the 3 dates
 */
exports.approveEvent = async (req, res) => {
  try {
    const { confirmedDate } = req.body;

    if (!confirmedDate) {
      return res.status(400).json({ error: "Confirmed date is required" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Ensure vendor owns this event
    if (event.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Ensure event is still pending
    if (event.status !== "pending") {
      return res
        .status(400)
        .json({ error: `Event is already ${event.status}` });
    }

    // Validate the confirmed date is one of the proposed dates
    const confirmedDateObj = new Date(confirmedDate);
    const isValidDate = event.proposedDates.some(
      (d) => d.getTime() === confirmedDateObj.getTime(),
    );

    if (!isValidDate) {
      return res.status(400).json({
        error: "Confirmed date must be one of the 3 proposed dates",
      });
    }

    // Update event
    event.status = "approved";
    event.confirmedDate = confirmedDateObj;
    await event.save();

    const populated = await Event.findById(event._id)
      .populate("eventType", "name description")
      .populate("vendor", "companyName username")
      .populate("createdBy", "companyName username");

    res.json({ data: populated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * PATCH /api/events/:id/reject
 * Vendor rejects with a reason
 */
exports.rejectEvent = async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks || remarks.trim() === "") {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (event.status !== "pending") {
      return res
        .status(400)
        .json({ error: `Event is already ${event.status}` });
    }

    event.status = "rejected";
    event.remarks = remarks.trim();
    await event.save();

    const populated = await Event.findById(event._id)
      .populate("eventType", "name description")
      .populate("vendor", "companyName username")
      .populate("createdBy", "companyName username");

    res.json({ data: populated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/event-types
 * List all event types (for dropdown)
 */
exports.getEventTypes = async (req, res) => {
  try {
    const eventTypes = await EventType.find()
      .populate("vendor", "companyName username")
      .sort({ name: 1 });

    res.json({ data: eventTypes });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
