require("dotenv").config();
const chatService = require("./src/services/chat.service");

(async () => {
  try {
    const result = await chatService.generateResponse("Hello, what is EventHive?", []);
    console.log("Chat Service Response:", result);
  } catch (err) {
    console.error("Chat Service Error:", err);
  }
})();
