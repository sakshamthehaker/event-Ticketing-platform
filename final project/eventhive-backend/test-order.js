const Razorpay = require("razorpay");
const env = require("./src/config/env");

console.log("Keys:", env.razorpayKeyId, env.razorpayKeySecret ? "Set" : "Not Set");
const razorpayInstance = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret
});

razorpayInstance.orders.create({
  amount: 100,
  currency: "INR",
  receipt: "receipt#1",
  payment_capture: 1
}).then(console.log).catch(console.error);
