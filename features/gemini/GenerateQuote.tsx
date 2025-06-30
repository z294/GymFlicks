// generate quote with Gemini AI
// features/gemini/GenerateQuote.tsx


import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 
if (!API_KEY) {
  console.error("API key error")
}

const genAI = new GoogleGenerativeAI(API_KEY || "fallback api"); 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateQuote(): Promise<string> {
  const prompt = "Generate a short, impactful, and motivating quote for someone at the gym. Focus on effort, progress, and strength. Make it inspiring and direct. Only provide the quote, no extra text.";
 
 
  // Will generate a motivational quote
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error("Error generating gym quote:", error);
    return "Keep pushing! The only bad workout is the one that didn't happen."; 
  }
}