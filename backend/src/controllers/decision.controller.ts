import { Request, Response } from 'express';
import { aiService } from '../services/ai.service.js';

export const generateQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { decision } = req.body;
    const questions = await aiService.generateQuestions(decision);
    res.status(200).json({ questions });
  } catch (error: any) {
    res.status(500).json({
      error: 'AI Error',
      message: error.message || 'An error occurred while generating reflective questions.',
    });
  }
};

export const analyzeDecision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { decision, responses } = req.body;
    const analysis = await aiService.analyzeDecision(decision, responses);
    res.status(200).json(analysis);
  } catch (error: any) {
    res.status(500).json({
      error: 'AI Error',
      message: error.message || 'An error occurred while analyzing responses.',
    });
  }
};
