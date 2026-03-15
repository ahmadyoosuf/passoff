"use client";

import { useState } from "react";
import Canvas from "./canvas";
import HandoffDetail from "./handoff-detail";
import { scenarios, scenarioList } from "@/lib/scenarios";
import type { ScenarioId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

export default function StudioView() {
  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioId>("code-review");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scenario = scenarios[selectedScenario];
  const selectedEdge = selectedEdgeId
    ? scenario.trace.edges.find((e) => e.id === selectedEdgeId)
    : null;

  const handleSelectEdge = (edgeId: string) => {
    setSelectedEdgeId(edgeId);
    // On mobile, open drawer
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setDrawerOpen(true);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Scenario selector bar -- horizontally scrollable on mobile */}
      <div className="border-b border-border/30 px-4 lg:px-6 py-2 flex items-center gap-3 overflow-x-auto">
        <span className="text-xs text-muted-foreground font-sans shrink-0">
          Scenario:
        </span>
        {scenarioList.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedScenario(s.id);
              setSelectedEdgeId(null);
              setDrawerOpen(false);
            }}
            className={cn(
              "px-3 py-2 rounded-md text-xs font-mono whitespace-nowrap transition-colors shrink-0 touch-target-sm",
              selectedScenario === s.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
            )}
          >
            {s.label}
            <span className="hidden sm:inline ml-2 text-muted-foreground">
              {s.shortDescription}
            </span>
          </button>
        ))}
      </div>

      {/* Split pane: canvas left, detail right on lg+ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas -- full width on mobile, fixed width on desktop */}
        <ScrollArea className="flex-1 lg:flex-none lg:w-[420px] xl:w-[480px] lg:border-r lg:border-border/30">
          <Canvas
            trace={scenario.trace}
            selectedEdgeId={selectedEdgeId}
            onSelectEdge={handleSelectEdge}
          />
        </ScrollArea>

        {/* Desktop detail panel -- hidden on mobile, visible on lg+ */}
        <div className="hidden lg:flex flex-1 flex-col min-w-0">
          <ScrollArea className="flex-1">
            {selectedEdge ? (
              <HandoffDetail edge={selectedEdge} scenario={scenario} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center p-6">
                  <p className="text-sm text-muted-foreground">
                    Select a handoff edge to inspect it.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click any score badge or edge line on the canvas.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Mobile: Vaul drawer for detail panel */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[85vh] lg:hidden">
            <DrawerHeader className="flex items-center justify-between">
              <DrawerTitle className="text-sm font-sans">
                Handoff Detail
              </DrawerTitle>
            </DrawerHeader>
            <div
              className="overflow-y-auto flex-1"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {selectedEdge && (
                <HandoffDetail edge={selectedEdge} scenario={scenario} />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
