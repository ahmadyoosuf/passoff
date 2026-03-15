"use client";

import { cn } from "@/lib/utils";
import { getScoreLabel } from "@/lib/rubric";
import type { AgentTrace, HandoffEdge } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface CanvasProps {
  trace: AgentTrace;
  selectedEdgeId: string | null;
  onSelectEdge: (edgeId: string) => void;
}

function NodeCard({
  name,
  role,
  taskSummary,
  status,
}: {
  name: string;
  role: string;
  taskSummary: string;
  status: "completed" | "failed" | "running";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 w-56 bg-card text-card-foreground transition-all",
        status === "failed"
          ? "border-score-red/50"
          : status === "running"
          ? "border-score-yellow/50"
          : "border-border/30"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-sm font-semibold text-foreground">
          {name}
        </span>
        {status === "failed" && (
          <AlertTriangle className="h-4 w-4 text-score-red" />
        )}
        {status === "completed" && (
          <CheckCircle2 className="h-4 w-4 text-score-green" />
        )}
        {status === "running" && (
          <Loader2 className="h-4 w-4 text-score-yellow animate-spin" />
        )}
      </div>
      <p className="text-xs text-muted-foreground font-mono mb-1">{role}</p>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {taskSummary}
      </p>
    </div>
  );
}

function EdgeLine({
  edge,
  isSelected,
  onClick,
}: {
  edge: HandoffEdge;
  isSelected: boolean;
  onClick: () => void;
}) {
  const score = edge.passoffScore?.total;
  const scoreColor = score !== undefined ? getScoreLabel(score) : null;

  const colorMap = {
    green: "bg-score-green",
    yellow: "bg-score-yellow",
    red: "bg-score-red",
  };

  const borderColorMap = {
    green: "border-score-green",
    yellow: "border-score-yellow",
    red: "border-score-red",
  };

  const textColorMap = {
    green: "text-score-green",
    yellow: "text-score-yellow",
    red: "text-score-red",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-md transition-all cursor-pointer",
        "hover:bg-muted/30",
        isSelected && "bg-primary/5 ring-1 ring-primary/20"
      )}
      aria-label={`Handoff edge from ${edge.from} to ${edge.to}${
        score !== undefined ? `, score ${score}` : ""
      }`}
    >
      <div className="flex items-center gap-1 flex-1">
        <div
          className={cn(
            "h-0.5 flex-1 rounded",
            scoreColor ? colorMap[scoreColor] : "bg-border"
          )}
        />
        <svg
          width="8"
          height="12"
          viewBox="0 0 8 12"
          className={cn(
            scoreColor
              ? textColorMap[scoreColor]
              : "text-muted-foreground"
          )}
        >
          <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      {score !== undefined && (
        <span
          className={cn(
            "font-mono text-xs font-semibold px-2 py-0.5 rounded-full border",
            scoreColor && borderColorMap[scoreColor],
            scoreColor === "green" && "text-score-green",
            scoreColor === "yellow" && "text-score-yellow",
            scoreColor === "red" && "text-score-red"
          )}
        >
          {score}
        </span>
      )}
      {score === undefined && (
        <span className="font-mono text-xs text-muted-foreground px-2 py-0.5 rounded-full border border-border/30">
          --
        </span>
      )}
    </button>
  );
}

export default function Canvas({
  trace,
  selectedEdgeId,
  onSelectEdge,
}: CanvasProps) {
  // Build adjacency: for each edge, find source and target nodes
  const nodeMap = new Map(trace.nodes.map((n) => [n.id, n]));

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4">
        <h2 className="font-sans text-lg font-semibold text-foreground text-balance">
          {trace.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {trace.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-score-red/10 text-score-red border border-score-red/20">
            MAST: {trace.mastFailureMode}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {trace.mastPercentage} of failures
          </span>
        </div>
      </div>

      {/* Node-edge graph rendered as a vertical flow */}
      <div className="flex flex-col gap-2">
        {trace.edges.map((edge, idx) => {
          const sourceNode = nodeMap.get(edge.from);
          const targetNode = nodeMap.get(edge.to);
          if (!sourceNode || !targetNode) return null;

          // Track which nodes have been rendered
          const previousTargets = trace.edges.slice(0, idx).map((e) => e.to);
          const showSource = idx === 0 || !previousTargets.includes(edge.from);

          return (
            <div key={edge.id} className="flex flex-col gap-2">
              {showSource && (
                <NodeCard
                  name={sourceNode.name}
                  role={sourceNode.role}
                  taskSummary={sourceNode.taskSummary}
                  status={sourceNode.status}
                />
              )}
              <EdgeLine
                edge={edge}
                isSelected={selectedEdgeId === edge.id}
                onClick={() => onSelectEdge(edge.id)}
              />
              <NodeCard
                name={targetNode.name}
                role={targetNode.role}
                taskSummary={targetNode.taskSummary}
                status={targetNode.status}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
