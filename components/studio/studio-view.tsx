"use client";

import { useState } from "react";
import Canvas from "./canvas";
import HandoffDetail from "./handoff-detail";
import { scenarios, scenarioList } from "@/lib/scenarios";
import type { ScenarioId } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export default function StudioView() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("code-review");
  const [edgeId, setEdgeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scenario = scenarios[scenarioId];
  const edge = edgeId ? scenario.trace.edges.find((e) => e.id === edgeId) : null;

  const selectEdge = (id: string) => {
    setEdgeId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setDrawerOpen(true);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Scenario tabs */}
      <div className="border-b border-border/30 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {scenarioList.map((s) => (
          <button
            key={s.id}
            onClick={() => { setScenarioId(s.id); setEdgeId(null); setDrawerOpen(false); }}
            className={cn(
              "px-3 py-2 rounded-md text-xs font-mono whitespace-nowrap transition-colors shrink-0 touch-target-sm",
              scenarioId === s.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Split: canvas | detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 lg:flex-none lg:w-[380px] xl:w-[420px] lg:border-r lg:border-border/30 overflow-y-auto">
          <Canvas
            trace={scenario.trace}
            selectedEdgeId={edgeId}
            onSelectEdge={selectEdge}
          />
        </div>

        {/* Desktop detail */}
        <div className="hidden lg:flex flex-1 flex-col min-w-0 overflow-y-auto">
          {edge ? (
            <HandoffDetail edge={edge} scenario={scenario} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Click an edge to inspect.</p>
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[85vh] lg:hidden">
            <DrawerHeader>
              <DrawerTitle className="text-sm font-mono">
                {edge ? `${edge.from} > ${edge.to}` : "Detail"}
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto flex-1 pb-[env(safe-area-inset-bottom)]">
              {edge && <HandoffDetail edge={edge} scenario={scenario} />}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
