const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const generateResponse = async (message, history = []) => {
  if (!genAI) {
    return "The AI assistant is currently sleeping. Please add your `GEMINI_API_KEY` to the backend `.env` file to wake me up!";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Map history to Gemini format. Keep only valid roles ('user', 'model')
    let formattedHistory = history.map(msg => ({
      role: msg.role === 'bot' ? 'model' : msg.role,
      parts: [{ text: msg.text }]
    })).filter(msg => msg.parts[0].text); // Remove empty text
    
    // Gemini requires the first message in history to be from a 'user'
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }
    
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const promptContext = `[SYSTEM NOTE: You are the EventHive AI Assistant. EventHive is a platform for college events. You help users find events, book tickets, or create events. Keep your tone friendly, helpful, GenZ-oriented, and concise. Always guide them on what to do next.]\n\n${message}`;

    const result = await chat.sendMessage([{ text: promptContext }]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I am having trouble connecting to my brain right now. Please try again later.";
  }
};

module.exports = {
  generateResponse
};
