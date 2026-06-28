import * as React from "react";
import { useAppStore } from "@/features/todos";
import { TodoListView } from "@/widgets/TodoListView";
import { FiltersBar } from "@/widgets/FiltersBar";
import { ViewToggle } from "@/widgets/ViewToggle";
import { GlobalCreateTask } from "@/features/todos/ui/GlobalCreateTask";
import { Button } from "@/shared/ui/button";
import { RotateCcw } from "lucide-react";

export function ListPage() {
  const { loadIssues, loading, error, issues } = useAppStore();

  React.useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">List</h1>
          <p className="text-xs text-muted-foreground">{issues.length} issues</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle />
          <Button
            variant="outline"
            size="icon"
            onClick={loadIssues}
            disabled={loading}
            title="Refresh"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <FiltersBar />

      <main className="flex-1 overflow-auto px-6 py-4">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="mb-4">
          <GlobalCreateTask onCreated={loadIssues} />
        </div>
        <TodoListView />
      </main>
    </div>
  );
}
