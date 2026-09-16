"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  RotateCcw,
  FileText,
  BarChart3,
  LayoutDashboard,
  Brain,
  ShieldCheck,
  BookOpenText,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { LiveWorkspace } from "@/components/LiveWorkspace";
import { FinalReportView } from "@/components/FinalReportView";
import { EvaluationDashboard } from "@/components/EvaluationDashboard";
import type {
  AgentName,
  AgentStatus,
  AgentLogEntry,
  AgentState,
  FinalReport,
  CritiqueResult,
} from "@backend/types";
import { cn } from "@/lib/utils";

type Phase = "landing" | "running" | "results";

const SAMPLE_QUERIES = [
  "What are the latest breakthroughs in quantum error correction?",
  "How does retrieval-augmented generation reduce LLM hallucination?",
  "What is the economic impact of carbon pricing policies?",
  "Explain the mechanism of CRISPR-Cas9 gene editing",
];

const AGENT_ORDER: AgentName[] = ["planner", "researcher", "critic", "synthesizer"];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentName, AgentStatus>>({
    planner: "idle",
    researcher: "idle",
    critic: "idle",
    synthesizer: "idle",
  });
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [critique, setCritique] = useState<CritiqueResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"report" | "evaluation">("report");
  const resultsRef = useRef<HTMLDivElement>(null);

  const startResearch = useCallback(async (q: string) => {
    if (!q.trim()) return;

    setPhase("running");
    setActiveQuery(q);
    setError(null);
    setReport(null);
    setCritique(null);
    setLogs([]);
    setActiveAgent(null);
    setAgentStatuses({ planner: "idle", researcher: "idle", critic: "idle", synthesizer: "idle" });

    try {
      const resp = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`Request failed: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;

          try {
            const event = JSON.parse(json) as {
              type: string;
              agent?: AgentName;
              state?: AgentState;
              log?: AgentLogEntry;
              error?: string;
            };

            if (event.type === "agent_start" && event.agent) {
              setActiveAgent(event.agent);
              setAgentStatuses((prev) => ({ ...prev, [event.agent!]: "running" }));
            } else if (event.type === "agent_log" && event.log) {
              setLogs((prev) => [...prev, event.log!]);
            } else if (event.type === "agent_complete" && event.agent) {
              setAgentStatuses((prev) => ({ ...prev, [event.agent!]: "completed" }));
            } else if (event.type === "agent_error") {
              if (event.agent) {
                setAgentStatuses((prev) => ({ ...prev, [event.agent!]: "error" }));
              }
              setError(event.error ?? "An unknown error occurred");
            } else if (event.type === "pipeline_done" && event.state) {
              if (event.state.report) setReport(event.state.report);
              if (event.state.critique) setCritique(event.state.critique);
              if (event.state.error) setError(event.state.error);
              setActiveAgent(null);
              setPhase("results");
              setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start research");
      setPhase("landing");
    }
  }, []);

  const reset = () => {
    setPhase("landing");
    setQuery("");
    setActiveQuery("");
    setReport(null);
    setCritique(null);
    setLogs([]);
    setError(null);
    setActiveAgent(null);
    setAgentStatuses({ planner: "idle", researcher: "idle", critic: "idle", synthesizer: "idle" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Landing / Hero */}
      {phase === "landing" && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-6">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Powered by Groq GPT-OSS 120B</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-4">
                Deep research with
                <br />
                <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-4 bg-clip-text text-transparent">
                  verified citations
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
                Four specialized AI agents — Planner, Researcher, Critic, and Synthesizer —
                work in sequence to deliver exhaustive, citation-backed research reports with
                self-critique metrics.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="relative mx-auto max-w-2xl"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-50 group-focus-within:opacity-80 transition-opacity" />
                <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg">
                  <Search className="h-5 w-5 text-muted-foreground ml-2 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startResearch(query)}
                    placeholder="Ask any research question..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  <button
                    onClick={() => startResearch(query)}
                    disabled={!query.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Research
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sample Queries */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                {SAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuery(q);
                      startResearch(q);
                    }}
                    className="rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {q.length > 50 ? q.slice(0, 50) + "..." : q}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Agent Preview Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
              {[
                { icon: Brain, label: "Planner", desc: "Decomposes the question", color: "planner" },
                { icon: Search, label: "Researcher", desc: "Extracts sources", color: "researcher" },
                { icon: ShieldCheck, label: "Critic", desc: "Audits for hallucination", color: "critic" },
                { icon: BookOpenText, label: "Synthesizer", desc: "Builds the report", color: "synthesizer" },
              ].map((a, i) => {
                const Icon = a.icon;
                return (
                  <motion.div
                    key={a.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    className="rounded-xl border border-border/60 bg-card/50 p-4 text-center"
                  >
                    <div
                      className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg mb-2"
                      style={{ backgroundColor: `hsl(var(--${a.color}) / 0.12)` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: `hsl(var(--${a.color}))` }} />
                    </div>
                    <p className="text-sm font-semibold">{a.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* Running / Results */}
      {(phase === "running" || phase === "results") && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Query Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium max-w-md truncate">{activeQuery}</span>
              </div>
              {phase === "running" && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Pipeline running...
                </div>
              )}
            </div>

            {phase === "results" && (
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
                  <button
                    onClick={() => setView("report")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      view === "report" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Report
                  </button>
                  <button
                    onClick={() => setView("evaluation")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      view === "evaluation" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Evaluation
                  </button>
                </div>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New Research
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
                <button onClick={reset} className="ml-auto text-xs underline">Start over</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Workspace */}
          <div className="mb-8">
            <LiveWorkspace
              activeAgent={activeAgent}
              agentStatuses={agentStatuses}
              logs={logs}
              query={activeQuery}
            />
          </div>

          {/* Results */}
          <div ref={resultsRef}>
            <AnimatePresence mode="wait">
              {phase === "results" && report && critique && (
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  {view === "report" ? (
                    <FinalReportView report={report} query={activeQuery} />
                  ) : (
                    <EvaluationDashboard
                      critique={critique}
                      confidence={report.confidence}
                      citationCount={report.citations.length}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            DeepCite — Multi-Agent Research with Citation & Self-Critique
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, Groq, and Framer Motion
          </p>
        </div>
      </footer>
    </div>
  );
}
