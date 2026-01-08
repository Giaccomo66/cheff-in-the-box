
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const identifyIngredientsFromImage = async (base64Data: string, mimeType: string): Promise<string[]> => {
  const prompt = "Analizza questa immagine e identifica tutti gli ingredienti alimentari visibili. Restituisci solo una lista di nomi di ingredienti in italiano, senza descrizioni.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["ingredients"]
        }
      }
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    return parsed.ingredients || [];
  } catch (error) {
    console.error("Errore nel riconoscimento immagine:", error);
    throw error;
  }
};

export const getRecipesFromIngredients = async (ingredients: string[], servings: number): Promise<Recipe[]> => {
  const prompt = `Sei un esperto di alta cucina classica italiana. 
  Suggerisci 3 ricette della TRADIZIONE CLASSICA ITALIANA basandoti su questa lista di ingredienti: ${ingredients.join(", ")}. 

  REGOLE MANDATORIE:
  1. ADATTA LE QUANTITÀ: Le dosi degli ingredienti devono essere calcolate esattamente per ${servings} persone.
  2. Suggerisci esclusivamente piatti della tradizione classica italiana.
  3. NON è necessario che ogni ricetta utilizzi TUTTI gli ingredienti forniti. Usa solo quelli pertinenti alla ricetta classica.
  4. Se mancano ingredienti fondamentali per la versione classica, includili comunque nella lista specificando le dosi per ${servings} persone.
  5. Per ogni ricetta, fornisci un URL di immagine (imageUrl) specifico per il piatto.
  6. Rispondi esclusivamente in lingua italiana.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Il nome della ricetta classica italiana" },
                  description: { type: Type.STRING, description: "Descrizione del piatto" },
                  ingredients: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: `Lista ingredienti con dosi per ${servings} persone`
                  },
                  instructions: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Passaggi per la preparazione"
                  },
                  prepTime: { type: Type.STRING },
                  difficulty: { 
                    type: Type.STRING, 
                    enum: ["Facile", "Medio", "Difficile"]
                  },
                  calories: { type: Type.STRING },
                  imageUrl: { type: Type.STRING },
                  servings: { type: Type.INTEGER, description: "Numero di persone per cui è calcolata la ricetta" }
                },
                required: ["title", "description", "ingredients", "instructions", "prepTime", "difficulty", "imageUrl", "servings"]
              }
            }
          },
          required: ["recipes"]
        }
      }
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    return parsed.recipes || [];
  } catch (error) {
    console.error("Errore nella generazione delle ricette:", error);
    throw error;
  }
};
