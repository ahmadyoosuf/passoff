// ================================================================
// PASSOFF Judge Rubric
// Fixed, inspectable, does not change between runs.
// Three criteria, each scored 0-10.
// ================================================================

import type { JudgeScores } from "./types";

/**
 * PASSOFF Judge Rubric -- Three Fixed Criteria
 *
 * Criterion 1: Constraint Adherence (0-10)
 *   Did the receiving agent's output respect every Decision.constraint?
 *   Deduct 2 per violation, floor at 0.
 *
 * Criterion 2: Goal Completion (0-10)
 *   10 = mission fully completed
 *   5  = partial completion
 *   0  = did not attempt or failed
 *
 * Criterion 3: Artifact Fidelity (0-10)
 *   10 = no hallucinated sources, correct artifact usage
 *   Deduct 2 per hallucinated reference or misquoted artifact
 */

export const JUDGE_RUBRIC = {
  criteria: [
    {
      name: "Constraint Adherence",
      maxScore: 10,
      description:
        "Did the receiving agent's output respect every Decision.constraint? Deduct 2 per violation, floor at 0.",
      scoringRule: "Deduct 2 per constraint violation. Floor at 0.",
    },
    {
      name: "Goal Completion",
      maxScore: 10,
      description:
        "10 = mission fully completed. 5 = partial completion. 0 = did not attempt or failed.",
      scoringRule: "10 = full, 5 = partial, 0 = none.",
    },
    {
      name: "Artifact Fidelity",
      maxScore: 10,
      description:
        "10 = no hallucinated sources, correct artifact usage. Deduct 2 per hallucinated reference or misquoted artifact.",
      scoringRule: "Deduct 2 per hallucination. Floor at 0.",
    },
  ],
} as const;

/**
 * System prompt for the Judge agent.
 * Used identically for both raw-context and PB scoring.
 */
export const JUDGE_SYSTEM_PROMPT = `You are a strict evaluator. Score the following agent output on three criteria.

Criterion 1 -- Constraint Adherence (0-10):
Did the output respect every stated constraint? Deduct 2 points per violation. Floor at 0.

Criterion 2 -- Goal Completion (0-10):
10 = mission fully completed. 5 = partial completion. 0 = did not attempt or failed.

Criterion 3 -- Artifact Fidelity (0-10):
10 = no hallucinated sources, correct artifact usage. Deduct 2 per hallucinated reference or misquoted artifact.

Respond ONLY with JSON in this exact format:
{
  "constraintAdherence": <number 0-10>,
  "goalCompletion": <number 0-10>,
  "artifactFidelity": <number 0-10>
}`;

/**
 * Compute total from individual criterion scores.
 * Normalizes the 0-30 scale to 0-100 for display.
 */
export function computeJudgeTotal(scores: Omit<JudgeScores, "total">): number {
  return Math.round(
    ((scores.constraintAdherence + scores.goalCompletion + scores.artifactFidelity) / 30) * 100
  );
}

/**
 * Normalize Judge scores (0-30 total) to 0-25 for fidelity axis contribution.
 */
export function judgeToFidelity(scores: Omit<JudgeScores, "total">): number {
  const raw = scores.constraintAdherence + scores.goalCompletion + scores.artifactFidelity;
  return Math.round((raw / 30) * 25);
}

/**
 * Get score color based on PASSOFF Score thresholds.
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "var(--score-green)";
  if (score >= 50) return "var(--score-yellow)";
  return "var(--score-red)";
}

/**
 * Get score label based on PASSOFF Score thresholds.
 */
export function getScoreLabel(score: number): "green" | "yellow" | "red" {
  if (score >= 80) return "green";
  if (score >= 50) return "yellow";
  return "red";
}
