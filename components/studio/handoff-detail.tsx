"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ScoreBars from "./score-bars";
import { cn } from "@/lib/utils";
import { getScoreLabel } from "@/lib/rubric";
import type {
  HandoffEdge,
  Scenario,
  ReplayResult,
  JudgeScores,
  HandoffDiff,
} from "@/lib/types";
import { api } from "@/lib/api";
import { Play, Info } from "lucide-react";

interface HandoffDetailProps {
  edge: HandoffEdge;
  scenario: Scenario;
}

function TokenCount({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="font-mono text-xs text-foreground">{count.toLocaleString()} tokens</span>
    </div>
  );
}

function JudgeScoreCard({
  label,
  scores,
  variant,
}: {
  label: string;
  scores: JudgeScores;
  variant: "raw" | "pb";
}) {
  const normalizedTotal = Math.round(
    ((scores.constraintAdherence + scores.goalCompletion + scores.artifactFidelity) / 30) * 100
  );
  const scoreLabel = getScoreLabel(normalizedTotal);
  const textColorMap = {
    green: "text-score-green",
    yellow: "text-score-yellow",
    red: "text-score-red",
  };

  return (
    <div className={cn(
      "rounded-lg border p-4",
      variant === "raw" ? "border-score-red/30 bg-score-red/5" : "border-score-green/30 bg-score-green/5"
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-sm font-semibold text-foreground">{label}</span>
        <span className={cn("font-mono text-lg font-bold", textColorMap[scoreLabel])}>
          {normalizedTotal}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Constraint Adherence</span>
          <span className="font-mono text-xs">{scores.constraintAdherence}/10</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Goal Completion</span>
          <span className="font-mono text-xs">{scores.goalCompletion}/10</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Artifact Fidelity</span>
          <span className="font-mono text-xs">{scores.artifactFidelity}/10</span>
        </div>
      </div>
    </div>
  );
}

function RawTab({ edge }: { edge: HandoffEdge }) {
  return (
    <div className="space-y-3">
      <TokenCount count={edge.tokenCount} label="Token count" />
      <div className="rounded-lg bg-muted/30 border border-border/30 p-4 max-h-96 overflow-y-auto">
        <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
          {edge.rawContext}
        </pre>
      </div>
    </div>
  );
}

function StructuredTab({ edge, scenario }: { edge: HandoffEdge; scenario: Scenario }) {
  const pb = edge.passoffBriefing;
  if (!pb) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No PASSOFF Briefing available for this edge.
      </div>
    );
  }

  const pbTokens = Math.ceil(JSON.stringify(pb).length / 4);
  const ratio = edge.tokenCount > 0 ? (edge.tokenCount / pbTokens).toFixed(1) : "N/A";

  // Decision recall against ground truth
  const gtDecisions = scenario.groundTruthDecisions;
  const pbConstraints = pb.decisions.map((d) => d.constraint.toLowerCase());
  const recalled = gtDecisions.filter((gt) =>
    pbConstraints.some(
      (c) => c.includes(gt.constraint.toLowerCase().slice(0, 20)) || gt.constraint.toLowerCase().includes(c.slice(0, 20))
    )
  ).length;
  const recall = gtDecisions.length > 0 ? (recalled / gtDecisions.length) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <TokenCount count={pbTokens} label="PB tokens" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Compression:</span>
          <span className="font-mono text-xs font-semibold text-score-green">{ratio}:1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Decision Recall:</span>
          <span className={cn(
            "font-mono text-xs font-semibold",
            recall >= 0.75 ? "text-score-green" : "text-score-yellow"
          )}>
            {(recall * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Mission</h4>
          <p className="text-sm text-foreground leading-relaxed">{pb.mission}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Completed</h4>
          <ul className="space-y-1">
            {pb.completed.map((c, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-score-green mt-0.5">{">"}</span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        {pb.decisions.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Locked Decisions</h4>
            <div className="space-y-2">
              {pb.decisions.map((d, i) => (
                <div key={i} className="rounded-md border border-border/30 bg-muted/20 p-3">
                  <p className="text-sm font-semibold text-foreground">{d.constraint}</p>
                  <p className="text-xs text-muted-foreground mt-1">{d.rationale}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <span className="font-mono text-xs text-foreground">{d.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pb.artifacts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Artifacts</h4>
            <div className="space-y-1">
              {pb.artifacts.map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">{a.type}</Badge>
                  <span className="text-sm text-foreground">{a.summary}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pb.blockers.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Blockers</h4>
            <ul className="space-y-1">
              {pb.blockers.map((b, i) => (
                <li key={i} className="text-sm text-score-yellow flex items-start gap-2">
                  <span className="mt-0.5">{"!"}</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreTab({ edge }: { edge: HandoffEdge }) {
  if (!edge.passoffScore) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No score available for this edge.
      </div>
    );
  }
  return <ScoreBars score={edge.passoffScore} />;
}

function ReplayTab({ edge, scenario }: { edge: HandoffEdge; scenario: Scenario }) {
  const [loading, setLoading] = useState(false);
  const [rawResult, setRawResult] = useState<ReplayResult | null>(null);
  const [pbResult, setPbResult] = useState<ReplayResult | null>(null);

  const handleReplay = async () => {
    setLoading(true);
    try {
      const [raw, pb] = await Promise.all([
        api.studio.runReplay("raw", scenario.id, edge.id),
        api.studio.runReplay("pb", scenario.id, edge.id),
      ]);
      setRawResult(raw);
      setPbResult(pb);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!rawResult && !loading && (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            Run the replay to compare agent outputs with raw context vs. PASSOFF Briefing.
          </p>
          <Button onClick={handleReplay} className="gap-2">
            <Play className="h-4 w-4" />
            Run Replay
          </Button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {rawResult && pbResult && (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border/30 rounded-md p-2 bg-muted/20">
            <Info className="h-3 w-3 shrink-0" />
            <span>
              {rawResult.isPreCommitted
                ? "Pre-validated scenario. Outputs committed during development from real API calls."
                : "Live experiment -- results will vary."}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Raw Context Output</h4>
              <div className="rounded-lg bg-muted/30 border border-border/30 p-3 max-h-64 overflow-y-auto">
                <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {rawResult.output}
                </pre>
              </div>
              <JudgeScoreCard label="Raw Score" scores={rawResult.judgeScores} variant="raw" />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">PASSOFF Briefing Output</h4>
              <div className="rounded-lg bg-muted/30 border border-border/30 p-3 max-h-64 overflow-y-auto">
                <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {pbResult.output}
                </pre>
              </div>
              <JudgeScoreCard label="PB Score" scores={pbResult.judgeScores} variant="pb" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function HandoffDetail({ edge, scenario }: HandoffDetailProps) {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-muted-foreground">{edge.from}</span>
          <span className="text-muted-foreground">{">"}</span>
          <span className="font-mono text-xs text-muted-foreground">{edge.to}</span>
        </div>
        <h3 className="font-sans text-base font-semibold text-foreground">Handoff Detail</h3>
      </div>
      <Tabs defaultValue="raw" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="raw" className="text-xs">Raw</TabsTrigger>
          <TabsTrigger value="structured" className="text-xs">Structured</TabsTrigger>
          <TabsTrigger value="score" className="text-xs">Score</TabsTrigger>
          <TabsTrigger value="replay" className="text-xs">Replay</TabsTrigger>
        </TabsList>
        <TabsContent value="raw" className="mt-4">
          <RawTab edge={edge} />
        </TabsContent>
        <TabsContent value="structured" className="mt-4">
          <StructuredTab edge={edge} scenario={scenario} />
        </TabsContent>
        <TabsContent value="score" className="mt-4">
          <ScoreTab edge={edge} />
        </TabsContent>
        <TabsContent value="replay" className="mt-4">
          <ReplayTab edge={edge} scenario={scenario} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
