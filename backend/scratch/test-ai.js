require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY is missing from .env');
    return;
  }

  console.log('--- AI Diagnostic Started ---');
  console.log(`Using Key: ${apiKey.slice(0, 5)}...${apiKey.slice(-5)}`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-1.5-flash", "gemini-pro"];

  for (const modelName of models) {
    try {
      console.log(`\nAttempting ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'System Online'");
      const response = await result.response;
      console.log(`✅ Success with ${modelName}: ${response.text()}`);
      return; // Exit if any succeeds
    } catch (err) {
      console.error(`❌ ${modelName} failed: ${err.message}`);
    }
  }
  
  console.log('\n--- Diagnostic Complete: All nodes failed ---');
}

testAI();
