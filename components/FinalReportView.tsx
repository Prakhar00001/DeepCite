"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  ChevronDown,
  Quote,
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Layers,
} from "lucide-react";
import type { FinalReport as ReportType } from "@backend/types";
import { cn } from "@/lib/utils";

interface FinalReportViewProps {
  report: ReportType;
  query: string;
}

function ConfidenceBadge({ score, label }: { score: number; label: string }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? "text-green-600 dark:text-green-400 bg-green-500/10"
    : pct >= 60 ? "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10"
    : "text-red-600 dark:text-red-400 bg-red-500/10";

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", color)}>
      <div className={cn("h-1.5 w-1.5 rounded-full", pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500")} />
      {label}: {pct}%
    </div>
  );
}

function CitationCard({ citation, index }: { citation: ReportType["citations"][number]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border/60 bg-card/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{citation.title}</p>
          <p className="text-xs text-muted-foreground truncate">{citation.source}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/40"
          >
            <div className="p-3 space-y-2">
              <div className="flex items-start gap-2">
                <Quote className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground italic">{citation.snippet}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Relevance: {Math.round(citation.relevance * 100)}%
                </span>
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Visit source
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FinalReportView({ report, query }: FinalReportViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span>Research Report</span>
          <span className="text-border">·</span>
          <span className="font-mono">{query}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Synthesized Research Report</h2>
      </div>

      {/* Confidence Badges */}
      <div className="flex flex-wrap gap-2">
        <ConfidenceBadge score={report.confidence} label="Overall Confidence" />
        <ConfidenceBadge score={report.selfCritique.faithfulnessScore} label="Faithfulness" />
        <ConfidenceBadge score={report.selfCritique.corpusCoverage} label="Corpus Coverage" />
        <ConfidenceBadge score={1 - report.selfCritique.hallucinationRate} label="Veracity" />
      </div>

      {/* Instant Definition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent p-6"
      >
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Instant Definition</span>
          </div>
          <p className="text-base leading-relaxed text-foreground/90">{report.instantDefinition}</p>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Executive Summary</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">{report.executiveSummary}</p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {report.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              {section.heading}
            </h3>
            <div className="space-y-3">
              {section.body.split("\n").filter(Boolean).map((para, j) => (
                <p key={j} className="text-sm leading-relaxed text-foreground/80">{para}</p>
              ))}
            </div>
            {section.citations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {section.citations.map((c, k) => (
                  <a
                    key={k}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-secondary/30 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    {c.source}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Citations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Quote className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Verified Citations ({report.citations.length})</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {report.citations.map((c, i) => (
            <CitationCard key={i} citation={c} index={i} />
          ))}
        </div>
      </div>

      {/* Self-Critique Summary */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Self-Critique Metrics</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border/60 bg-secondary/20 p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(report.selfCritique.faithfulnessScore * 100).toFixed(0)}%
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Faithfulness</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-secondary/20 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(report.selfCritique.corpusCoverage * 100).toFixed(0)}%
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Corpus Coverage</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-secondary/20 p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(report.selfCritique.hallucinationRate * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Hallucination Rate</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-secondary/20 p-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {report.citations.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Citations</p>
          </div>
        </div>

        {report.selfCritique.biasFlags.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              Bias Flags
            </div>
            {report.selfCritique.biasFlags.map((flag, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-5">{flag}</p>
            ))}
          </div>
        )}

        {report.selfCritique.gaps.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              Identified Gaps
            </div>
            {report.selfCritique.gaps.map((gap, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-5">{gap}</p>
            ))}
          </div>
        )}

        <div className="rounded-lg bg-secondary/30 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Critic Notes
          </div>
          <p className="text-xs text-muted-foreground">{report.selfCritique.notes}</p>
        </div>
      </div>
    </motion.div>
  );
}
