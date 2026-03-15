"use client";

import CodeBlock from "./code-block";

const TYPE_DEFS = `// Core Types
interface Decision {
  rationale: string;
  constraint: string;
  confidence: number; // 0.0 - 1.0
}

interface Artifact {
  id: string;
  type: "code" | "data" | "document" | "url" | "schema";
  content: string;
  summary: string;
}

interface PassoffBriefing {
  mission: string;
  completed: string[];
  decisions: Decision[];
  artifacts: Artifact[];
  blockers: string[];
  context_for: string;
  sender_id: string;
  timestamp: string; // ISO8601
  schema_version: string; // semver
}

interface PassoffScore {
  total: number; // 0-100
  axes: {
    completeness: number; // 0-25
    relevance: number;    // 0-25
    compression: number;  // 0-25
    fidelity: number;     // 0-25
  };
}`;

const GENERATE_PB = `import { generatePB } from "passoff/sdk";

const session: AgentSession = {
  agentId: "planner-001",
  agentRole: "Architecture Planner",
  messages: [
    { role: "system", content: "You are an architecture planner..." },
    { role: "user", content: "Design the auth system..." },
    { role: "assistant", content: "I'll use JWT with RS256..." },
  ],
};

const briefing = await generatePB(session);
// Returns a typed PassoffBriefing with extracted decisions,
// artifacts, and blockers`;

const SCORE_PB = `import { scorePB } from "passoff/sdk";

const score = scorePB(briefing, rawTokenCount);
// Returns: {
//   total: 84,
//   axes: {
//     completeness: 23,  // all required fields present
//     relevance: 22,     // content addresses receiver's needs
//     compression: 21,   // 4.7:1 token reduction
//     fidelity: 18,      // receiver performs better with PB
//   }
// }`;

const FORMAT_FOR_AGENT = `import { formatForAgent } from "passoff/sdk";

const formatted = formatForAgent(briefing, "Code Reviewer");
// Returns a Markdown string suitable for passing to the
// receiving agent. This string can be used as:
// - A2A task artifact content
// - ADK agent input
// - OpenAI Agents SDK input_filter output`;

const DIFF_EXAMPLE = `import { diff } from "passoff/sdk";

const result = diff(rawContext, briefing);
// Returns: {
//   rawTokenCount: 4200,
//   pbTokenCount: 890,
//   compressionRatio: 4.7,
//   droppedConstraints: [],
//   preservedConstraints: ["REST-only", "RS256", "Rate limiting"],
// }`;

const A2A_EXAMPLE = `// A2A Compatibility
// The formatForAgent output can be passed as the content
// field of an A2A task artifact.

import { formatForAgent } from "passoff/sdk";

const a2aArtifact = {
  name: "passoff-briefing",
  parts: [
    {
      type: "text",
      text: formatForAgent(briefing, receiverRole),
    },
  ],
};

// Send via A2A task/send endpoint
await fetch(agentUrl + "/tasks/send", {
  method: "POST",
  body: JSON.stringify({
    id: taskId,
    message: {
      role: "user",
      parts: a2aArtifact.parts,
    },
  }),
});`;

const ADK_EXAMPLE = `// Google ADK Compatibility
// generatePB can be used as the transformation function
// inside an ADK context pipeline.

import { generatePB, formatForAgent } from "passoff/sdk";

const reviewerAgent = new Agent({
  name: "reviewer",
  model: "gemini-2.0-flash",
  instruction: "You are a code reviewer...",
  // Use PASSOFF as the context transformer
  input_schema: PassoffBriefingSchema,
});

// In the orchestrator:
const session = captureAgentSession(coderAgent);
const briefing = await generatePB(session);
const input = formatForAgent(briefing, "Code Reviewer");

// Pass to ADK agent
const result = await reviewerAgent.run(input);`;

const OPENAI_EXAMPLE = `// OpenAI Agents SDK Compatibility
// The formatForAgent output can be used as the value
// passed to an input_filter.

import { formatForAgent, generatePB } from "passoff/sdk";

const reviewerAgent = new Agent({
  name: "reviewer",
  model: "gpt-4o",
  instructions: "You are a code reviewer...",
  input_filter: async (inputData) => {
    // Extract session from handoff history
    const session = extractSession(inputData.history);
    const briefing = await generatePB(session);
    const formatted = formatForAgent(briefing, "reviewer");

    return {
      ...inputData,
      history: [
        { role: "user", content: formatted },
      ],
    };
  },
});`;

