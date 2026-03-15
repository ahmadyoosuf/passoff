"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { PlaygroundMode, PipelineRun } from "@/lib/types";
import { Play, Loader2, Info } from "lucide-react";
import OutputCompare from "./output-compare";

const MODES: { value: PlaygroundMode; label: string; description: string }[] = [
  { value: "raw", label: "Raw", description: "Writer receives raw researcher output" },
  { value: "passoff", label: "PASSOFF", description: "Writer receives a PASSOFF Briefing" },
  { value: "ab", label: "A/B", description: "Side-by-side comparison of both" },
];

export default function PipelineRunner() {
  const [topic, setTopic] = useState("LLM multi-agent coordination failures");
  const [mode, setMode] = useState<PlaygroundMode>("ab");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineRun | null>(null);

  const handleRun = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const run = await api.playground.runPipeline(topic, mode);
      setResult(run);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-sans text-xl font-semibold text-foreground text-balance">
          Playground
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Run a two-agent pipeline (Researcher then Writer) and compare outcomes with and without PASSOFF.
        </p>
      </div>

      {/* Variance disclaimer */}
      <div className="flex items-start gap-3 border border-border/30 rounded-lg p-3 bg-muted/20">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          On the three validated scenarios, PASSOFF outperforms raw context on all three based on pre-committed outputs. On live custom topics, you are running a real experiment and results vary. That variance is the point -- it means the scores are real.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="topic" className="text-xs font-sans text-muted-foreground">
            Research Topic
          </label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a research topic..."
            className="font-mono text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={cn(
                "px-3 py-2 rounded-md text-xs font-mono transition-colors",
                mode === m.value
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
              )}
              title={m.description}
            >
              {m.label}
            </button>
          ))}
          <Button
            onClick={handleRun}
            disabled={loading || !topic.trim()}
            className="gap-2 min-w-[100px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {loading ? "Running" : "Run"}
          </Button>
        </div>
      </div>

      {/* Pipeline stages */}
      {loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-score-yellow animate-breathe" />
            <span className="text-sm text-muted-foreground">Running pipeline...</span>
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Researcher output */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">Agent 1</Badge>
              <span className="text-sm font-sans text-foreground">Researcher</span>
            </div>
            <div className="rounded-lg bg-muted/30 border border-border/30 p-4 max-h-48 overflow-y-auto">
              <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {result.researcherOutput}
              </pre>
            </div>
          </div>

          {/* PASSOFF Briefing (if available) */}
          {result.passoffBriefing && (mode === "passoff" || mode === "ab") && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="font-mono text-xs bg-primary/10 text-primary border-primary/20">PASSOFF</Badge>
                <span className="text-sm font-sans text-foreground">Generated Briefing</span>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  <p className="text-xs text-foreground">
                    <span className="text-muted-foreground">Mission: </span>
                    {result.passoffBriefing.mission}
                  </p>
                  {result.passoffBriefing.decisions.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Decisions: </span>
                      {result.passoffBriefing.decisions.map((d, i) => (
                        <p key={i} className="text-xs text-foreground ml-2">
                          {">"} {d.constraint}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Writer output comparison */}
          <OutputCompare result={result} />
        </div>
      )}
    </div>
  );
}
