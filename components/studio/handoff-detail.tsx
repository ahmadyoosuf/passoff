"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ScoreBars from "./score-bars";
import { cn } from "@/lib/utils";
import { getScoreLabel } from "@/lib/rubric";
import type { HandoffEdge, Scenario, JudgeScores } from "@/lib/types";
import { api } from "@/lib/api";
import { Play } from "lucide-react";

interface Props {
  edge: HandoffEdge;
  scenario: Scenario;
}

function JudgeCard({ label, scores, variant }: { label: string; scores: JudgeScores; variant: "raw" | "pb" }) {
  const normalized = Math.round(((scores.constraintAdherence + scores.goalCompletion + scores.artifactFidelity) / 30) * 100);
  const color = getScoreLabel(normalized);
  const textMap = { green: "text-score-green", yellow: "text-score-yellow", red: "text-score-red" };

  return (
    <div className={cn("rounded-lg border p-3", variant === "raw" ? "border-score-red/20" : "border-score-green/20")}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("font-mono text-sm font-bold", textMap[color])}>{normalized}</span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Constraint</span><span className="font-mono">{scores.constraintAdherence}/10</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Goal</span><span className="font-mono">{scores.goalCompletion}/10</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Fidelity</span><span className="font-mono">{scores.artifactFidelity}/10</span></div>
      </div>
    </div>
  );
}

export default function HandoffDetail({ edge, scenario }: Props) {
  const [replayLoading, setReplayLoading] = useState(false);
  const [rawResult, setRawResult] = useState<{ output: string; judgeScores: JudgeScores; isPreCommitted: boolean } | null>(null);
  const [pbResult, setPbResult] = useState<{ output: string; judgeScores: JudgeScores; isPreCommitted: boolean } | null>(null);

  const runReplay = async () => {
    setReplayLoading(true);
    try {
      const [raw, pb] = await Promise.all([
        api.studio.runReplay("raw", scenario.id, edge.id),
        api.studio.runReplay("pb", scenario.id, edge.id),
      ]);
      setRawResult(raw);
      setPbResult(pb);
    } finally {
      setReplayLoading(false);
    }
  };

  const pb = edge.passoffBriefing;
  const pbTokens = pb ? Math.ceil(JSON.stringify(pb).length / 4) : 0;
  const ratio = pb && edge.tokenCount > 0 ? (edge.tokenCount / pbTokens).toFixed(1) : null;

  return (
    <div className="p-4 lg:p-6">
      <Tabs defaultValue="raw" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="raw" className="text-xs">Raw</TabsTrigger>
          <TabsTrigger value="structured" className="text-xs">PB</TabsTrigger>
          <TabsTrigger value="score" className="text-xs">Score</TabsTrigger>
          <TabsTrigger value="replay" className="text-xs">Replay</TabsTrigger>
        </TabsList>

        {/* Raw */}
        <TabsContent value="raw" className="mt-4 space-y-3">
          <span className="font-mono text-xs text-muted-foreground">{edge.tokenCount.toLocaleString()} tokens</span>
          <div className="rounded-lg bg-muted/20 border border-border/30 p-3 max-h-80 overflow-y-auto">
            <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">{edge.rawContext}</pre>
          </div>
        </TabsContent>

        {/* Structured PB */}
        <TabsContent value="structured" className="mt-4 space-y-4">
          {!pb ? (
            <p className="text-sm text-muted-foreground">No PB for this edge.</p>
          ) : (
            <>
              <div className="flex items-center gap-4 flex-wrap text-xs">
                <span className="font-mono text-muted-foreground">{pbTokens} tokens</span>
                {ratio && <span className="font-mono text-score-green font-semibold">{ratio}:1 compression</span>}
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mission</h4>
                  <p className="text-sm text-foreground">{pb.mission}</p>
                </div>

                {pb.decisions.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Decisions</h4>
                    {pb.decisions.map((d, i) => (
                      <div key={i} className="rounded-md border border-border/30 p-2.5 mb-2">
                        <p className="text-xs font-medium text-foreground">{d.constraint}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{d.rationale}</p>
                      </div>
                    ))}
                  </div>
                )}

                {pb.completed.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Completed</h4>
                    <ul className="space-y-0.5">
                      {pb.completed.map((c, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="text-score-green mt-px shrink-0">{">"}</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pb.blockers.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Blockers</h4>
                    <ul className="space-y-0.5">
                      {pb.blockers.map((b, i) => (
                        <li key={i} className="text-xs text-score-yellow flex items-start gap-1.5">
                          <span className="mt-px shrink-0">!</span>{b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Score */}
        <TabsContent value="score" className="mt-4">
          {edge.passoffScore ? (
            <ScoreBars score={edge.passoffScore} />
          ) : (
            <p className="text-sm text-muted-foreground">No score available.</p>
          )}
        </TabsContent>

        {/* Replay */}
        <TabsContent value="replay" className="mt-4 space-y-4">
          {!rawResult && !replayLoading && (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground mb-3">Compare agent output: raw context vs. PASSOFF Briefing.</p>
              <Button onClick={runReplay} size="sm" className="gap-1.5">
                <Play className="h-3.5 w-3.5" /> Run Replay
              </Button>
            </div>
          )}

          {replayLoading && (
            <div className="text-center py-8">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">Running...</p>
            </div>
          )}

          {rawResult && pbResult && (
            <>
              <p className="text-[11px] text-muted-foreground border border-border/30 rounded-md px-2.5 py-1.5">
                {rawResult.isPreCommitted
                  ? "Pre-validated. Outputs committed from real API calls."
                  : "Live experiment. Results will vary."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="rounded-lg bg-muted/20 border border-border/30 p-2.5 max-h-48 overflow-y-auto">
                    <pre className="font-mono text-[11px] text-foreground whitespace-pre-wrap leading-relaxed">{rawResult.output}</pre>
                  </div>
                  <JudgeCard label="Raw" scores={rawResult.judgeScores} variant="raw" />
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg bg-muted/20 border border-border/30 p-2.5 max-h-48 overflow-y-auto">
                    <pre className="font-mono text-[11px] text-foreground whitespace-pre-wrap leading-relaxed">{pbResult.output}</pre>
                  </div>
                  <JudgeCard label="PB" scores={pbResult.judgeScores} variant="pb" />
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
