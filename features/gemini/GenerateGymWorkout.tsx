// generate Gym workout plan with Gemini AI
// features/gemini/GenerateGymWorkout.tsx

import { GoogleGenerativeAI } from "@google/generative-ai";


const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 

if (!API_KEY) {
  console.error("API key error")
}

const genAI = new GoogleGenerativeAI(API_KEY || "fallback api"); 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


export async function GenerateGymWorkout(
  preferences: {
    level?: 'low' | 'medium' | 'high'; 
    durationMinutes?: number;
    focusAreas?: string[];
    } = {}
): Promise<string> {
  let prompt = `Generate a gym workout session. Provide exercises, sets, and reps. Make it easy to follow.`;

  if (preferences.level) {
    prompt += ` The user is a ${preferences.level} level.`;
  }
  if (preferences.durationMinutes) {
    prompt += ` The workout should take approximately ${preferences.durationMinutes} minutes.`;
  }
  if (preferences.focusAreas && preferences.focusAreas.length > 0) {
    prompt += ` Focus on ${preferences.focusAreas.join(', ')}.`;
  }

  prompt += `
  
  Format the workout clearly with a title, a brief warm-up, and then list each exercise with sets and reps. Include a cool-down.
  Example format:
  
  **Workout Title**
  
  **Warm-up:**
  - 5 mins light cardio
  - Dynamic stretches
  
  **Workout:**
  1. Exercise 1: 3 sets of 10-12 reps
  2. Exercise 2: 3 sets of 10-12 reps
  ...
  
  **Cool-down:**
  - Stretching
  `;


  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error("Error generating gym workout:", error);
    return "Failed to generate a workout. Try a full-body session: Squats 3x10, Push-ups 3xMax, Rows 3x10, Plank 3x30s.";
  }
}