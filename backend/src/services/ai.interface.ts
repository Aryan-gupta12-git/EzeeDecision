export interface MetricDetail {
  score: number;
  rating: string;
  explanation: string;
}

export interface AnalysisMetrics {
  needVsWant: MetricDetail;
  urgency: MetricDetail;
  financialReadiness: MetricDetail;
  longTermValue: MetricDetail;
  riskLevel: MetricDetail;
  confidence: MetricDetail;
}

export interface DecisionAnalysisResponse {
  summary: string;
  pros: string[];
  cons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  recommendation: 'Proceed' | 'Wait' | 'Not Recommended';
  reason: string;
  finalAdvice: string;
  metrics: AnalysisMetrics;
}

export interface AIService {
  generateQuestions(decision: string): Promise<string[]>;
  analyzeDecision(
    decision: string,
    responses: { question: string; answer: string }[]
  ): Promise<DecisionAnalysisResponse>;
}
