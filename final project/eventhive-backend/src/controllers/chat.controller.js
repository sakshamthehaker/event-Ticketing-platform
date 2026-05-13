const chatService = require("../services/chat.service");
const { success } = require("../utils/apiResponse");

const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const reply = await chatService.generateResponse(message, history || []);
    
    return success(res, 200, "Chat response generated", { reply });
  } catch (err) {
    console.error("Chat Controller Error:", err);
    return res.status(500).json({ success: false, message: "Failed to generate chat response" });
  }
};

module.exports = {
  handleChat
};
