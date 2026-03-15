"use client";

import { cn } from "@/lib/utils";
import { getScoreLabel } from "@/lib/rubric";
import type { PassoffScore } from "@/lib/types";

interface ScoreBarsProps {
  score: PassoffScore;
}

const AXIS_LABELS: { key: keyof PassoffScore["axes"]; label: string; max: number }[] = [
  { key: "completeness", label: "Completeness", max: 25 },
  { key: "relevance", label: "Relevance", max: 25 },
  { key: "compression", label: "Compression", max: 25 },
  { key: "fidelity", label: "Fidelity", max: 25 },
];

export default function ScoreBars({ score }: ScoreBarsProps) {
  const scoreLabel = getScoreLabel(score.total);

  const colorMap = {
    green: "bg-score-green",
    yellow: "bg-score-yellow",
    red: "bg-score-red",
  };

  const textColorMap = {
    green: "text-score-green",
    yellow: "text-score-yellow",
    red: "text-score-red",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-semibold text-foreground">
          PASSOFF Score
        </span>
        <span
          className={cn(
            "font-mono text-2xl font-bold",
            textColorMap[scoreLabel]
          )}
        >
          {score.total}
        </span>
      </div>
      <div className="space-y-3">
        {AXIS_LABELS.map(({ key, label, max }) => {
          const value = score.axes[key];
          const pct = (value / max) * 100;
          const axisLabel = getScoreLabel((value / max) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground font-sans">
                  {label}
                </span>
                <span className="font-mono text-xs text-foreground">
                  {value}/{max}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    colorMap[axisLabel]
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
