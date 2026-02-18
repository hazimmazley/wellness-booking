const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventType",
      required: [true, "Event type is required"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    proposedDates: {
      type: [Date],
      validate: {
        validator: function (dates) {
          return dates.length === 3;
        },
        message: "Exactly 3 proposed dates are required",
      },
      required: [true, "Proposed dates are required"],
    },
    location: {
      postalCode: {
        type: String,
        required: [true, "Postal code is required"],
        trim: true,
      },
      streetName: {
        type: String,
        trim: true,
        default: "",
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    confirmedDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator (HR) is required"],
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

module.exports = mongoose.model("Event", eventSchema);
