// ================================================================
// PASSOFF Type Definitions
// Framework-agnostic typed briefing protocol
// ================================================================

// --- Passoff Briefing (PB) Schema ---

export interface Decision {
  rationale: string;
  constraint: string;
  confidence: number; // 0.0 - 1.0
}

export interface Artifact {
  id: string;
  type: "code" | "data" | "document" | "url" | "schema";
  content: string;
  summary: string;
}

export interface PassoffBriefing {
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

// --- Passoff Score (PS) ---

export interface PassoffScoreAxes {
  completeness: number; // 0-25
  relevance: number; // 0-25
  compression: number; // 0-25
  fidelity: number; // 0-25
}

export interface PassoffScore {
  total: number; // 0-100
  axes: PassoffScoreAxes;
}

// --- Judge Rubric ---

export interface JudgeScores {
  constraintAdherence: number; // 0-10
  goalCompletion: number; // 0-10
  artifactFidelity: number; // 0-10
  total: number; // 0-30, normalized to 0-100 for display
}

// --- Agent Trace ---

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  taskSummary: string;
  status: "completed" | "failed" | "running";
}

export interface HandoffEdge {
  id: string;
  from: string; // agent node id
  to: string; // agent node id
  rawContext: string;
  tokenCount: number;
  passoffBriefing?: PassoffBriefing;
  passoffScore?: PassoffScore;
}

export interface AgentTrace {
  id: string;
  name: string;
  description: string;
  mastFailureMode: string;
  mastPercentage: string;
  mastCategory: string;
  nodes: AgentNode[];
  edges: HandoffEdge[];
}

// --- Scenario ---

export type ScenarioId = "code-review" | "customer-support" | "research-summarizer";

export interface GroundTruthDecision {
  constraint: string;
  present: boolean;
}

export interface PreCommittedOutput {
  rawOutput: string;
  pbOutput: string;
  rawJudgeScores: JudgeScores;
  pbJudgeScores: JudgeScores;
}

export interface Scenario {
  id: ScenarioId;
  trace: AgentTrace;
  groundTruthDecisions: GroundTruthDecision[];
  preCommittedOutputs: PreCommittedOutput;
}

// --- Replay ---

export interface ReplayResult {
  output: string;
  judgeScores: JudgeScores;
  isPreCommitted: boolean;
}

// --- Playground ---

export type PlaygroundMode = "raw" | "passoff" | "ab";

export interface PipelineRun {
  topic: string;
  mode: PlaygroundMode;
  researcherOutput: string;
  writerOutputRaw?: string;
  writerOutputPB?: string;
  passoffBriefing?: PassoffBriefing;
  rawScore?: PassoffScore;
  pbScore?: PassoffScore;
  rawJudgeScores?: JudgeScores;
  pbJudgeScores?: JudgeScores;
}

export interface JudgeResult {
  rawScores: JudgeScores;
  pbScores: JudgeScores;
}

// --- Diff ---

export interface HandoffDiff {
  rawTokenCount: number;
  pbTokenCount: number;
  compressionRatio: number;
  droppedConstraints: string[];
  preservedConstraints: string[];
}

// --- Agent Session (for SDK) ---

export interface AgentMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AgentSession {
  agentId: string;
  agentRole: string;
  messages: AgentMessage[];
  metadata?: Record<string, unknown>;
}
