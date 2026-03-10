import { Intent, IContextAssembler } from '../types/swml';
import * as fs from 'fs/promises';
import * as path from 'path';

export class ContextAssembler implements IContextAssembler {
  private knowledgePath: string;

  constructor(knowledgePath: string) {
    this.knowledgePath = knowledgePath;
  }

  async assemble(intent: Intent): Promise<string> {
    console.log(`[ContextAssembler] Assembling context for Intent: ${intent.id}`);
    
    const dynamicSOP = await this.fetchRelevantSOPs(intent);
    const hasKnowledge = dynamicSOP.trim().length > 0;
    
    const systemPrompt = `
You are an SWML-driven AI Agent.
Your current task is: ${intent.description}

### CRITICAL KNOWLEDGE (LEARNED FROM PAST FAILURES)
${hasKnowledge ? dynamicSOP : 'No prior failures recorded. Proceed carefully.'}

### INSTRUCTIONS
Do not repeat past mistakes. Follow the SOP strictly.
`;
    return systemPrompt;
  }

  private async fetchRelevantSOPs(intent: Intent): Promise<string> {
    try {
      const files = await fs.readdir(this.knowledgePath);
      let sops = [];
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(path.join(this.knowledgePath, file), 'utf-8');
          sops.push(`--- From ${file} ---\n${content}`);
        }
      }
      return sops.join('\n\n');
    } catch (e) {
      return ''; // Directory might not exist yet
    }
  }
}
