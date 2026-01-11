
import { GoogleGenAI, Type } from "@google/genai";
import { MatchAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    matchName: { type: Type.STRING },
    prediction: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    homeWinProb: { type: Type.NUMBER },
    drawProb: { type: Type.NUMBER },
    awayWinProb: { type: Type.NUMBER },
    keyStats: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedBets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          market: { type: Type.STRING },
          odd: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        },
        required: ["market", "odd", "reasoning"]
      }
    }
  },
  required: ["matchName", "prediction", "confidence", "homeWinProb", "drawProb", "awayWinProb", "keyStats", "suggestedBets"]
};

export const getFootballAnalysis = async (query: string): Promise<{ text: string, analysis?: MatchAnalysis, links?: any[] }> => {
  const isAnalysisRequest = query.toLowerCase().includes('analyze') || query.toLowerCase().includes('prediction');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction: `You are BetMind AI, a world-class football (soccer) expert and betting analyst with access to global real-time data.
        Your goal is to provide accurate, up-to-date answers for any football-related question worldwide, including leagues in Europe, South America, Asia, Africa, and beyond.
        
        Guidelines:
        1. If the user asks for an analysis or prediction, you MUST return a structured JSON response following the provided schema.
        2. If the user asks a general question (e.g., 'Who won the Brazilian league?', 'Top scorers in Saudi Pro League'), provide a natural language response using Google Search grounding.
        3. Always maintain a professional, data-driven tone. 
        4. If data is unavailable for a very obscure league, state that clearly but try to find the closest official statistics.`,
        tools: [{ googleSearch: {} }],
        ...(isAnalysisRequest ? {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA
        } : {})
      }
    });

    const text = response.text || "I couldn't process that request.";
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter(Boolean) || [];

    if (isAnalysisRequest) {
        try {
            // Remove any potential markdown code blocks from the string before parsing
            const cleanJson = text.replace(/```json|```/g, '').trim();
            const analysis = JSON.parse(cleanJson) as MatchAnalysis;
            return { text: `Analysis complete for ${analysis.matchName}`, analysis, links };
        } catch (e) {
            return { text, links };
        }
    }

    return { text, links };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
