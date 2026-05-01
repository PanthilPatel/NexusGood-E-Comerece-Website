const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

exports.getAIStylistResponse = async (userMessage) => {
  if (!genAI) {
    return { message: "I'm currently in offline mode. Please add a GEMINI_API_KEY.", isMock: true };
  }

  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI] Attempting connection with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 500 }
      });

      const response = await result.response;
      console.log(`[AI] Success with ${modelName}`);
      return { message: response.text() };
    } catch (error) {
      console.error(`[AI] ${modelName} failed: ${error.message}`);
      lastError = error;
      // Continue to next model
    }
  }

  console.error('--- All AI Models Failed ---');
  throw lastError;
};
