import * as React from "react";
import { Todo, TODO_STATUSES, TodoStatus } from "@/features/todos/model";
import { TodoListItem } from "./TodoListItem";
import { QuickCreateTask } from "@/features/todos/ui/QuickCreateTask";
import { GlobalCreateTask } from "@/features/todos/ui/GlobalCreateTask";
import { cn } from "@/shared/lib/utils";
import { useTodoStore } from "@/features/todos";

interface TodoListViewProps {
  todos: Todo[];
  onDrop?: (todoId: number, status: TodoStatus) => void;
  onCreated?: () => void;
}

export function TodoListView({ todos, onDrop, onCreated }: TodoListViewProps) {
  const counts = useTodoStore((state) => state.counts);
  const [dragOverStatus, setDragOverStatus] = React.useState<TodoStatus | null>(null);

  const byStatus = React.useMemo(() => {
    const grouped: Record<TodoStatus, Todo[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const todo of todos) {
      grouped[todo.status].push(todo);
    }
    return grouped;
  }, [todos]);

  const handleDragOver = (e: React.DragEvent<HTMLElement>, status: TodoStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, status: TodoStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    const id = Number(e.dataTransfer.getData("text/plain"));
    if (id && onDrop) {
      onDrop(id, status);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <GlobalCreateTask onCreated={onCreated} />
      </div>

      <div className="overflow-hidden rounded-lg border">
        {TODO_STATUSES.map((status, sectionIndex) => {
          const sectionTasks = byStatus[status.value];
          const isDragOver = dragOverStatus === status.value;
          const isLast = sectionIndex === TODO_STATUSES.length - 1;

          return (
            <section
              key={status.value}
              onDragOver={(e) => handleDragOver(e, status.value)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status.value)}
              className={cn(
                "transition-colors",
                sectionIndex !== 0 && "border-t",
                isDragOver && "bg-accent/30"
              )}
            >
              <div className="flex items-center justify-between px-4 py-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", status.color)} />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {status.label}
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {counts[status.value] ?? 0}
                </span>
              </div>

              <QuickCreateTask
                status={status.value}
                onCreated={onCreated}
                color={status.color}
                variant="list"
              />

              {sectionTasks.length > 0 && (
                <div className={cn("border-t", !isLast && sectionTasks.length > 0 && "border-b")}>
                  {sectionTasks.map((todo, index) => (
                    <TodoListItem key={todo.id} todo={todo} index={index} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {todos.length} {todos.length === 1 ? "task" : "tasks"}
      </p>
    </div>
  );
}
