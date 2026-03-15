// ================================================================
// Unified API Object -- mock/live switch
// PASSOFF_MODE env var: "mock" (default) | "live"
// ================================================================

import type {
  ScenarioId,
  AgentTrace,
  PassoffBriefing,
  PassoffScore,
  ReplayResult,
  PipelineRun,
  JudgeResult,
  PlaygroundMode,
} from "./types";
import { scenarios } from "./scenarios";
import { scorePB, diff } from "./sdk";
import { computeJudgeTotal } from "./rubric";

const randomFetchDelay = () => 1000 + Math.random() * 2000;
const randomMutationDelay = () => 3000 + Math.random() * 2000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const api = {
  studio: {
    async loadScenario(id: ScenarioId): Promise<AgentTrace> {
      await delay(randomFetchDelay());
      const scenario = scenarios[id];
      if (!scenario) throw new Error(`Unknown scenario: ${id}`);
      return scenario.trace;
    },

    async getScenario(id: ScenarioId) {
      await delay(randomFetchDelay());
      const scenario = scenarios[id];
      if (!scenario) throw new Error(`Unknown scenario: ${id}`);
      return scenario;
    },

    async generatePB(
      edgeId: string,
      scenarioId: ScenarioId
    ): Promise<PassoffBriefing | null> {
      await delay(randomFetchDelay());
      const scenario = scenarios[scenarioId];
      const edge = scenario.trace.edges.find((e) => e.id === edgeId);
      return edge?.passoffBriefing ?? null;
    },

    async scorePB(
      pb: PassoffBriefing,
      rawTokenCount: number
    ): Promise<PassoffScore> {
      await delay(randomFetchDelay());
      return scorePB(pb, rawTokenCount);
    },

    async runReplay(
      mode: "raw" | "pb",
      scenarioId: ScenarioId,
      edgeId: string
    ): Promise<ReplayResult> {
      await delay(randomMutationDelay());
      const scenario = scenarios[scenarioId];
      const outputs = scenario.preCommittedOutputs;

      if (mode === "raw") {
        return {
          output: outputs.rawOutput,
          judgeScores: outputs.rawJudgeScores,
          isPreCommitted: true,
        };
      }
      return {
        output: outputs.pbOutput,
        judgeScores: outputs.pbJudgeScores,
        isPreCommitted: true,
      };
    },

    async getDiff(scenarioId: ScenarioId, edgeId: string) {
      await delay(randomFetchDelay());
      const scenario = scenarios[scenarioId];
      const edge = scenario.trace.edges.find((e) => e.id === edgeId);
      if (!edge || !edge.passoffBriefing) return null;
      return diff(
        edge.rawContext,
        edge.passoffBriefing,
        scenario.groundTruthDecisions
      );
    },
  },

  playground: {
    async runPipeline(
      topic: string,
      mode: PlaygroundMode
    ): Promise<PipelineRun> {
      await delay(randomMutationDelay());

      // Mock pipeline using pre-committed scenario C as template
      const scenario = scenarios["research-summarizer"];
      const outputs = scenario.preCommittedOutputs;

      const run: PipelineRun = {
        topic,
        mode,
        researcherOutput: `Research completed on: ${topic}\n\nKey findings gathered from peer-reviewed sources. Three relevant papers identified covering the topic from multiple perspectives. Constraints established for the writing phase.`,
        passoffBriefing: scenario.trace.edges[0].passoffBriefing,
      };

      if (mode === "raw" || mode === "ab") {
        run.writerOutputRaw = outputs.rawOutput;
        run.rawJudgeScores = outputs.rawJudgeScores;
      }

      if (mode === "passoff" || mode === "ab") {
        run.writerOutputPB = outputs.pbOutput;
        run.pbJudgeScores = outputs.pbJudgeScores;
      }

      return run;
    },

    async judgeOutputs(
      rawOutput: string,
      pbOutput: string
    ): Promise<JudgeResult> {
      await delay(randomMutationDelay());

      // Use pre-committed scores for mock
      const scenario = scenarios["research-summarizer"];
      return {
        rawScores: scenario.preCommittedOutputs.rawJudgeScores,
        pbScores: scenario.preCommittedOutputs.pbJudgeScores,
      };
    },
  },
};
