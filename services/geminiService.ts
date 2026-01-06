
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateRecipe = async (prompt: string): Promise<Recipe> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a high-quality culinary recipe based on this description: ${prompt}. Return the data in valid JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prepTime: { type: Type.STRING },
          cookTime: { type: Type.STRING },
          servings: { type: Type.NUMBER },
          difficulty: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                amount: { type: Type.STRING },
                unit: { type: Type.STRING },
              },
              required: ["item", "amount"],
            }
          },
          instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER },
            },
            required: ["calories", "protein", "carbs", "fats", "fiber"]
          }
        },
        required: ["id", "title", "description", "ingredients", "instructions", "nutrition"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse recipe JSON", e);
    throw new Error("Invalid recipe format received from AI.");
  }
};

export const generateFoodImage = async (dishName: string): Promise<string | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Professional high-end food photography of a ${dishName}. Soft natural lighting, shallow depth of field, artfully plated on a stone surface, minimalist background.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
