import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppStore } from "@/features/todos";
import { TodoBoard } from "@/widgets/TodoBoard";
import { FiltersBar } from "@/widgets/FiltersBar";
import { GlobalCreateTask } from "@/features/todos/ui/GlobalCreateTask";
import { IssueDetail } from "@/widgets/IssueDetail";
import { Button } from "@/shared/ui/button";
import { RotateCcw } from "lucide-react";

export function CyclePage() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const issueId = searchParams.get("issue");
  const { loadBoard, loading, cycles } = useAppStore();

  const cycle = cycles.find((c) => c.id === Number(cycleId));

  React.useEffect(() => {
    loadBoard(undefined, Number(cycleId));
  }, [loadBoard, cycleId]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {cycle?.name ?? "Cycle"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {cycle?.start_date && cycle?.end_date
              ? `${cycle.start_date} → ${cycle.end_date}`
              : "No dates"}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => loadBoard(undefined, Number(cycleId))}
          disabled={loading}
        >
          <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <FiltersBar />

      <main className="flex-1 overflow-auto px-6 py-4">
        <div className="mb-4">
          <GlobalCreateTask onCreated={() => loadBoard(undefined, Number(cycleId))} />
        </div>
        <TodoBoard />
      </main>

      {issueId && (
        <IssueDetail
          issueId={Number(issueId)}
          onClose={() => {
            searchParams.delete("issue");
            setSearchParams(searchParams);
          }}
        />
      )}
    </div>
  );
}
