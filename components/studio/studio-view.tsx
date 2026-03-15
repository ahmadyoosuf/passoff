"use client";

import { useState } from "react";
import Canvas from "./canvas";
import HandoffDetail from "./handoff-detail";
import { scenarios, scenarioList } from "@/lib/scenarios";
import type { ScenarioId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StudioView() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>("code-review");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const scenario = scenarios[selectedScenario];
  const selectedEdge = selectedEdgeId
    ? scenario.trace.edges.find((e) => e.id === selectedEdgeId)
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Scenario selector bar */}
      <div className="border-b border-border/30 px-4 lg:px-6 py-2 flex items-center gap-3 overflow-x-auto">
        <span className="text-xs text-muted-foreground font-sans shrink-0">Scenario:</span>
        {scenarioList.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedScenario(s.id);
              setSelectedEdgeId(null);
            }}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-colors shrink-0",
              selectedScenario === s.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
            )}
          >
            {s.label}
            <span className="ml-2 text-muted-foreground">{s.shortDescription}</span>
          </button>
        ))}
      </div>

      {/* Split pane: canvas left, detail right */}
      <div className="flex-1 flex overflow-hidden">
        <ScrollArea className="w-full lg:w-[400px] xl:w-[450px] border-r border-border/30 shrink-0">
          <Canvas
            trace={scenario.trace}
            selectedEdgeId={selectedEdgeId}
            onSelectEdge={setSelectedEdgeId}
          />
        </ScrollArea>

        <ScrollArea className="flex-1 hidden lg:block">
          {selectedEdge ? (
            <HandoffDetail edge={selectedEdge} scenario={scenario} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2 p-6">
                <p className="text-sm text-muted-foreground">
                  Select a handoff edge to inspect it.
                </p>
                <p className="text-xs text-muted-foreground">
                  Click any score badge or edge line on the canvas.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Mobile: show detail below canvas when selected */}
        {selectedEdge && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-card border-t border-border/30 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-end p-2 border-b border-border/30">
              <button
                onClick={() => setSelectedEdgeId(null)}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
              >
                Close
              </button>
            </div>
            <HandoffDetail edge={selectedEdge} scenario={scenario} />
          </div>
        )}
      </div>
    </div>
  );
}
