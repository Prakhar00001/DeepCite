"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Search,
  ShieldCheck,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ArrowRight,
} from "lucide-react";
import type { AgentName, AgentStatus, AgentLogEntry } from "@backend/types";
import { cn } from "@/lib/utils";

const AGENTS: Array<{
  name: AgentName;
  label: string;
  icon: typeof Brain;
  color: string;
  description: string;
}> = [
  {
    name: "planner",
    label: "Planner",
    icon: Brain,
    color: "planner",
    description: "Deconstructs the research question into sub-questions",
  },
  {
    name: "researcher",
    label: "Researcher",
    icon: Search,
    color: "researcher",
    description: "Extracts verified literature and web sources",
  },
  {
    name: "critic",
    label: "Critic",
    icon: ShieldCheck,
    color: "critic",
    description: "Audits for bias, gaps, and hallucination",
  },
  {
    name: "synthesizer",
    label: "Synthesizer",
    icon: FileText,
    color: "synthesizer",
    description: "Produces the structured research report",
  },
];

interface LiveWorkspaceProps {
  activeAgent: AgentName | null;
  agentStatuses: Record<AgentName, AgentStatus>;
  logs: AgentLogEntry[];
  query: string;
}

export function LiveWorkspace({ activeAgent, agentStatuses, logs, query }: LiveWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Agent Pipeline */}
      <div className="lg:col-span-3 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Agent Pipeline
          </span>
        </div>

        <div className="space-y-2.5">
          {AGENTS.map((agent, idx) => {
            const status = agentStatuses[agent.name];
            const isActive = activeAgent === agent.name;
            const isDone = status === "completed";
            const isError = status === "error";
            const Icon = agent.icon;

            return (
              <div key={agent.name}>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={cn(
                    "relative flex items-start gap-3 rounded-xl border p-4 transition-all duration-300",
                    isActive && "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5",
                    isDone && "border-border bg-card",
                    !isActive && !isDone && "border-border/50 bg-card/50",
                    isError && "border-destructive/40 bg-destructive/5"
                  )}
                >
                  {/* Connector line */}
                  {idx < AGENTS.length - 1 && (
                    <div className="absolute left-[2.1rem] top-full h-2.5 w-px bg-border" />
                  )}

                  <div
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      isActive && cn("bg-", `text-${agent.color}`),
                      isDone && "bg-primary/10 text-primary",
                      !isActive && !isDone && !isError && "bg-muted text-muted-foreground",
                      isError && "bg-destructive/10 text-destructive"
                    )}
                    style={
                      isActive
                        ? { backgroundColor: `hsl(var(--${agent.color}) / 0.12)`, color: `hsl(var(--${agent.color}))` }
                        : undefined
                    }
                  >
                    {isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin" style={{ color: `hsl(var(--${agent.color}))` }} />
                    ) : isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : isError ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-lg animate-pulse-ring"
                        style={{ backgroundColor: `hsl(var(--${agent.color}) / 0.1)` }}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{agent.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {isActive ? "Running" : isDone ? "Complete" : isError ? "Error" : "Queued"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 overflow-hidden"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {idx < AGENTS.length - 1 && (
                    <ArrowRight className="absolute -bottom-3 left-[1.85rem] h-3 w-3 text-border rotate-90" />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Memory Terminal */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Shared Memory Log
          </span>
        </div>

        <div className="h-full min-h-[400px] rounded-xl border border-border bg-card/50 overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-border/40 px-3 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            <span className="ml-2 text-[10px] text-muted-foreground font-mono">deepcite://memory</span>
          </div>

          <div className="scrollbar-thin h-[calc(100%-2.1rem)] overflow-y-auto p-3 font-mono text-xs space-y-1.5">
            <div className="text-muted-foreground/60">
              <span className="text-primary">$</span> query: "{query}"
            </div>
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <span className="text-muted-foreground/40 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-semibold",
                      log.agent === "planner" && "text-planner",
                      log.agent === "researcher" && "text-researcher",
                      log.agent === "critic" && "text-critic",
                      log.agent === "synthesizer" && "text-synthesizer"
                    )}
                  >
                    [{log.agent}]
                  </span>
                  <span className="text-foreground/80">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {activeAgent && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-primary"
              >
                _
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
