"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getScoreLabel } from "@/lib/rubric";
import type { PipelineRun, JudgeScores } from "@/lib/types";

function ScoreBlock({
  label,
  scores,
  variant,
}: {
  label: string;
  scores: JudgeScores;
  variant: "raw" | "pb";
}) {
  const total = Math.round(
    ((scores.constraintAdherence + scores.goalCompletion + scores.artifactFidelity) / 30) * 100
  );
  const scoreLabel = getScoreLabel(total);
  const textColorMap = {
    green: "text-score-green",
    yellow: "text-score-yellow",
    red: "text-score-red",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        variant === "raw"
          ? "border-score-red/30 bg-score-red/5"
          : "border-score-green/30 bg-score-green/5"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-sm font-semibold text-foreground">{label}</span>
        <span className={cn("font-mono text-xl font-bold", textColorMap[scoreLabel])}>{total}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="font-mono text-lg font-bold text-foreground">{scores.constraintAdherence}</p>
          <p className="text-xs text-muted-foreground">Constraints</p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-foreground">{scores.goalCompletion}</p>
          <p className="text-xs text-muted-foreground">Goal</p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-foreground">{scores.artifactFidelity}</p>
          <p className="text-xs text-muted-foreground">Fidelity</p>
        </div>
      </div>
    </div>
  );
}

export default function OutputCompare({ result }: { result: PipelineRun }) {
  const showRaw = result.mode === "raw" || result.mode === "ab";
  const showPB = result.mode === "passoff" || result.mode === "ab";
  const isAB = result.mode === "ab";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">Agent 2</Badge>
        <span className="text-sm font-sans text-foreground">Writer Output</span>
      </div>

      <div className={cn("grid gap-4", isAB ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
        {showRaw && result.writerOutputRaw && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Raw Context
              <span className="font-mono text-xs text-score-red font-normal">(no PASSOFF)</span>
            </h4>
            <div className="rounded-lg bg-muted/30 border border-border/30 p-4 max-h-64 overflow-y-auto">
              <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {result.writerOutputRaw}
              </pre>
            </div>
            {result.rawJudgeScores && (
              <ScoreBlock label="Raw Score" scores={result.rawJudgeScores} variant="raw" />
            )}
          </div>
        )}

        {showPB && result.writerOutputPB && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              PASSOFF Briefing
              <span className="font-mono text-xs text-score-green font-normal">(with PB)</span>
            </h4>
            <div className="rounded-lg bg-muted/30 border border-border/30 p-4 max-h-64 overflow-y-auto">
              <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {result.writerOutputPB}
              </pre>
            </div>
            {result.pbJudgeScores && (
              <ScoreBlock label="PB Score" scores={result.pbJudgeScores} variant="pb" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
