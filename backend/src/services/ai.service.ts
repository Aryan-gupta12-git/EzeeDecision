import { AIService } from './ai.interface.js';
import { GeminiService } from './gemini.service.js';

// Centralised AI Service provider. Swap the class instance below to change engines (e.g. OpenAI or Claude)
export const aiService: AIService = new GeminiService();
