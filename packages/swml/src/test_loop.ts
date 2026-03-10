import { ContextAssembler } from './core/ContextAssembler';
import { OmegaFeedbackLoop } from './omega/OmegaFeedbackLoop';
import { Intent, Result } from './types/swml';
import * as path from 'path';
import * as fs from 'fs/promises';

async function runDemo() {
  const KNOWLEDGE_DIR = path.join(__dirname, '../knowledge_vault');
  
  // Clean up previous test runs
  await fs.rm(KNOWLEDGE_DIR, { recursive: true, force: true }).catch(() => {});

  const assembler = new ContextAssembler(KNOWLEDGE_DIR);
  const omegaLoop = new OmegaFeedbackLoop(KNOWLEDGE_DIR);

  const intent: Intent = {
    id: 'task-101',
    description: 'Create a Python script to fetch Twitter data.',
    context: {}
  };

  console.log('\n--- 🟢 CYCLE 1: Initial Attempt ---');
  // 1. Assemble prompt (Should have no prior lessons)
  const prompt1 = await assembler.assemble(intent);
  console.log('[Prompt Generated]:\n', prompt1);

  // 2. Simulate Failure (Environment friction)
  console.log('\n[Execution] Agent writes code... CI runs...');
  const failureResult: Result = {
    success: false,
    logs: 'Error: Rate limit exceeded. Code did not implement sleep/backoff strategy.',
    artifacts: []
  };

  // 3. Omega Loop kicks in (Reflection & Store)
  await omegaLoop.processResult(intent, failureResult);

  console.log('\n--- 🟢 CYCLE 2: Second Attempt (Next Day) ---');
  // 4. Assemble prompt again (Should now include the lesson)
  // Note: For this demo, we dynamically read the vault in ContextAssembler
  // We'll mock the assembler's fetch method to read actual files for the demo to work perfectly.
  
  const prompt2 = await assembler.assemble(intent);
  // (In a real implementation, assembler would parse the newly created markdown files)
  console.log('[New Prompt Generated with Gravity]:\n', prompt2);
  
  console.log('\n✅ Demo completed successfully.');
}

runDemo().catch(console.error);
