// const { GoogleGenAI, Type } = require("@google/genai");

// require('dotenv').config();
// const express = require("express");

// const app = express(); // initialize app
// app.use(express.json()); 

// async function generateRecipesFromIngredients(ingredients) {
//   if (!process.env.API_KEY) {
//     throw new Error("API_KEY environment variable is not set.");
//   }

//   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

//   const prompt = `You are a creative chef. Based on the following ingredients: ${ingredients.join(', ')}, generate 3 distinct and delicious recipe ideas. For each recipe, provide a name, a short description, a list of all required ingredients, and step-by-step instructions. Ensure the output is a valid JSON array matching the provided schema.`;

//   const responseSchema = {
//     type: Type.ARRAY,
//     items: {
//       type: Type.OBJECT,
//       properties: {
//         recipeName: { type: Type.STRING },
//         description: { type: Type.STRING },
//         ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
//         instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
//       },
//       required: ["recipeName", "description", "ingredients", "instructions"],
//     },
//   };

//   try {
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: prompt }],
//         },
//       ],
//       generationConfig: {
//         responseMimeType: "application/json",
//         responseSchema,
//         temperature: 0.7,
//       },
//     });

//     const jsonText =
//       response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

//     if (!jsonText) {
//       throw new Error("AI returned an empty response.");
//     }

//     const recipes = JSON.parse(jsonText);
//     return recipes;

//   } catch (error) {
//     console.error("Error generating recipes:", error);
//     throw new Error("Failed to generate recipes. Please check your ingredients and try again.");
//   }
// }

// module.exports = { generateRecipesFromIngredients };




// app.post("/recipes", async (req, res) => {
//   try {
//     const { ingredients, model } = req.body;
//     const recipes = await generateRecipesWithRetry(ingredients, 3, model || "gemini-2.1-mini");
//     res.json(recipes);
//   } catch (err) {
//     console.error("Error generating recipes:", err);
//     res.status(500).json({ error: err.message });
//   }
// });


// import OpenAI from "openai";
// import dotenv from "dotenv";

// dotenv.config();

// const openai = new OpenAI({
//     apiKey:process.env.API_KEY,
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
// });

// async function generateRecipe() {
// const response = await openai.chat.completions.create({
//     model: "gemini-2.0-flash",
//     messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         {
//             role: "user",
//             content: "i want you to generate a recipe with the following ingredients: eggs, tomatoes, onions, garlic, spinach, cheese, salt, pepper, olive oil. The recipe should include a name, description, list of ingredients, and step-by-step instructions.",
//         },
//     ],
// });

// console.log(response.choices[0].message);
// }

// generateRecipe();

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*", 
  methods: ["GET", "POST"],
allowedHeaders: [ "Content-Type"],
}

));
app.use(express.json());

// Initialize Gemini API client
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// Function to generate recipes
async function generateRecipes(ingredients, model = "gemini-2.0-flash") {
  const prompt = `
You are a creative chef. Based on the following ingredients: ${ingredients.join(
    ", "
  )}, a delicious recipes from the list of ingredients provided.
For each recipe, provide:
- name
- short description
- list of ingredients
- step-by-step instructions
Respond in markdown for easy display on a website.
don't include any additional text.
 
`;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ]
  });

  const recipeText = response.choices[0].message.content.trim();
  return recipeText;// parse AI response to JSON
}

// POST endpoint for front-end
app.post("/recipes", async (req, res) => {
  try {
    const { ingredients, model } = req.body;
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: "Ingredients must be an array" });
    }

    const recipes = await generateRecipes(ingredients, model);
    res.send(recipes);
  } catch (err) {
    console.error("Error generating recipes:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
generateRecipes(["egg", "meat", 'onion', "garlic", "tomato"]).then(console.log).catch(console.error);


