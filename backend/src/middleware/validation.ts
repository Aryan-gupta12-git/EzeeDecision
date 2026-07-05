import { Request, Response, NextFunction } from 'express';

export const validateQuestionsRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { decision } = req.body;

  if (!decision || typeof decision !== 'string' || decision.trim().length === 0) {
    res.status(400).json({
      error: 'Invalid Request',
      message: 'The "decision" field is required and must be a non-empty string.',
    });
    return;
  }

  next();
};

export const validateAnalyzeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { decision, responses } = req.body;

  if (!decision || typeof decision !== 'string' || decision.trim().length === 0) {
    res.status(400).json({
      error: 'Invalid Request',
      message: 'The "decision" field is required and must be a non-empty string.',
    });
    return;
  }

  if (!responses || !Array.isArray(responses)) {
    res.status(400).json({
      error: 'Invalid Request',
      message: 'The "responses" field is required and must be an array.',
    });
    return;
  }

  const minAnswers = 3;
  if (responses.length < minAnswers) {
    res.status(400).json({
      error: 'Invalid Request',
      message: `You must answer at least ${minAnswers} questions to receive a high-quality analysis.`,
    });
    return;
  }

  // Validate each response item
  for (let i = 0; i < responses.length; i++) {
    const item = responses[i];
    if (
      !item ||
      typeof item.question !== 'string' ||
      item.question.trim().length === 0 ||
      typeof item.answer !== 'string' ||
      item.answer.trim().length === 0
    ) {
      res.status(400).json({
        error: 'Invalid Request',
        message: `Response at index ${i} must contain non-empty "question" and "answer" strings.`,
      });
      return;
    }
  }

  next();
};
