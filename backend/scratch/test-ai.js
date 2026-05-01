require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Default
  console.log("Testing with v1 API version...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
    const result = await model.generateContent("test");
    console.log("SUCCESS with v1");
  } catch (e) {
    console.log("v1 failed:", e.message);
  }
}
checkModels();
