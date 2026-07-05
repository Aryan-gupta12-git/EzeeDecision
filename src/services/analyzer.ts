export interface Answer {
  questionId: string;
  questionText: string;
  answerText: string;
}

export interface DecisionContext {
  decision: string;
  answers: Answer[];
}

export interface AnalysisCard {
  title: string;
  score: number; // 0 to 100
  rating: string; // e.g. "Definite Need", "High Urgency", etc.
  explanation: string;
}

export interface AnalysisResult {
  recommendation: 'proceed' | 'wait' | 'avoid';
  recommendationLabel: string;
  recommendationEmoji: string;
  explanation: string;
  reasons: string[];
  cards: AnalysisCard[];
}

// Quiet, calm, rational evaluation of the user's answers
export class HeuristicAnalyzerService {
  public static analyze(context: DecisionContext): Promise<AnalysisResult> {
    return new Promise((resolve) => {
      // Simulate slight processing delay to make it feel thoughtful and deliberate
      setTimeout(() => {
        resolve(this.processAnalysis(context));
      }, 1500);
    });
  }

  private static processAnalysis(context: DecisionContext): AnalysisResult {
    const answersMap = new Map<string, string>();
    let totalWordCount = 0;
    
    context.answers.forEach((ans) => {
      answersMap.set(ans.questionId, ans.answerText.toLowerCase().trim());
      totalWordCount += ans.answerText.split(/\s+/).filter(Boolean).length;
    });

    const getAnswer = (id: string) => answersMap.get(id) || '';

    // Extract key answers for parsing
    const why = getAnswer('why');
    const problem = getAnswer('problem');
    const needWant = getAnswer('need_want');
    const urgency = getAnswer('urgency');
    const wait = getAnswer('wait');
    const consequences = getAnswer('consequences');
    const sixMonths = getAnswer('six_months');
    const financial = getAnswer('financial');
    const alternatives = getAnswer('alternatives');
    const futureSelf = getAnswer('future_self');

    // 1. Need vs Want Score
    let needScore = 50;
    if (needWant.includes('need') || needWant.includes('essential') || needWant.includes('must') || needWant.includes('necessity')) {
      needScore += 25;
    }
    if (needWant.includes('want') || needWant.includes('desire') || needWant.includes('luxury') || needWant.includes('wish')) {
      needScore -= 20;
    }
    if (problem.includes('solve') || problem.includes('fix') || problem.includes('broken') || problem.includes('time') || (problem.length > 15 && !problem.includes('nothing') && !problem.includes('none'))) {
      needScore += 15;
    } else if (problem.includes('no problem') || problem.includes('none') || problem.includes('nothing') || problem.includes('don\'t know')) {
      needScore -= 20;
    }
    needScore = Math.max(0, Math.min(100, needScore));
    let needRating = "Discretionary Want";
    let needExpl = "This decision aligns more with a temporary desire rather than a critical requirement.";
    if (needScore > 70) {
      needRating = "Definite Need";
      needExpl = "This addresses an essential requirement or solves an active pain point in your life.";
    } else if (needScore >= 40) {
      needRating = "Balanced Want";
      needExpl = "A blend of personal aspiration and utility. It has practical elements but is not strictly essential.";
    }

    // 2. Urgency Score
    let urgencyScore = 50;
    if (urgency.includes('urgent') || urgency.includes('now') || urgency.includes('today') || urgency.includes('asap') || urgency.includes('immediate')) {
      urgencyScore += 25;
    }
    if (urgency.includes('not urgent') || urgency.includes('later') || urgency.includes('weeks') || urgency.includes('months') || urgency.includes('year')) {
      urgencyScore -= 20;
    }
    if (wait.includes('yes') || wait.includes('can wait') || wait.includes('delay') || wait.includes('postpone')) {
      urgencyScore -= 25;
    } else if (wait.includes('no') || wait.includes('cannot') || wait.includes('can\'t wait')) {
      urgencyScore += 25;
    }
    urgencyScore = Math.max(0, Math.min(100, urgencyScore));
    let urgencyRating = "Can Wait";
    let urgencyExpl = "There is no immediate penalty for delaying this. A cooling-off period is highly recommended.";
    if (urgencyScore > 70) {
      urgencyRating = "High Urgency";
      urgencyExpl = "Time-sensitive conditions suggest that delaying this decision carries a significant cost.";
    } else if (urgencyScore >= 40) {
      urgencyRating = "Moderate Urgency";
      urgencyExpl = "There is a slight momentum, but taking a few days or weeks to reflect will not harm the outcome.";
    }

    // 3. Financial Readiness Score
    let financialScore = 55;
    if (financial.includes('yes') || financial.includes('comfortable') || financial.includes('affordable') || financial.includes('saved') || financial.includes('budget') || financial.includes('fine')) {
      financialScore += 30;
    }
    if (financial.includes('no') || financial.includes('tight') || financial.includes('debt') || financial.includes('expensive') || financial.includes('stretch') || financial.includes('loan') || financial.includes('credit')) {
      financialScore -= 35;
    }
    financialScore = Math.max(0, Math.min(100, financialScore));
    let financialRating = "High Financial Risk";
    let financialExpl = "Proceeding would stretch your resources or add undesirable financial pressure.";
    if (financialScore > 75) {
      financialRating = "Fully Comfortable";
      financialExpl = "This decision fits comfortably within your current financial scope and budget limits.";
    } else if (financialScore >= 45) {
      financialRating = "Manageable";
      financialExpl = "Affordable, but requires conscious budgeting. Ensure no unexpected expenses crop up.";
    }

    // 4. Long-term Value Score
    let valueScore = 50;
    if (sixMonths.includes('yes') || sixMonths.includes('improve') || sixMonths.includes('better') || sixMonths.includes('growth') || sixMonths.includes('will')) {
      valueScore += 20;
    } else if (sixMonths.includes('no') || sixMonths.includes('same') || sixMonths.includes('not really')) {
      valueScore -= 20;
    }
    if (futureSelf.includes('yes') || futureSelf.includes('thank') || futureSelf.includes('absolutely') || futureSelf.includes('grateful')) {
      valueScore += 25;
    } else if (futureSelf.includes('no') || futureSelf.includes('regret') || futureSelf.includes('doubt')) {
      valueScore -= 25;
    }
    valueScore = Math.max(0, Math.min(100, valueScore));
    let valueRating = "Low Future Value";
    let valueExpl = "The positive impact seems transient. It might feel good now but could lose relevance quickly.";
    if (valueScore > 70) {
      valueRating = "High Future Value";
      valueExpl = "Your future self is highly likely to appreciate this choice. It contributes to sustained well-being.";
    } else if (valueScore >= 40) {
      valueRating = "Moderate Value";
      valueExpl = "Provides stable, incremental benefits over time, though it may not be a major game-changer.";
    }

    // 5. Risk Level Score (Lower is better)
    let riskScore = 30;
    if (financialScore < 45) {
      riskScore += 30;
    }
    if (consequences.includes('nothing') || consequences.includes('no difference') || consequences.includes('fine') || consequences.includes('same')) {
      riskScore += 20;
    }
    if (alternatives.includes('no') || alternatives.includes('not really') || alternatives.includes('haven\'t')) {
      riskScore += 20;
    } else if (alternatives.includes('yes') || alternatives.includes('researched') || alternatives.includes('compared')) {
      riskScore -= 10;
    }
    riskScore = Math.max(0, Math.min(100, riskScore));
    let riskRating = "Low Risk";
    let riskExpl = "Few negative consequences are tied to this action. Low potential for regret or downside.";
    if (riskScore > 65) {
      riskRating = "High Risk";
      riskExpl = "Significant financial, emotional, or opportunity costs are present. Proceed with extreme caution.";
    } else if (riskScore >= 35) {
      riskRating = "Moderate Risk";
      riskExpl = "Standard operational and personal risks. Manageable with proper planning and research.";
    }

    // 6. Confidence Score
    let confidenceScore = 50;
    const avgWordCount = totalWordCount / 10;
    if (avgWordCount > 15) {
      confidenceScore += 15;
    } else if (avgWordCount < 6) {
      confidenceScore -= 20;
    }
    // Check if user has strong self-reflection on why
    if (why.length > 25) {
      confidenceScore += 10;
    }
    if (alternatives.includes('yes') || alternatives.includes('researched') || alternatives.includes('compared')) {
      confidenceScore += 15;
    } else {
      confidenceScore -= 10;
    }
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));
    let confidenceRating = "Low Confidence";
    let confidenceExpl = "Reflections are brief or alternatives haven't been thoroughly explored yet.";
    if (confidenceScore > 75) {
      confidenceRating = "High Confidence";
      confidenceExpl = "You have answered with depth and clarity, showing a thorough understanding of the options.";
    } else if (confidenceScore >= 45) {
      confidenceRating = "Moderate Confidence";
      confidenceExpl = "A reasonable grasp of the choice, though a bit more research could solidify your position.";
    }

    // Recommendation logic
    let recommendation: 'proceed' | 'wait' | 'avoid' = 'wait';
    let recommendationLabel = 'Consider Waiting';
    let recommendationEmoji = '⚠️';
    let explanation = '';
    const reasons: string[] = [];

    // Evaluate
    if (financialScore >= 60 && needScore >= 55 && valueScore >= 60 && riskScore < 50) {
      recommendation = 'proceed';
      recommendationLabel = 'Proceed';
      recommendationEmoji = '✅';
      explanation = `Based on your reflections, this decision appears sound. It satisfies an active requirement, aligns with your budget, and carries solid long-term value with acceptable downside risk. You have thought this through thoroughly.`;
      reasons.push("Solves an actual, defined problem.");
      reasons.push("Fits comfortably within your financial capacity.");
      reasons.push("Carries clear long-term value that your future self will appreciate.");
    } else if (financialScore < 40 || riskScore >= 70 || (needScore < 30 && valueScore < 30)) {
      recommendation = 'avoid';
      recommendationLabel = 'Not Recommended';
      recommendationEmoji = '❌';
      explanation = `Upon analysis, this decision presents significant caution signals. The long-term value is low compared to the risk, or it imposes an uncomfortable financial load. We advise pausing to re-evaluate.`;
      
      if (financialScore < 45) {
        reasons.push("High financial risk or strain on resources.");
      }
      if (riskScore >= 60) {
        reasons.push("Strong downside potential or lack of backup options.");
      }
      if (needScore < 40 && valueScore < 45) {
        reasons.push("Limited long-term value or impulsive, emotion-driven motivation.");
      }
      if (reasons.length === 0) {
        reasons.push("Heavily weighted towards short-term gratification over stability.");
      }
    } else {
      recommendation = 'wait';
      recommendationLabel = 'Consider Waiting';
      recommendationEmoji = '⚠️';
      explanation = `This decision has merits, but it doesn't feel ready yet. There are either alternative avenues you haven't fully explored, or the urgency is low enough that a deliberate pause will clarify your path.`;
      
      if (urgencyScore < 45) {
        reasons.push("The issue is not urgent; there is no penalty for waiting.");
      }
      if (alternatives.includes('no') || alternatives.includes('not really') || alternatives.includes('haven\'t')) {
        reasons.push("Better alternatives may exist. Additional research is recommended.");
      }
      if (needScore < 50) {
        reasons.push("Motivation aligns more with a temporary want than a need.");
      }
      if (reasons.length === 0) {
        reasons.push("Further reflection will help separate the impulse from the utility.");
      }
    }

    return {
      recommendation,
      recommendationLabel,
      recommendationEmoji,
      explanation,
      reasons,
      cards: [
        { title: 'Need vs Want', score: needScore, rating: needRating, explanation: needExpl },
        { title: 'Urgency', score: urgencyScore, rating: urgencyRating, explanation: urgencyExpl },
        { title: 'Financial Readiness', score: financialScore, rating: financialRating, explanation: financialExpl },
        { title: 'Long-term Value', score: valueScore, rating: valueRating, explanation: valueExpl },
        { title: 'Risk Level', score: riskScore, rating: riskRating, explanation: riskExpl },
        { title: 'Confidence Score', score: confidenceScore, rating: confidenceRating, explanation: confidenceExpl }
      ]
    };
  }
}
