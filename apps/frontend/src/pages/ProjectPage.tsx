import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppStore } from "@/features/todos";
import { TodoBoard } from "@/widgets/TodoBoard";
import { FiltersBar } from "@/widgets/FiltersBar";
import { GlobalCreateTask } from "@/features/todos/ui/GlobalCreateTask";
import { IssueDetail } from "@/widgets/IssueDetail";
import { Button } from "@/shared/ui/button";
import { RotateCcw } from "lucide-react";

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const issueId = searchParams.get("issue");
  const { loadBoard, loading, board, projects } = useAppStore();

  const project = projects.find((p) => p.id === Number(projectId));

  React.useEffect(() => {
    loadBoard(Number(projectId));
  }, [loadBoard, projectId]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: project?.color ?? "#6366f1" }}
          />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {project?.name ?? "Project"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {board ? Object.values(board.board).flat().length : 0} issues
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => loadBoard(Number(projectId))}
          disabled={loading}
        >
          <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <FiltersBar />

      <main className="flex-1 overflow-auto px-6 py-4">
        <div className="mb-4">
          <GlobalCreateTask onCreated={() => loadBoard(Number(projectId))} />
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
