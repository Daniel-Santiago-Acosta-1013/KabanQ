import { useAppStore } from "@/features/todos";
import { TodoListItem } from "./TodoListItem";
import { GlobalCreateTask } from "@/features/todos/ui/GlobalCreateTask";
import { Inbox } from "lucide-react";

export function TodoListView() {
  const { issues, loadIssues } = useAppStore();

  if (issues.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
        <Inbox className="h-10 w-10 opacity-40" />
        <p className="text-sm">No issues found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-2">
      <GlobalCreateTask onCreated={loadIssues} />
      <div className="overflow-hidden rounded-lg border">
        {issues.map((issue, index) => (
          <TodoListItem key={issue.id} issue={issue} index={index} />
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {issues.length} {issues.length === 1 ? "issue" : "issues"}
      </p>
    </div>
  );
}
