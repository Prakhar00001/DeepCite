// DeepCite — LangGraph-style state orchestration for the multi-agent pipeline

import type { AgentState, AgentName, AgentLogEntry, SSEEvent } from "./types";
import { runPlanner, runResearcher, runCritic, runSynthesizer } from "./agents";

export type StepHandler = (event: SSEEvent) => void;

function timestamp(): string {
  return new Date().toISOString();
}

export async function runPipeline(
  query: string,
  emit: StepHandler
): Promise<AgentState> {
  let state: AgentState = {
    query,
    subQuestions: [],
    findings: [],
    critique: null,
    report: null,
    error: null,
  };

  const log = (entry: Omit<AgentLogEntry, "timestamp">) => {
    emit({
      type: "agent_log",
      log: { ...entry, timestamp: timestamp() },
    });
  };

  const steps: Array<{ name: AgentName; fn: (s: AgentState, l: typeof log) => Promise<AgentState> }> = [
    { name: "planner", fn: runPlanner },
    { name: "researcher", fn: runResearcher },
    { name: "critic", fn: runCritic },
    { name: "synthesizer", fn: runSynthesizer },
  ];

  for (const step of steps) {
    emit({ type: "agent_start", agent: step.name });

    try {
      state = await step.fn(state, log);
      emit({ type: "agent_complete", agent: step.name, state });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      state.error = message;
      emit({ type: "agent_error", agent: step.name, error: message });
      break;
    }
  }

  emit({ type: "pipeline_done", state });
  return state;
}
