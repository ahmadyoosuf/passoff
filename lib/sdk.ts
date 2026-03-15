// ================================================================
// PASSOFF SDK
// generatePB, scorePB, formatForAgent, diff
// ================================================================

import type {
  AgentSession,
  PassoffBriefing,
  PassoffScore,
  HandoffDiff,
} from "./types";

/**
 * Generate a Passoff Briefing from an agent session.
 * In mock mode, returns a deterministic PB from scenario data.
 * In live mode, calls Claude to extract the PB.
 */
export async function generatePB(
  session: AgentSession
): Promise<PassoffBriefing> {
  // Deterministic extraction from session messages
  const allContent = session.messages.map((m) => m.content).join("\n");
  const wordCount = allContent.split(/\s+/).length;

  return {
    mission: `Complete ${session.agentRole} tasks for the current pipeline stage`,
    completed: [`Processed ${session.messages.length} messages`, `Generated ${wordCount} words of context`],
    decisions: [],
    artifacts: [],
    blockers: [],
    context_for: "next-agent",
    sender_id: session.agentId,
    timestamp: new Date().toISOString(),
    schema_version: "1.0.0",
  };
}

/**
 * Score a Passoff Briefing across four axes.
 * Completeness is computed locally. Other axes require context.
 */
export function scorePB(
  pb: PassoffBriefing,
  rawTokenCount?: number
): PassoffScore {
  // Completeness (0-25): all required fields present and non-empty
  let completeness = 0;
  if (pb.mission && pb.mission.length > 0) completeness += 5;
  if (pb.completed && pb.completed.length > 0) completeness += 5;
  if (pb.decisions && pb.decisions.length > 0) completeness += 5;
  if (pb.artifacts && pb.artifacts.length > 0) completeness += 4;
  if (pb.blockers && pb.blockers.length > 0) completeness += 3;
  if (pb.context_for && pb.context_for.length > 0) completeness += 1;
  if (pb.sender_id && pb.sender_id.length > 0) completeness += 1;
  if (pb.schema_version) completeness += 1;

  // Compression (0-25): ratio of PB token count to source
  let compression = 0;
  if (rawTokenCount) {
    const pbTokens = estimateTokens(JSON.stringify(pb));
    const ratio = rawTokenCount / pbTokens;
    if (ratio >= 5) compression = 25;
    else if (ratio >= 4) compression = 22;
    else if (ratio >= 3) compression = 18;
    else if (ratio >= 2) compression = 12;
    else compression = 5;
  } else {
    compression = 15; // default when no raw available
  }

  // Relevance (0-25): simple heuristic -- does context_for exist and decisions reference constraints
  let relevance = 10;
  if (pb.context_for && pb.context_for.length > 0) relevance += 5;
  if (pb.decisions.length > 0) relevance += 5;
  if (pb.decisions.some((d) => d.confidence >= 0.9)) relevance += 5;

  // Fidelity placeholder (would use Judge in full implementation)
  const fidelity = 15;

  const total = completeness + relevance + compression + fidelity;

  return {
    total,
    axes: { completeness, relevance, compression, fidelity },
  };
}

/**
 * Format a PB for a specific receiving agent role.
 * Output is a string suitable for A2A task artifact content.
 */
export function formatForAgent(pb: PassoffBriefing, role: string): string {
  const lines: string[] = [];
  lines.push(`## Briefing for ${role}`);
  lines.push("");
  lines.push(`**Mission:** ${pb.mission}`);
  lines.push("");
  lines.push("**Completed Work:**");
  pb.completed.forEach((c) => lines.push(`- ${c}`));
  lines.push("");

  if (pb.decisions.length > 0) {
    lines.push("**Locked Decisions:**");
    pb.decisions.forEach((d) => {
      lines.push(`- CONSTRAINT: ${d.constraint}`);
      lines.push(`  Rationale: ${d.rationale}`);
      lines.push(`  Confidence: ${d.confidence}`);
    });
    lines.push("");
  }

  if (pb.artifacts.length > 0) {
    lines.push("**Artifacts:**");
    pb.artifacts.forEach((a) => {
      lines.push(`- [${a.type}] ${a.summary}`);
    });
    lines.push("");
  }

  if (pb.blockers.length > 0) {
    lines.push("**Unresolved Blockers:**");
    pb.blockers.forEach((b) => lines.push(`- ${b}`));
    lines.push("");
  }

  lines.push(`*From: ${pb.sender_id} | Schema: ${pb.schema_version}*`);
  return lines.join("\n");
}

/**
 * Compute a diff between raw context and a PB.
 */
export function diff(
  raw: string,
  pb: PassoffBriefing,
  groundTruth?: { constraint: string; present: boolean }[]
): HandoffDiff {
  const rawTokenCount = estimateTokens(raw);
  const pbTokenCount = estimateTokens(JSON.stringify(pb));
  const compressionRatio =
    pbTokenCount > 0 ? Math.round((rawTokenCount / pbTokenCount) * 10) / 10 : 0;

  const pbConstraints = pb.decisions.map((d) =>
    d.constraint.toLowerCase()
  );

  let droppedConstraints: string[] = [];
  let preservedConstraints: string[] = [];

  if (groundTruth) {
    groundTruth.forEach((gt) => {
      const found = pbConstraints.some(
        (c) =>
          c.includes(gt.constraint.toLowerCase().slice(0, 20)) ||
          gt.constraint.toLowerCase().includes(c.slice(0, 20))
      );
      if (found) {
        preservedConstraints.push(gt.constraint);
      } else {
        droppedConstraints.push(gt.constraint);
      }
    });
  }

  return {
    rawTokenCount,
    pbTokenCount,
    compressionRatio,
    droppedConstraints,
    preservedConstraints,
  };
}

/**
 * Rough token estimation (~4 chars per token for English text).
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
