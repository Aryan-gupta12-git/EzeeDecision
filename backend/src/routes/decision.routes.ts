import { Router } from 'express';
import { generateQuestions, analyzeDecision } from '../controllers/decision.controller.js';
import { validateQuestionsRequest, validateAnalyzeRequest } from '../middleware/validation.js';

const router = Router();

router.post('/questions', validateQuestionsRequest, generateQuestions);
router.post('/analyze', validateAnalyzeRequest, analyzeDecision);

export default router;
