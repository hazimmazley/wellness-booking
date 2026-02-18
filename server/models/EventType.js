const mongoose = require("mongoose");

const eventTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event type name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor is required"],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("EventType", eventTypeSchema);
