import * as fs from 'fs/promises';
import * as path from 'path';
import { Intent, Result, KnowledgeNode, IOmegaFeedbackLoop } from '../types/swml';

export class OmegaFeedbackLoop implements IOmegaFeedbackLoop {
  private knowledgeDir: string;

  constructor(knowledgeDir: string) {
    this.knowledgeDir = knowledgeDir;
  }

  /**
   * Process the execution result. If it contains failures or human feedback,
   * extract lessons learned via Reflection (LLM) and store them in the Knowledge Vault.
   * This is the physical realization of the Ω function.
   */
  async processResult(intent: Intent, result: Result): Promise<KnowledgeNode | null> {
    console.log(`[OmegaLoop] Processing result for Intent: ${intent.id}`);

    if (result.success && !result.feedback) {
      console.log(`[OmegaLoop] Execution was perfectly successful. No reflection needed.`);
      return null;
    }

    console.log(`[OmegaLoop] Friction detected (Error/Feedback). Initiating Reflection...`);
    const newKnowledge = await this.reflectAndExtract(intent, result);
    await this.saveToVault(newKnowledge);
    
    return newKnowledge;
  }

  /**
   * Calls the LLM (Claude 4.6) to analyze the failure/feedback and generate a new SOP.
   */
  private async reflectAndExtract(intent: Intent, result: Result): Promise<KnowledgeNode> {
    // TODO: Actually call Claude API here
    console.log(`[OmegaLoop] (Mock) Calling Claude 4.6 to reflect on errors...`);
    
    // Mocked Reflection
    const sop = result.feedback 
      ? `Based on human feedback: ${result.feedback}` 
      : `Based on error logs: Do not use deprecated APIs in module XYZ.`;

    return {
      id: `k-${Date.now()}`,
      topic: intent.description,
      failureContext: result.logs || result.feedback || 'Unknown failure',
      sop: sop,
      updatedAt: new Date()
    };
  }

  /**
   * Writes the newly discovered knowledge to the local Markdown vault.
   * The ContextAssembler will pick this up on the next run.
   */
  private async saveToVault(node: KnowledgeNode): Promise<void> {
    await fs.mkdir(this.knowledgeDir, { recursive: true });
    
    const filename = `lesson_${node.id}.md`;
    const filepath = path.join(this.knowledgeDir, filename);
    
    const content = `
# Lesson: ${node.topic}
**Date:** ${node.updatedAt.toISOString()}

## Failure Context
${node.failureContext}

## Standard Operating Procedure (SOP)
${node.sop}
`;
    
    await fs.writeFile(filepath, content.trim(), 'utf-8');
    console.log(`[OmegaLoop] Knowledge saved to Vault: ${filepath}`);
  }
}