export default function SDKReference() {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
      <div>
        <h1 className="font-sans text-xl font-semibold text-foreground text-balance">
          SDK Reference
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          TypeScript API for generating, scoring, and formatting PASSOFF Briefings. Framework-agnostic -- works with any agent orchestration system.
        </p>
      </div>

      {/* Type definitions */}
      <section className="space-y-3">
        <h2 className="font-sans text-base font-semibold text-foreground">Type Definitions</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The core types define the PASSOFF Briefing schema. Every field maps to a documented MAST failure mode (arXiv:2503.13657).
        </p>
        <CodeBlock code={TYPE_DEFS} title="lib/types.ts" />
      </section>

      {/* API Functions */}
      <section className="space-y-6">
        <h2 className="font-sans text-base font-semibold text-foreground">API Functions</h2>

        <div className="space-y-3">
          <h3 className="font-mono text-sm text-foreground">
            generatePB(session: AgentSession): Promise{"<PassoffBriefing>"}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Extracts a typed PASSOFF Briefing from an agent session. Identifies the mission, completed work, locked decisions with rationale, produced artifacts, and unresolved blockers.
          </p>
          <CodeBlock code={GENERATE_PB} title="Generate a Briefing" />
        </div>

        <div className="space-y-3">
          <h3 className="font-mono text-sm text-foreground">
            scorePB(pb: PassoffBriefing, session?: AgentSession): PassoffScore
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Computes a 0-100 quality score across four axes: Completeness (are all fields populated?), Relevance (does content address the receiver?), Compression (token reduction ratio), and Fidelity (does the receiver perform better?).
          </p>
          <CodeBlock code={SCORE_PB} title="Score a Briefing" />
        </div>

        <div className="space-y-3">
          <h3 className="font-mono text-sm text-foreground">
            formatForAgent(pb: PassoffBriefing, role: string): string
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Formats a PB as a Markdown string addressed to a specific receiving agent role. The output is compatible with A2A task artifacts, ADK agent inputs, and OpenAI Agents SDK input filters.
          </p>
          <CodeBlock code={FORMAT_FOR_AGENT} title="Format for Agent" />
        </div>

        <div className="space-y-3">
          <h3 className="font-mono text-sm text-foreground">
            diff(raw: string, pb: PassoffBriefing): HandoffDiff
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Computes token counts, compression ratio, and constraint preservation between raw context and a PASSOFF Briefing.
          </p>
          <CodeBlock code={DIFF_EXAMPLE} title="Diff raw vs. PB" />
        </div>
      </section>

      {/* Framework compatibility */}
      <section className="space-y-6">
        <h2 className="font-sans text-base font-semibold text-foreground">Framework Compatibility</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          PASSOFF composes with existing frameworks. It is not a replacement for any of them. It fills the gap none of them fill: a quality score for the content of a handoff.
        </p>

        <div className="space-y-3">
          <h3 className="font-sans text-sm font-semibold text-foreground">A2A (Agent2Agent Protocol)</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A2A defines the transport envelope. PASSOFF defines what goes inside. The formatForAgent output can be passed directly as an A2A task artifact content field.
          </p>
          <CodeBlock code={A2A_EXAMPLE} title="A2A Integration" />
        </div>

        <div className="space-y-3">
          <h3 className="font-sans text-sm font-semibold text-foreground">Google ADK (Agent Development Kit)</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ADK has handoff semantics including include_contents and narrative casting, but no quality score. generatePB can serve as the transformation function in an ADK context pipeline. The PB output is valid for ADK input_schema if the agent accepts a PB as input.
          </p>
          <CodeBlock code={ADK_EXAMPLE} title="ADK Integration" />
        </div>

        <div className="space-y-3">
          <h3 className="font-sans text-sm font-semibold text-foreground">OpenAI Agents SDK</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Agents SDK has input_filter for transforming HandoffInputData. PASSOFF provides the semantic content -- the SDK provides the plumbing. Use formatForAgent as the value passed to an input_filter.
          </p>
          <CodeBlock code={OPENAI_EXAMPLE} title="OpenAI Agents SDK Integration" />
        </div>
      </section>

      {/* Judge Rubric */}
      <section className="space-y-3">
        <h2 className="font-sans text-base font-semibold text-foreground">Judge Rubric</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The PASSOFF Judge uses three fixed criteria, each scored 0-10. The rubric is identical for raw-context and PB scoring -- the only variable is what the receiving agent was given. The rubric ships in lib/rubric.ts and is fully inspectable.
        </p>
        <div className="rounded-lg border border-border/30 bg-card p-4 space-y-4">
          <div>
            <h4 className="font-mono text-sm font-semibold text-foreground">Criterion 1: Constraint Adherence (0-10)</h4>
            <p className="text-xs text-muted-foreground mt-1">Did the receiving agent's output respect every Decision.constraint? Deduct 2 per violation, floor at 0.</p>
          </div>
          <div>
            <h4 className="font-mono text-sm font-semibold text-foreground">Criterion 2: Goal Completion (0-10)</h4>
            <p className="text-xs text-muted-foreground mt-1">10 = mission fully completed. 5 = partial completion. 0 = did not attempt or failed.</p>
          </div>
          <div>
            <h4 className="font-mono text-sm font-semibold text-foreground">Criterion 3: Artifact Fidelity (0-10)</h4>
            <p className="text-xs text-muted-foreground mt-1">10 = no hallucinated sources, correct artifact usage. Deduct 2 per hallucinated reference or misquoted artifact.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
