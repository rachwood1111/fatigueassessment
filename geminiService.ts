import { GoogleGenAI } from "@google/genai";
import { AssessmentResult } from "../types";

// Safe access helper for environment variables
const getApiKey = () => {
  try {
    // @ts-ignore
    return typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
  } catch (e) {
    return undefined;
  }
};

export const getFatigueAdvice = async (result: AssessmentResult): Promise<string> => {
  const apiKey = getApiKey();

  // fallback if no key is present
  if (!apiKey) {
    console.warn("API Key not found in environment variables. Using default fallback advice.");
    return "Standard Protocol: If you feel fatigued, notify your supervisor immediately. Do not operate heavy machinery or drive if you are tired.";
  }

  try {
    // Initialize here to avoid top-level crash if key is missing
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const model = "gemini-2.5-flash";
    const prompt = `
      You are a Health and Safety Fatigue Management Expert for a Traffic Management company.
      Analyze the following worker assessment data and provide a concise, empathetic, but firm paragraph of advice.
      
      Context:
      - Role: Traffic Management Personnel (Safety Critical, Roadside)
      - Environment: Outdoor, high risk, limited facilities (no break rooms, reliant on work vehicles/shelter).
      - Regulatory Basis: Safe Work Australia Code of Practice: Managing the risk of fatigue at work (Sept 2025).
      
      Assessment Data:
      - Risk Level Calculated: ${result.riskLevel}
      - Questionnaire Score (Max 15): ${result.questionScore}
      - Average Reaction Time: ${result.reactionTimeMs.toFixed(0)}ms (Normal < 350ms)
      - Memory Score: Level ${result.memoryLevel} (Normal > 5)
      - Attention/Stroop Accuracy: ${result.stroopAccuracy}% (Normal > 80%)

      Instructions:
      - If Risk is HIGH or CRITICAL: Be very firm. Tell them to stop work immediately, contact Operations, and DO NOT drive.
      - If Risk is MODERATE: Suggest "Control Measures" suitable for roadside work (e.g., Task rotation between bat/radio, Strategic caffeine, cooling down in truck AC, hydration).
      - If Risk is LOW: Encourage "Maintenance" (hydration, posture checks, eye rest).
      - Keep it under 100 words.
      - Do not use markdown formatting like bold or headers, just plain text.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Unable to generate specific advice. Follow standard operating procedures.";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Standard Protocol: If you feel fatigued, notify your supervisor immediately. Do not operate heavy machinery or drive if you are tired.";
  }
};
