# DeepCite

**Multi-Agent Research Harness with Citation & Self-Critique**

DeepCite is a production-grade AI research system that uses four specialized agents — Planner, Researcher, Critic, and Synthesizer — working in sequence to deliver exhaustive, citation-backed research reports with self-critique metrics.

---

## Architecture

```
User Question
     │
     ▼
┌──────────┐     ┌────────────┐     ┌─────────┐     ┌──────────────┐
│ Planner  │ ──▶ │ Researcher │ ──▶ │ Critic  │ ──▶ │ Synthesizer  │
│          │     │            │     │         │     │              │
│ Breaks   │     │ Extracts   │     │ Audits  │     │ Produces     │
 │ question │     │ sources &  │     │ bias,   │     │ final report │
│ into     │     │ citations  │     │ gaps,   │     │ with instant │
│ sub-Qs   │     │            │     │ halluc. │     │ definition   │
└──────────┘     └────────────┘     └─────────┘     └──────────────┘
```

### Agents

| Agent | Role |
|-------|------|
| **Planner** | Deconstructs the research question into 3–4 precise sub-questions |
| **Researcher** | Extracts verified literature payloads, web snippets, and source references |
| **Critic** | Audits findings for bias, gaps, and hallucination rates (targeting 0.0%) |
| **Synthesizer** | Produces an instant definition, executive summary, structured report, and self-critique metrics |

### Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **AI:** Google Gemini API (`@google/genai`, `gemini-2.5-flash`)
- **Styling:** Tailwind CSS + Lucide Icons + Framer Motion
- **Orchestration:** Custom LangGraph-style state pipeline with SSE streaming
- **Deployment:** Vercel-ready

---

## Setup

### 1. Get a Google AI Studio API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your key:

```
GEMINI_API_KEY=AIzaSy...your_key...
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the environment variable `GEMINI_API_KEY` in the Vercel dashboard
4. Deploy

---

## Project Structure

```
DeepCite/
├── .env.local.example
├── .gitignore
├── README.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       └── research/
│           └── route.ts        # SSE endpoint
├── src/
│   └── backend/
│       ├── agents.ts           # 4 specialized AI agents
│       ├── graph.ts            # Pipeline orchestration
│       └── types.ts            # Shared TypeScript types
└── components/
    ├── Navbar.tsx
    ├── LiveWorkspace.tsx
    ├── FinalReportView.tsx
    ├── EvaluationDashboard.tsx
    └── ThemeProvider.tsx
```

---

## Features

- **Real-time Agent Pipeline:** Watch each agent start, run, and complete with live status indicators
- **Shared Memory Terminal:** A live log of every agent action, streamed via Server-Sent Events
- **Instant Definition:** A concise overview appears at the top of every report
- **Verified Citations:** Expandable citation cards with source links and relevance scores
- **Self-Critique Metrics:** Faithfulness score, corpus coverage, and hallucination rate
- **Evaluation Dashboard:** Interactive metric rings and bias/gap analysis
- **Dark & Light Mode:** Full theme support with smooth transitions
- **Responsive Design:** Optimized for mobile, tablet, and desktop

---

## 2-Minute Investor Pitch

> **"Every AI research tool today has the same problem: hallucination.** You ask a question, you get a confident answer, and half the citations don't exist. DeepCite fixes this with a multi-agent architecture inspired by how real research teams work.
>
> Here's how it works. When a user asks a research question, four specialized AI agents execute in sequence. The **Planner** breaks the question into precise sub-questions. The **Researcher** extracts verified sources with real citations. The **Critic** audits every finding for bias, gaps, and hallucination — targeting a 0% hallucination rate. And the **Synthesizer** produces an exhaustive report with an instant definition at the top, confidence scores, and expandable citations with source links.
>
> The user watches it happen in real time — a live workspace showing each agent handing off to the next, with a shared memory terminal logging every action. When it's done, they get a premium research report and an evaluation dashboard showing faithfulness, corpus coverage, and hallucination metrics.
>
> The market for AI-powered research tools is exploding — from academia to enterprise intelligence to legal analysis. DeepCite's multi-agent approach with built-in self-critique is the foundation for a product that researchers, analysts, and knowledge workers can actually trust. We're building the Perplexity for serious research — where every claim is sourced, every finding is audited, and every report is investor-grade."

---

## License

MIT
