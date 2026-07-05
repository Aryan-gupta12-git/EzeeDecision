import { GoogleGenAI } from '@google/genai';
import { AIService, DecisionAnalysisResponse } from './ai.interface.js';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'YOUR_API_KEY') {
  console.warn('WARNING: GEMINI_API_KEY is not configured in backend/.env');
}

// Instantiate the modern Google Gen AI client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export class GeminiService implements AIService {
  async generateQuestions(decision: string): Promise<string[]> {
    const prompt = `
You are a thoughtful, calm, and rational advisor. The user is trying to make the following decision: "${decision}".
Generate 6 to 8 personalized, deeply reflective questions that the user should answer to make a sound decision. 
The questions must be highly customized to the specific nature of the decision. For example, if the decision is about purchasing, ask about alternatives, financial comfort, and necessity. If it is about career change, ask about motivations, risk, and long-term trajectory.

Return the output as a JSON object containing a single key "questions" which is an array of strings. 
Do not include any markdown formatting (like \`\`\`json) or text outside the JSON object.
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Received empty response from Gemini API.');
      }

      const parsed = this.parseJSONSafely(responseText);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid response format: "questions" array not found.');
      }

      return parsed.questions;
    } catch (error: any) {
      this.handleError(error, 'generating reflective questions');
    }
  }

  async analyzeDecision(
    decision: string,
    responses: { question: string; answer: string }[]
  ): Promise<DecisionAnalysisResponse> {
    const formattedResponses = responses
      .map((r, i) => `Question ${i + 1}: ${r.question}\nAnswer: ${r.answer}`)
      .join('\n\n');

    const prompt = `
You are an experienced, calm, and rational life mentor and decision coach.
Never make emotional decisions. Think logically. Identify hidden risks. Identify financial implications. Identify emotional bias. Provide balanced advice.
Never answer with only Yes or No. Always explain your reasoning. If insufficient information exists, explicitly say so.

Analyze the user's decision: "${decision}"
Based on their responses to these reflective questions:
${formattedResponses}

Perform a thorough, multi-dimensional analysis. You must output a JSON object containing EXACTLY these keys:
{
  "summary": "A 2-3 sentence calm and rational summary of the decision context and user's reflections.",
  "pros": [
    "A clear factor or reason to proceed (max 3 items)."
  ],
  "cons": [
    "A potential risk, warning sign, or reason to pause/avoid (max 3 items)."
  ],
  "riskLevel": "Low" or "Medium" or "High",
  "confidence": A number between 0 and 100 representing how confident and clear the decision is based on their answers,
  "recommendation": "Proceed" or "Wait" or "Not Recommended",
  "reason": "A single sentence summary of the key reason behind this recommendation.",
  "finalAdvice": "A closing paragraph of actionable, empathetic, yet highly rational advice.",
  "metrics": {
    "needVsWant": {
      "score": A number between 0 and 100 representing how much this is a true need vs a want,
      "rating": "Discretionary Want" or "Balanced Want" or "Definite Need",
      "explanation": "A one-sentence explanation of this rating based on their answers."
    },
    "urgency": {
      "score": A number between 0 and 100 representing the urgency,
      "rating": "Can Wait" or "Moderate Urgency" or "High Urgency",
      "explanation": "A one-sentence explanation of this rating based on their answers."
    },
    "financialReadiness": {
      "score": A number between 0 and 100 representing financial comfort/readiness,
      "rating": "High Financial Risk" or "Manageable" or "Fully Comfortable",
      "explanation": "A one-sentence explanation of this rating based on their answers."
    },
    "longTermValue": {
      "score": A number between 0 and 100 representing long-term utility,
      "rating": "Low Future Value" or "Moderate Value" or "High Future Value",
      "explanation": "A one-sentence explanation of this rating based on their answers."
    },
    "riskLevel": {
      "score": A number between 0 and 100 representing the overall risk,
      "rating": "Low Risk" or "Moderate Risk" or "High Risk",
      "explanation": "A one-sentence explanation of this rating based on their answers."
    },
    "confidence": {
      "score": A number between 0 and 100 representing reasoning confidence,
      "rating": "Low Confidence" or "Moderate Confidence" or "High Confidence",
      "explanation": "A one-sentence explanation of this rating based on their answers."
    }
  }
}

Do not include any markdown wrappers or text outside the JSON. Return only the JSON object.
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Received empty response from Gemini API.');
      }

      const parsed = this.parseJSONSafely(responseText);

      // Validate base properties
      if (!parsed.summary || !parsed.recommendation || !parsed.metrics) {
        throw new Error('Analysis response structure from Gemini is incomplete.');
      }

      return parsed as DecisionAnalysisResponse;
    } catch (error: any) {
      this.handleError(error, 'analyzing decision responses');
    }
  }

  private parseJSONSafely(text: string): any {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleaned);
  }

  private handleError(error: any, action: string): never {
    console.error(`Error during Gemini API call for ${action}:`, error);

    let message = `Failed to complete API request for ${action}.`;
    const status = error.status || error.statusCode || (error.response ? error.response.status : undefined);
    const errText = error.message || '';

    if (status === 400 || status === 401 || status === 403 || errText.includes('API key') || errText.includes('key is invalid')) {
      message = 'Your Gemini API Key is invalid, expired, or missing. Please verify the GEMINI_API_KEY in backend/.env';
    } else if (status === 404 || errText.includes('not found') || errText.includes('unsupported')) {
      message = "The requested model 'gemini-2.5-flash' is not available. Please verify your billing configurations or region availability in Google AI Studio.";
    } else if (status === 429 || errText.includes('Quota') || errText.includes('rate limit') || errText.includes('ResourceExhausted')) {
      message = 'Gemini API quota exceeded or rate limited. Please pause briefly and try again.';
    } else if (error instanceof SyntaxError) {
      message = 'The advisor model returned invalid JSON output. Please re-submit to try again.';
    } else if (errText) {
      message = `AI Service Error: ${errText}`;
    }

    throw new Error(message);
  }
}
