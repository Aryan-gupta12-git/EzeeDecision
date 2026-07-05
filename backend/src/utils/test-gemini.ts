import 'dotenv/config';
import { GeminiService } from '../services/gemini.service.js';

async function runTest() {
  console.log('--- Testing Gemini SDK Integration ---');
  const service = new GeminiService();
  try {
    console.log('Sending test prompt to gemini-2.5-flash for question generation...');
    const questions = await service.generateQuestions('Should I purchase a Kindle?');
    console.log('\nSuccess! Dynamic questions generated:');
    questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
    console.log('\nAll checks passed. Migration is working perfectly!');
    process.exit(0);
  } catch (error: any) {
    console.error('\nTest Failed!');
    console.error(error.message || error);
    process.exit(1);
  }
}

runTest();
