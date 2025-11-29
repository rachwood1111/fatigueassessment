
import { GoogleGenAI } from "@google/genai";
// UPDATED: Import now points to the same folder
import { AssessmentResult } from "./types";

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
      You are a Health and Safety Fatigue Management Expert for a Traffic Management company based in Perth, Western Australia.
      Analyze the following worker assessment data and provide a concise, empathetic, but firm paragraph of advice.
      
      Context:
      - Location: Perth, WA (Hot climate, intense sun glare, standard traffic conditions).
      - Current Time / Shift Time: ${result.selectedTime} (24h format).
      - Role: Traffic Management Personnel (Safety Critical).
      - Risk Level Calculated: ${result.riskLevel}
      - Questionnaire Score (Max 15): ${result.questionScore}
      - Average Reaction Time: ${result.reactionTimeMs.toFixed(0)}ms (Normal < 350ms)
      - Memory Score: Level ${result.memoryLevel} (Normal > 5)
      - Vigilance/Attention Score (Go/No-Go): ${result.vigilanceScore}% (Normal > 85%)

      Instructions:
      1. **Time-Specific Advice**:
         - If Morning (05:00-10:00): Mention sun glare, school zones, and morning traffic.
         - If Midday (11:00-14:00): Mention heat stress, UV protection, hydration, and the "post-lunch dip" in alertness.
         - If Afternoon (15:00-18:00): Mention rush hour aggression and accumulation of shift fatigue ("homeitis").
         - If Night (19:00-04:00): Mention circadian lows (especially 02:00-04:00), visibility issues, and caffeine cutoff times.
      
      2. **Risk Actions**:
         - If Risk is HIGH or CRITICAL: Be very firm. Tell them to stop work immediately, contact Operations, and DO NOT drive.
         - If Risk is MODERATE: Suggest specific interventions (e.g., "Take a 15 min break," "Drink cool water," "Rotate task").
         - If Risk is LOW: Encourage maintaining specific good habits relevant to the current time of day.

      Keep it under 100 words. Do not use markdown formatting like bold or headers.
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
