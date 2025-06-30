// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_GEMINI_API_KEY?: string; // This needs to match the .env file
  }
}