"use client";

import { cn } from "@/lib/utils";
import { getScoreLabel } from "@/lib/rubric";
import type { AgentTrace, HandoffEdge } from "@/lib/types";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface CanvasProps {
  trace: AgentTrace;
  selectedEdgeId: string | null;
  onSelectEdge: (edgeId: string) => void;
}

function AgentNode({
  name,
  role,
  status,
}: {
  name: string;
  role: string;
  status: "completed" | "failed" | "running";
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border px-4 py-3 bg-card text-card-foreground",
        status === "failed"
          ? "border-score-red/40"
          : "border-border/30"
      )}
    >
      <div className="flex items-center gap-2">
        {status === "failed" ? (
          <AlertTriangle className="h-3.5 w-3.5 text-score-red shrink-0" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 text-score-green shrink-0" />
        )}
        <span className="font-sans text-sm font-semibold text-foreground">{name}</span>
      </div>
      <p className="text-xs text-muted-foreground font-mono mt-1">{role}</p>
    </div>
  );
}

function EdgeConnector({
  edge,
  isSelected,
  onClick,
}: {
  edge: HandoffEdge;
  isSelected: boolean;
  onClick: () => void;
}) {
  const score = edge.passoffScore?.total;
  const label = score !== undefined ? getScoreLabel(score) : null;

  const lineColor = {
    green: "bg-score-green",
    yellow: "bg-score-yellow",
    red: "bg-score-red",
  };
  const badgeBorder = {
    green: "border-score-green text-score-green",
    yellow: "border-score-yellow text-score-yellow",
    red: "border-score-red text-score-red",
  };

  const isRed = label === "red";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-full py-1 group cursor-pointer",
        isSelected && "z-10"
      )}
      aria-label={`Handoff from ${edge.from} to ${edge.to}${score !== undefined ? `, score ${score}` : ""}`}
    >
      {/* Vertical colored line */}
      <div className="absolute inset-0 flex justify-center">
        <div
          className={cn(
            "w-0.5 h-full transition-all",
            label ? lineColor[label] : "bg-border/50",
            isRed && "w-1 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
            isSelected && "w-1"
          )}
        />
      </div>

      {/* Score badge */}
      <div
        className={cn(
          "relative z-10 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono font-semibold transition-all",
          "bg-background",
          label ? badgeBorder[label] : "border-border/40 text-muted-foreground",
          isRed && "shadow-[0_0_12px_rgba(239,68,68,0.25)] border-2",
          isSelected && "ring-2 ring-primary/30 bg-primary/5",
          "group-hover:scale-105"
        )}
      >
        {score !== undefined ? score : "--"}
        <svg
          width="6"
          height="10"
          viewBox="0 0 6 10"
          className="opacity-50"
        >
          <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </button>
  );
}

export default function Canvas({
  trace,
  selectedEdgeId,
  onSelectEdge,
}: CanvasProps) {
  const nodeMap = new Map(trace.nodes.map((n) => [n.id, n]));

  // Build the linear flow: node -> edge -> node -> edge -> node
  const renderedNodes = new Set<string>();
  const elements: React.ReactNode[] = [];

  trace.edges.forEach((edge, idx) => {
    const source = nodeMap.get(edge.from);
    const target = nodeMap.get(edge.to);
    if (!source || !target) return;

    if (!renderedNodes.has(edge.from)) {
      renderedNodes.add(edge.from);
      elements.push(
        <AgentNode
          key={`node-${edge.from}`}
          name={source.name}
          role={source.role}
          status={source.status}
        />
      );
    }

    elements.push(
      <EdgeConnector
        key={`edge-${edge.id}`}
        edge={edge}
        isSelected={selectedEdgeId === edge.id}
        onClick={() => onSelectEdge(edge.id)}
      />
    );

    if (!renderedNodes.has(edge.to)) {
      renderedNodes.add(edge.to);
      elements.push(
        <AgentNode
          key={`node-${edge.to}`}
          name={target.name}
          role={target.role}
          status={target.status}
        />
      );
    }
  });

  return (
    <div className="flex flex-col items-center px-4 py-6 lg:px-6 lg:py-8">
      {/* MAST badge */}
      <div className="flex items-center gap-2 mb-6 self-start">
        <span className="font-mono text-[11px] px-2 py-1 rounded-md bg-score-red/10 text-score-red border border-score-red/20">
          MAST: {trace.mastFailureMode} ({trace.mastPercentage})
        </span>
      </div>

      {/* Graph */}
      <div className="flex flex-col items-stretch w-full max-w-xs">
        {elements}
      </div>
    </div>
  );
}
