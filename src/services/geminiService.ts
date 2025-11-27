// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_KEY!);

export async function getGeminiSummary(data: {
  weeklyDemand: number;
  topItems: string[];
  lowItems: string[];
}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an assistant generating demand forecast for a small grocery shop.

Weekly demand estimated: ${data.weeklyDemand} units.

Top fast-moving items: ${data.topItems.join(", ")}
Slow-moving items: ${data.lowItems.join(", ")}

Write a simple message (max 6 lines) easily understood by any shopkeeper.
Avoid technical terms.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.log("Gemini error:", err);
    return "Unable to generate forecast summary.";
  }
}
