"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Target,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { CritiqueResult } from "@backend/types";
import { cn } from "@/lib/utils";

interface EvaluationDashboardProps {
  critique: CritiqueResult;
  confidence: number;
  citationCount: number;
}

function MetricRing({
  value,
  label,
  icon: Icon,
  color,
  delay,
}: {
  value: number;
  label: string;
  icon: typeof ShieldCheck;
  color: string;
  delay: number;
}) {
  const pct = Math.round(value * 100);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5"
    >
      <div className="relative h-28 w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="6"
            className="stroke-muted/30"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
            style={{ stroke: `hsl(var(--${color}))` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-5 w-5 mb-0.5" style={{ color: `hsl(var(--${color}))` }} />
          <span className="text-xl font-bold">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold">{label}</p>
      </div>
    </motion.div>
  );
}

export function EvaluationDashboard({ critique, confidence, citationCount }: EvaluationDashboardProps) {
  const metrics = [
    {
      value: critique.faithfulnessScore,
      label: "Faithfulness Score",
      icon: Target,
      color: "chart-1",
      delay: 0,
    },
    {
      value: critique.corpusCoverage,
      label: "Corpus Coverage",
      icon: Eye,
      color: "chart-2",
      delay: 0.1,
    },
    {
      value: 1 - critique.hallucinationRate,
      label: "Veracity (1 - Hallucination)",
      icon: ShieldCheck,
      color: "chart-3",
      delay: 0.2,
    },
    {
      value: confidence,
      label: "Overall Confidence",
      icon: TrendingUp,
      color: "chart-4",
      delay: 0.3,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Evaluation Dashboard</h2>
      </div>

      {/* Metric Rings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <MetricRing key={m.label} {...m} />
        ))}
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Target className="h-3 w-3" />
            Faithfulness
          </div>
          <p className="text-lg font-bold">{(critique.faithfulnessScore * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Eye className="h-3 w-3" />
            Coverage
          </div>
          <p className="text-lg font-bold">{(critique.corpusCoverage * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <AlertTriangle className="h-3 w-3" />
            Hallucination
          </div>
          <p className={cn("text-lg font-bold", critique.hallucinationRate < 0.05 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400")}>
            {(critique.hallucinationRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <CheckCircle2 className="h-3 w-3" />
            Citations
          </div>
          <p className="text-lg font-bold">{citationCount}</p>
        </div>
      </div>

      {/* Bias Flags & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-sm font-semibold">Bias Flags ({critique.biasFlags.length})</h3>
          </div>
          {critique.biasFlags.length > 0 ? (
            <ul className="space-y-1.5">
              {critique.biasFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1 w-1 rounded-full bg-yellow-500 shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No bias flags detected.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-semibold">Identified Gaps ({critique.gaps.length})</h3>
          </div>
          {critique.gaps.length > 0 ? (
            <ul className="space-y-1.5">
              {critique.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1 w-1 rounded-full bg-orange-500 shrink-0" />
                  {gap}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No significant gaps identified.</p>
          )}
        </div>
      </div>

      {/* Critic Notes */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Critic Assessment</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{critique.notes}</p>
      </div>
    </motion.div>
  );
}
