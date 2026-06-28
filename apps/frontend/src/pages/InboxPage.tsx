import * as React from "react";
import { useAppStore } from "@/features/todos";
import { TodoListView } from "@/widgets/TodoListView";
import { Button } from "@/shared/ui/button";
import { RotateCcw } from "lucide-react";

export function InboxPage() {
  const { loadInbox, loading, error } = useAppStore();

  React.useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Inbox</h1>
          <p className="text-xs text-muted-foreground">
            Upcoming and recently updated issues
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={loadInbox}
          disabled={loading}
          title="Refresh"
        >
          <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <main className="flex-1 overflow-auto px-6 py-4">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <TodoListView />
      </main>
    </div>
  );
}
