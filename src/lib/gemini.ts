import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


// ===============================
// 1️⃣ Normal Medical Chat
// ===============================
export async function getMedicalResponse(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are a medical AI assistant.
Provide helpful health information.
Always include a disclaimer that this is not medical advice.

User Query: ${prompt}
      `,
    });

    return response.text ?? "No response generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI service unavailable.";
  }
}


// ===============================
// 2️⃣ Symptom Analysis
// ===============================
export async function analyzeSymptoms(symptoms: string[]): Promise<{
  analysis: string;
  suggestedConditions: string[];
  severity: "low" | "medium" | "high";
}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are a medical AI assistant.

Analyze these symptoms:
${symptoms.join(", ")}

Respond STRICTLY in JSON format:

{
  "analysis": "brief explanation",
  "suggestedConditions": ["condition1", "condition2"],
  "severity": "low | medium | high"
}
      `,
    });

    const text = response.text ?? "";

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      analysis: parsed.analysis,
      suggestedConditions: parsed.suggestedConditions,
      severity: parsed.severity,
    };
  } catch (error) {
    console.error("Symptom Analysis Error:", error);

    return {
      analysis:
        "Unable to analyze symptoms at the moment. Please consult a doctor if symptoms persist.",
      suggestedConditions: [],
      severity: "medium",
    };
  }
}