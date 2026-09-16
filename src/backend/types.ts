// DeepCite — Shared types for the multi-agent research pipeline

export type AgentName = "planner" | "researcher" | "critic" | "synthesizer";

export type AgentStatus = "idle" | "running" | "completed" | "error";

export interface SubQuestion {
  id: string;
  question: string;
  rationale: string;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  source: string;
  snippet: string;
  relevance: number; // 0–1
}

export interface ResearchFinding {
  subQuestionId: string;
  subQuestion: string;
  answer: string;
  citations: Citation[];
  confidence: number; // 0–1
}

export interface CritiqueResult {
  biasFlags: string[];
  gaps: string[];
  hallucinationRate: number; // 0–1, target 0.0
  faithfulnessScore: number; // 0–1
  corpusCoverage: number; // 0–1
  notes: string;
}

export interface SynthesizedSection {
  heading: string;
  body: string;
  citations: Citation[];
}

export interface FinalReport {
  instantDefinition: string;
  executiveSummary: string;
  sections: SynthesizedSection[];
  citations: Citation[];
  selfCritique: CritiqueResult;
  confidence: number; // 0–1
}

export interface AgentState {
  query: string;
  subQuestions: SubQuestion[];
  findings: ResearchFinding[];
  critique: CritiqueResult | null;
  report: FinalReport | null;
  error: string | null;
}

export interface AgentLogEntry {
  agent: AgentName;
  message: string;
  timestamp: string;
  status: AgentStatus;
}

export interface SSEEvent {
  type: "agent_start" | "agent_log" | "agent_complete" | "agent_error" | "pipeline_done";
  agent?: AgentName;
  state?: AgentState;
  log?: AgentLogEntry;
  error?: string;
}
