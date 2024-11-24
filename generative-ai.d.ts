// types/generative-ai.d.ts
declare module '@google/generative-ai' {
    export class GoogleGenerativeAI {
      constructor(apiKey: string);
      getGenerativeModel(config: { model: string }): GenerativeModel;
    }
  
    export interface GenerativeModel {
      generateContent(prompt: Array<string | { inlineData: { data: string; mimeType: string } }>): Promise<GenerateContentResult>;
    }
  
    export interface GenerateContentResult {
      response: {
        text(): string;
      };
    }
  }