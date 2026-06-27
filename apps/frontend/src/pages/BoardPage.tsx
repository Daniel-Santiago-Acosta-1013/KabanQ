import * as React from "react";
import { useTodoStore } from "@/features/todos";
import { TodoBoard, ViewMode } from "@/widgets/TodoBoard";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Search, LayoutDashboard, RotateCcw, Columns2, List } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function BoardPage() {
  const { loadBoard, loading, error } = useTodoStore();
  const [query, setQuery] = React.useState("");
  const [view, setView] = React.useState<ViewMode>("board");

  React.useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">KabanQ</h1>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Manage tasks with clarity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 w-40 pl-9 sm:w-64"
                />
              </div>

              <div className="flex items-center rounded-lg border bg-muted p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView("board")}
                  className={cn(
                    "h-8 w-8 rounded-md",
                    view === "board" && "bg-card text-foreground shadow-sm"
                  )}
                  title="Board view"
                >
                  <Columns2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView("list")}
                  className={cn(
                    "h-8 w-8 rounded-md",
                    view === "list" && "bg-card text-foreground shadow-sm"
                  )}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={loadBoard}
                disabled={loading}
                className="h-10 w-10 shrink-0"
                title="Refresh"
              >
                <RotateCcw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm">
            {error}
          </div>
        )}

        <TodoBoard query={query} view={view} />
      </main>
    </div>
  );
}
