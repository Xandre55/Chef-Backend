const { GoogleGenAI, Type } = require("@google/genai");

require('dotenv').config();
const express = require("express");

const app = express(); // initialize app
app.use(express.json()); 

async function generateRecipesFromIngredients(ingredients) {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `You are a creative chef. Based on the following ingredients: ${ingredients.join(', ')}, generate 3 distinct and delicious recipe ideas. For each recipe, provide a name, a short description, a list of all required ingredients, and step-by-step instructions. Ensure the output is a valid JSON array matching the provided schema.`;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        recipeName: { type: Type.STRING },
        description: { type: Type.STRING },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["recipeName", "description", "ingredients", "instructions"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText =
      response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!jsonText) {
      throw new Error("AI returned an empty response.");
    }

    const recipes = JSON.parse(jsonText);
    return recipes;

  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Failed to generate recipes. Please check your ingredients and try again.");
  }
}

module.exports = { generateRecipesFromIngredients };




app.post("/recipes", async (req, res) => {
  try {
    const { ingredients, model } = req.body;
    const recipes = await generateRecipesWithRetry(ingredients, 3, model || "gemini-2.1-mini");
    res.json(recipes);
  } catch (err) {
    console.error("Error generating recipes:", err);
    res.status(500).json({ error: err.message });
  }
});

