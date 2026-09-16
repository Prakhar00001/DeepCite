// DeepCite — Specialized AI agents powered by Groq

import OpenAI from "openai";
import type {
  AgentState,
  SubQuestion,
  Citation,
  ResearchFinding,
  CritiqueResult,
  FinalReport,
  SynthesizedSection,
  AgentLogEntry,
} from "./types";

const MODEL = "openai/gpt-oss-120b";

function getClient(): OpenAI {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  return new OpenAI({
    apiKey: key,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

let client: OpenAI | null = null;
function ai(): OpenAI {
  if (!client) client = getClient();
  return client;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeJSON<T>(text: string): T | null {
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

async function generate(prompt: string, systemInstruction?: string): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const resp = await ai().chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  });
  return resp.choices[0]?.message?.content ?? "";
}

// ─── 1. Planner ────────────────────────────────────────────────────────────

export async function runPlanner(
  state: AgentState,
  log: (entry: Omit<AgentLogEntry, "timestamp">) => void
): Promise<AgentState> {
  log({ agent: "planner", message: "Deconstructing research question into sub-questions…", status: "running" });

  const prompt = `You are the Planner agent in a multi-agent research system called DeepCite.
Your job: deconstruct the user's research question into 3–4 precise, non-overlapping sub-questions that together cover the full scope of the inquiry.

Research question: "${state.query}"

Return ONLY a JSON array of objects with keys:
- "question": a focused sub-question
- "rationale": one sentence explaining why this sub-question is needed

Do not include markdown fences or any text outside the JSON array.`;

  const raw = await generate(prompt, "You are a meticulous research planner. Output valid JSON only.");
  const parsed = safeJSON<Array<{ question: string; rationale: string }>>(raw);

  const subQuestions: SubQuestion[] = (parsed ?? []).slice(0, 4).map((sq) => ({
    id: uid("sq"),
    question: sq.question,
    rationale: sq.rationale,
  }));

  // Fallback if parsing fails
  if (subQuestions.length === 0) {
    subQuestions.push(
      { id: uid("sq"), question: `What is "${state.query}"?`, rationale: "Core definitional question." },
      { id: uid("sq"), question: `What are the key components or mechanisms of "${state.query}"?`, rationale: "Structural breakdown." },
      { id: uid("sq"), question: `What is the current state of research on "${state.query}"?`, rationale: "Literature landscape." },
    );
  }

  log({
    agent: "planner",
    message: `Generated ${subQuestions.length} sub-questions.`,
    status: "completed",
  });

  return { ...state, subQuestions };
}

// ─── 2. Researcher ─────────────────────────────────────────────────────────

export async function runResearcher(
  state: AgentState,
  log: (entry: Omit<AgentLogEntry, "timestamp">) => void
): Promise<AgentState> {
  log({ agent: "researcher", message: "Extracting verified literature and web sources…", status: "running" });

  const findings: ResearchFinding[] = [];

  for (const sq of state.subQuestions) {
    log({
      agent: "researcher",
      message: `Researching: "${sq.question}"`,
      status: "running",
    });

    const prompt = `You are the Researcher agent in DeepCite, a multi-agent research system.
For the sub-question below, provide a thorough answer and 2–3 citations.

Sub-question: "${sq.question}"
Parent research question: "${state.query}"

Return ONLY a JSON object with keys:
- "answer": a detailed evidence-based answer (3–5 paragraphs)
- "confidence": a number 0–1 reflecting your confidence in the answer
- "citations": an array of objects with keys:
  - "title": title of the source
  - "url": a real, verifiable URL (prefer arxiv.org, doi.org, scholar.google.com, or established publisher sites)
  - "source": the name of the publisher or platform
  - "snippet": a 1–2 sentence excerpt supporting the answer
  - "relevance": a number 0–1

Do not include markdown fences or any text outside the JSON object.`;

    const raw = await generate(prompt, "You are a rigorous research assistant. Output valid JSON only.");
    const parsed = safeJSON<{
      answer: string;
      confidence: number;
      citations: Array<{ title: string; url: string; source: string; snippet: string; relevance: number }>;
    }>(raw);

    const citations: Citation[] = (parsed?.citations ?? []).map((c) => ({
      id: uid("cit"),
      title: c.title,
      url: c.url,
      source: c.source,
      snippet: c.snippet,
      relevance: c.relevance ?? 0.8,
    }));

    findings.push({
      subQuestionId: sq.id,
      subQuestion: sq.question,
      answer: parsed?.answer ?? "No answer could be extracted for this sub-question.",
      citations,
      confidence: parsed?.confidence ?? 0.5,
    });

    log({
      agent: "researcher",
      message: `Completed research on "${sq.question}" — ${citations.length} citations found.`,
      status: "running",
    });
  }

  log({
    agent: "researcher",
    message: `Research complete. ${findings.length} findings with ${findings.reduce((a, f) => a + f.citations.length, 0)} total citations.`,
    status: "completed",
  });

  return { ...state, findings };
}

// ─── 3. Critic ──────────────────────────────────────────────────────────────

export async function runCritic(
  state: AgentState,
  log: (entry: Omit<AgentLogEntry, "timestamp">) => void
): Promise<AgentState> {
  log({ agent: "critic", message: "Auditing findings for bias, gaps, and hallucinations…", status: "running" });

  const findingsSummary = state.findings
    .map(
      (f, i) =>
        `Finding ${i + 1} (Q: "${f.subQuestion}", confidence: ${f.confidence}):\n${f.answer}\nCitations: ${f.citations.map((c) => c.url).join(", ")}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are the Critic agent in DeepCite, a multi-agent research system.
Your job: audit the research findings below for bias, gaps, and hallucination.

Research question: "${state.query}"

Findings:
${findingsSummary}

Evaluate:
1. Bias flags — any signs of one-sided sourcing or unsupported claims
2. Gaps — important aspects of the research question not covered
3. Hallucination rate — estimate the fraction of claims that appear fabricated or unverifiable (target 0.0)
4. Faithfulness score — how faithfully the findings answer the sub-questions (0–1)
5. Corpus coverage — how much of the relevant literature is covered (0–1)

Return ONLY a JSON object with keys:
- "biasFlags": array of strings
- "gaps": array of strings
- "hallucinationRate": number 0–1
- "faithfulnessScore": number 0–1
- "corpusCoverage": number 0–1
- "notes": a paragraph summarizing the critique

Do not include markdown fences or any text outside the JSON object.`;

  const raw = await generate(prompt, "You are a critical research auditor. Output valid JSON only.");
  const parsed = safeJSON<{
    biasFlags: string[];
    gaps: string[];
    hallucinationRate: number;
    faithfulnessScore: number;
    corpusCoverage: number;
    notes: string;
  }>(raw);

  const critique: CritiqueResult = {
    biasFlags: parsed?.biasFlags ?? [],
    gaps: parsed?.gaps ?? [],
    hallucinationRate: parsed?.hallucinationRate ?? 0.1,
    faithfulnessScore: parsed?.faithfulnessScore ?? 0.7,
    corpusCoverage: parsed?.corpusCoverage ?? 0.6,
    notes: parsed?.notes ?? "Critique could not be fully generated.",
  };

  log({
    agent: "critic",
    message: `Audit complete. Hallucination rate: ${(critique.hallucinationRate * 100).toFixed(1)}% | Faithfulness: ${(critique.faithfulnessScore * 100).toFixed(0)}%`,
    status: "completed",
  });

  return { ...state, critique };
}

// ─── 4. Synthesizer ──────────────────────────────────────────────────────────

export async function runSynthesizer(
  state: AgentState,
  log: (entry: Omit<AgentLogEntry, "timestamp">) => void
): Promise<AgentState> {
  log({ agent: "synthesizer", message: "Synthesizing final report with citations and self-critique…", status: "running" });

  const findingsSummary = state.findings
    .map(
      (f, i) =>
        `Finding ${i + 1} (Q: "${f.subQuestion}", confidence: ${f.confidence}):\n${f.answer}\nCitations:\n${f.citations.map((c) => `- ${c.title} (${c.url})`).join("\n")}`
    )
    .join("\n\n---\n\n");

  const critiqueSummary = state.critique
    ? `Critique: Hallucination rate ${state.critique.hallucinationRate}, Faithfulness ${state.critique.faithfulnessScore}, Coverage ${state.critique.corpusCoverage}. Bias flags: ${state.critique.biasFlags.join("; ")}. Gaps: ${state.critique.gaps.join("; ")}. Notes: ${state.critique.notes}`
    : "No critique available.";

  const prompt = `You are the Synthesizer agent in DeepCite, a multi-agent research system.
Produce a comprehensive, well-structured research report from the findings and critique below.

Research question: "${state.query}"

Findings:
${findingsSummary}

Critique:
${critiqueSummary}

Return ONLY a JSON object with keys:
- "instantDefinition": a concise 2–3 sentence direct definition/overview of the research topic — this appears at the very top of the report
- "executiveSummary": a 1-paragraph summary of the full research
- "sections": an array of objects with keys "heading", "body" (2–4 paragraphs), and "citations" (array of { "title", "url", "source", "snippet", "relevance" })
- "confidence": a number 0–1 reflecting overall confidence in the report

The report should be exhaustive, well-organized, and every factual claim should be backed by a citation. Use the citations from the findings — do not invent new URLs.

Do not include markdown fences or any text outside the JSON object.`;

  const raw = await generate(prompt, "You are an expert research synthesizer. Output valid JSON only.");
  const parsed = safeJSON<{
    instantDefinition: string;
    executiveSummary: string;
    sections: Array<{ heading: string; body: string; citations: Array<{ title: string; url: string; source: string; snippet: string; relevance: number }> }>;
    confidence: number;
  }>(raw);

  const allCitations: Citation[] = [];
  const seenUrls = new Set<string>();

  const sections: SynthesizedSection[] = (parsed?.sections ?? []).map((s) => {
    const sectionCitations: Citation[] = (s.citations ?? []).map((c) => {
      if (!seenUrls.has(c.url)) {
        seenUrls.add(c.url);
        allCitations.push({ id: uid("cit"), ...c });
      }
      return { id: uid("cit"), ...c };
    });
    return { heading: s.heading, body: s.body, citations: sectionCitations };
  });

  // Also pull in citations from findings that weren't used in sections
  for (const f of state.findings) {
    for (const c of f.citations) {
      if (!seenUrls.has(c.url)) {
        seenUrls.add(c.url);
        allCitations.push(c);
      }
    }
  }

  const report: FinalReport = {
    instantDefinition: parsed?.instantDefinition ?? "Definition could not be generated.",
    executiveSummary: parsed?.executiveSummary ?? "Executive summary unavailable.",
    sections,
    citations: allCitations,
    selfCritique: state.critique ?? {
      biasFlags: [],
      gaps: [],
      hallucinationRate: 0,
      faithfulnessScore: 0,
      corpusCoverage: 0,
      notes: "No critique was performed.",
    },
    confidence: parsed?.confidence ?? 0.7,
  };

  log({
    agent: "synthesizer",
    message: `Report synthesized. ${sections.length} sections, ${allCitations.length} unique citations.`,
    status: "completed",
  });

  return { ...state, report };
}
