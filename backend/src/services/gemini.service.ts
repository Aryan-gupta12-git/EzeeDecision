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
You are a warm, caring, and supportive decision helper. Think of yourself as a caring mentor, an older sibling, a trusted friend, or a calm coach. 
The user needs help with this choice: "${decision}".

Your goal is to generate a list of 6 to 8 highly personalized, progressive questions to help the user think clearly about this choice. 

Follow these rules very strictly:

1. READING LEVEL & VOCABULARY:
- Use simple, everyday English.
- Aim for a reading level that a 10 to 14-year-old can easily understand.
- Do NOT use difficult or formal words.
- Do NOT use any of these words:
  * evaluate
  * implications
  * feasible
  * motivation
  * circumstance
  * perspective
  * prioritize
  * justify
  * consequence
  * significant
  * consideration
- Instead, ALWAYS use simple words like:
  * think
  * feel
  * need
  * want
  * problem
  * help
  * worry
  * choose
  * reason
  * later
  * today
- If a simpler word exists, always choose it.

2. TONE:
- Be warm, kind, and supportive.
- Do NOT sound like a professor, a lawyer, a clinical psychologist using technical terms, or an exam paper.
- Never sound formal or clinical. The user should feel heard, respected, and comfortable.

3. EMOTIONAL INTELLIGENCE:
- Understand that choices are emotional, not just logical.
- Gently explore feelings like excitement, fear, stress, pressure, guilt, confidence, uncertainty, or happiness.
- Ask questions like: "How does this make you feel?", "Are you excited or mostly worried?", "Is someone else pushing you to do this?", "Are you afraid of missing out?", "If nobody judged you, would you still choose this?", "What worries you the most?", "What are you hoping will happen?", "What would make you feel confident about this?". These questions must feel natural, not clinical.

4. PROGRESSIVE FLOW (ADAPTIVE SIMULATION):
- Since you are generating the list of questions all at once, make them flow like a natural, step-by-step conversation.
- The questions should build on each other logically. Start with the core choice and how they feel, transition to hidden worries or assumptions, explore social expectations/timing, and finish with what would bring them confidence or clarity.
- Avoid generic, checklist-style questions (like "Why do you want this?" or "Can you afford it?"). Make them specific to the user's choice: "${decision}".

5. EASY TO READ:
- Keep sentences short.
- Avoid complicated grammar or long paragraphs.
- Ask only one clear idea per question.
- Each question must be just one or two short, simple sentences.

EXAMPLES OF WHAT TO DO AND NOT TO DO:

- DO NOT ASK: "How might this decision influence your long-term personal and professional aspirations?"
- INSTEAD ASK: "How could this choice affect your future?"

- DO NOT ASK: "What is your primary motivation for pursuing this option?"
- INSTEAD ASK: "Why does this matter to you?"

- DO NOT ASK: "Would postponing this decision materially affect the outcome?"
- INSTEAD ASK: "What happens if you wait a few weeks?"

- DO NOT ASK: "Is your decision influenced by external expectations?"
- INSTEAD ASK: "Are you choosing this because you want to, or because others expect it?"

Scenario Examples for Question flow:

Scenario 1: "I want to buy a MacBook (because my current laptop is slow)"
1. "How does your current laptop make you feel when you use it?"
2. "What is the biggest problem you want to solve with a new MacBook?"
3. "Are you excited about getting a new laptop, or are you worried about the cost?"
4. "If you couldn't get a MacBook, is there another laptop that could still help you?"
5. "What happens if you wait a few weeks before buying it?"
6. "If money wasn't a factor, would you still choose the MacBook? Why?"
7. "What would make you feel good about this choice?"

Scenario 2: "I want to quit my job"
1. "How does going to work make you feel right now?"
2. "Is it the company, the job itself, or the people making you want to leave?"
3. "Are you feeling pushed to leave, or is this something you really want?"
4. "What worries you the most about leaving your job?"
5. "If you quit, what are you hoping will happen next?"
6. "What happens if you stay for six more months?"
7. "What would make you feel safe and ready to make this jump?"

Scenario 3: "I want to start a business"
1. "What got you excited about starting this business?"
2. "What is the biggest guess or assumption you are making about your idea?"
3. "Who is the very first person you think would pay for what you're selling?"
4. "What is the biggest fear or risk you worry about if this doesn't work?"
5. "Do you have enough saved to live on while you build this?"
6. "Is anyone else pushing you to do this, or is it purely your own dream?"
7. "What would make you feel ready to take the first step?"

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
