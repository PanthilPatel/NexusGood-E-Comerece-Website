const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

exports.getAIStylistResponse = async (userMessage, history = []) => {
  const modelsToTry = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError = null;

  // 1. Fetch Real Product Context for the AI
  let productKnowledge = "";
  try {
    const products = await Product.find().sort({ numReviews: -1 }).limit(15).lean();
    productKnowledge = products.map(p => `- ${p.name}: ₹${p.price} (Category: ${p.category?.name || 'Collection'})`).join('\n');
  } catch (err) {
    console.error('[AI] Context Fetch Error:', err.message);
  }

  const systemPrompt = `You are the NexusGood Personal AI Stylist. Your mission is to help customers discover the most sophisticated products in our collection.
  Your tone is elegant, helpful, and premium. You should sound like a personal shopper at a luxury boutique.
  
  CURRENCY: Always use Indian Rupees (₹).
  
  CURRENT INVENTORY:
  ${productKnowledge}
  
  GUIDELINES:
  - Be conversational. Don't use robotic terms like 'registry', 'artifacts', or 'synchronized'.
  - Use words like 'elegant', 'minimalist', 'collection', 'perfect for you', and 'sophisticated'.
  - If a user asks for a product, tell them the price (₹) and why it's a great choice.
  - If they ask for something you don't have, recommend the closest match from the inventory above.
  - Keep responses warm and concise.`;

  if (genAI) {
    try {
      const contents = [
        { role: 'user', parts: [{ text: `SYSTEM: ${systemPrompt}` }] },
        { role: 'model', parts: [{ text: "Hello. I'm your NexusGood stylist. I've just reviewed our latest collection—how can I help you elevate your style today?" }] }
      ];

      history.forEach(h => {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      });

      contents.push({ role: 'user', parts: [{ text: userMessage }] });

      for (const modelName of modelsToTry) {
        try {
          console.log(`[AI] Attempting connection with model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          
          const result = await model.generateContent({
            contents: contents,
            generationConfig: { 
              maxOutputTokens: 800,
              temperature: 0.8,
            }
          });

          const response = await result.response;
          const text = response.text();
          
          if (text) {
            console.log(`[AI] Success with ${modelName}`);
            return { message: text };
          }
        } catch (error) {
          console.error(`[AI] ${modelName} failed: ${error.message}`);
          lastError = error;
        }
      }
    } catch (err) {
      console.error('[AI] Neural Handshake Error:', err.message);
    }
  }

  // --- REFINED LOCAL INTELLIGENCE FALLBACK ---
  console.log('[AI] Initializing Progressive Contextual Engine...');
  
  const input = userMessage.toLowerCase();
  let responseText = "";

  // A. Extract last mentioned product from history for context
  let lastProduct = null;
  const historyText = history.map(h => h.text).join(' ').toLowerCase();
  const lastBotMessage = history.length > 0 ? history[history.length-1].text.toLowerCase() : "";

  try {
    const products = await Product.find().select('name price').lean();
    lastProduct = products.find(p => historyText.includes(p.name.toLowerCase()));
  } catch (err) {}

  // B. Expanded Intent Recognition
  const isPurchaseIntent = input.includes('buy') || input.includes('add') || input.includes('order') || input.includes('get');
  const isAffirmative = ['yes', 'ok', 'sure', 'yeah', 'alright', 'cool', 'fine', 'perfect'].some(word => input.includes(word));
  const isAlreadyDiscussed = lastProduct && lastBotMessage.includes(lastProduct.name.toLowerCase()) && lastBotMessage.includes(lastProduct.price.toLocaleString());

  // C. Progressive Logic Flow
  try {
    // 1. Handle follow-up about a previous product
    if (lastProduct && (isPurchaseIntent || isAffirmative)) {
      if (isPurchaseIntent) {
        responseText = `That's a great choice. You can add the ${lastProduct.name} to your bag right now on its product page. Should we look for some matching accessories to complete the look?`;
      } else if (isAlreadyDiscussed) {
        // User said 'yes' or 'ok' to a message that already gave details
        responseText = `Excellent. I've noted your interest in the ${lastProduct.name}. Would you like to explore more items from this collection, or shall we finalize your selection?`;
      } else {
        responseText = `The ${lastProduct.name} (₹${lastProduct.price.toLocaleString()}) is a piece I highly recommend. It represents our core values of minimalism and quality. Does this sound like what you were looking for?`;
      }
    } 
    // 2. Search for new products
    else {
      const keywords = input.split(' ').filter(w => w.length > 3);
      if (keywords.length > 0) {
        const searchTerms = keywords.map(kw => ({ name: { $regex: kw, $options: 'i' } }));
        const matches = await Product.find({ $or: searchTerms }).limit(1).lean();
        
        if (matches.length > 0) {
          const product = matches[0];
          responseText = `I've found the ${product.name} in our collection for ₹${product.price.toLocaleString()}. It's a fantastic choice if you're looking for something minimalist and high-quality. Would you like to see more details?`;
        }
      }
    }
  } catch (err) {
    console.error('[AI] Registry Sync Error:', err.message);
  }

  // 3. General Conversation
  if (!responseText) {
    if (input.includes('hi') || input.includes('hello')) {
      responseText = "Hello! It's a pleasure to assist you. I've been looking through our latest arrivals—are you looking for something elegant for a special occasion, or perhaps some sophisticated daily essentials?";
    } else if (input.includes('latest') || input.includes('new')) {
       responseText = "We've recently added some stunning new pieces to our collection. Our minimalist watches and premium tech accessories are trending right now. Which category interests you most?";
    } else if (input.includes('thank')) {
       responseText = "You're very welcome. It's my pleasure to help you curate your perfect collection. I'll be here if you need anything else!";
    } else {
      responseText = "I'm here to help you curate the perfect selection. Based on our current collection, I'd recommend exploring our Signature Series for a truly timeless look. Is there a specific style or occasion you're shopping for today?";
    }
  }

  return { message: responseText, isLocal: true };
};
