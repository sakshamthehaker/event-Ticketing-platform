const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const ApiError = require("../utils/apiError");
const { getPagination } = require("../utils/pagination");
const env = require("../config/env");

let razorpayInstance = null;
if (!env.mockRazorpay && env.razorpayKeyId && env.razorpayKeySecret) {
  razorpayInstance = new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret
  });
}

const createBooking = async ({ userId, eventId, seatsBooked }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        date: { $gt: new Date() },
        availableSeats: { $gte: seatsBooked }
      },
      {
        $inc: { availableSeats: -seatsBooked }
      },
      { new: true, session }
    );

    if (!updatedEvent) {
      throw new ApiError(400, "Booking closed, insufficient seats, or invalid event");
    }

    const booking = await Booking.create(
      [
        {
          user: userId,
          event: eventId,
          seatsBooked,
          paymentStatus: env.mockRazorpay ? "mock" : "pending",
          bookingStatus: env.mockRazorpay ? "confirmed" : "pending"
        }
      ],
      { session }
    );

    let razorpayOrder = null;
    if (!env.mockRazorpay && razorpayInstance) {
      const amountInPaise = updatedEvent.price * seatsBooked * 100;
      razorpayOrder = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: env.paymentCurrency,
        receipt: booking[0]._id.toString(),
        payment_capture: 1
      });

      booking[0].razorpayOrderId = razorpayOrder.id;
      await booking[0].save({ session });
    }

    await session.commitTransaction();
    
    return {
      booking: booking[0],
      razorpayOrder,
      razorpayKeyId: env.razorpayKeyId
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const cancelBooking = async ({ bookingId, userId, role }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (role !== "admin" && booking.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You can cancel only your own bookings");
    }

    if (booking.bookingStatus === "cancelled") {
      throw new ApiError(400, "Booking already cancelled");
    }

    booking.bookingStatus = "cancelled";
    await booking.save({ session });

    const eventDoc = await Event.findById(booking.event).session(session);
    if (!eventDoc) {
      throw new ApiError(404, "Event not found");
    }

    eventDoc.availableSeats = Math.min(
      eventDoc.totalSeats,
      eventDoc.availableSeats + booking.seatsBooked
    );
    await eventDoc.save({ session });

    await session.commitTransaction();
    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getMyBookings = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { user: userId };

  const items = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("event")
    .populate("user", "name email role");

  const total = await Booking.countDocuments(filter);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getAllBookings = async (query, adminId) => {
  const { page, limit, skip } = getPagination(query);
  const adminEventIds = await Event.find({ createdBy: adminId }).distinct("_id");
  const filter = { event: { $in: adminEventIds } };
  const items = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("event")
    .populate("user", "name email role");
  const total = await Booking.countDocuments(filter);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!env.razorpayKeySecret) {
    throw new ApiError(500, "Razorpay secret key not configured");
  }

  const generatedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const booking = await Booking.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      paymentStatus: "success",
      bookingStatus: "confirmed",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    },
    { new: true }
  );

  if (!booking) {
    throw new ApiError(404, "Booking not found for this order");
  }

  return booking;
};

module.exports = {
  createBooking,
  cancelBooking,
  getMyBookings,
  getAllBookings,
  verifyPayment
};
