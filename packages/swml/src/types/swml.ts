/**
 * SWML: Shunsuke's World Model Logic
 * Core Type Definitions
 */

export interface Intent {
  id: string;
  description: string;
  context: Record<string, any>;
}

export interface WorldState {
  environment: 'local' | 'github' | 'cloud';
  cwd: string;
  activeTools: string[];
}

export interface Result {
  success: boolean;
  logs: string;
  feedback?: string; // Human or CI feedback
  artifacts: string[];
}

export interface KnowledgeNode {
  id: string;
  topic: string;
  failureContext: string;
  sop: string; // Standard Operating Procedure
  updatedAt: Date;
}

export interface IContextAssembler {
  assemble(intent: Intent): Promise<string>; // Returns the enhanced system prompt
}

export interface IOmegaFeedbackLoop {
  processResult(intent: Intent, result: Result): Promise<KnowledgeNode | null>;
}