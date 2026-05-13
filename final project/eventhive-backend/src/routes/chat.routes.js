const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const chatController = require("../controllers/chat.controller");

const router = express.Router();

router.post("/", asyncHandler(chatController.handleChat));

module.exports = router;
