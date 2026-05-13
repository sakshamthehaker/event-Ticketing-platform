require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

(async () => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Let's test different models to see which one works
    const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.5-flash-latest"];
    
    for (const modelName of modelsToTest) {
      console.log(`Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ Success with ${modelName}:`, result.response.text());
        return; // Exit on first success
      } catch (err) {
        console.log(`❌ Failed with ${modelName}:`, err.message || err);
      }
    }
  } catch (error) {
    console.error("Critical Error:", error);
  }
})();
