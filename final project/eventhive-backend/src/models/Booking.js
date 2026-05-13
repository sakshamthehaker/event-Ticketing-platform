const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: 1
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "mock"],
      default: "pending"
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    razorpaySignature: {
      type: String
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

bookingSchema.index({ user: 1, event: 1, bookingStatus: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
