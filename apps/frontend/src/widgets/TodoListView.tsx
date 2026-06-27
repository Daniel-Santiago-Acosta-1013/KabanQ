import * as React from "react";
import { Todo, TODO_STATUSES, TodoStatus } from "@/features/todos/model";
import { TodoListItem } from "./TodoListItem";
import { QuickCreateTask } from "@/features/todos/ui/QuickCreateTask";
import { cn } from "@/shared/lib/utils";
import { Inbox } from "lucide-react";
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {TODO_STATUSES.map((status) => (
        <section
          key={status.value}
          onDragOver={(e) => handleDragOver(e, status.value)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status.value)}
          className={cn(
            "rounded-xl border bg-card p-4 shadow-sm transition-all duration-200",
            dragOverStatus === status.value && "ring-2 ring-primary/40 border-primary/40 scale-[1.01]"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", status.color)} />
              <h3 className="text-sm font-semibold">{status.label}</h3>
            </div>
            <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-secondary px-2 text-xs font-semibold text-secondary-foreground">
              {counts[status.value] ?? 0}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <QuickCreateTask status={status.value} onCreated={onCreated} color={status.color} />

            {byStatus[status.value].length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                <Inbox className="h-7 w-7 opacity-40" />
                <span>No tasks</span>
              </div>
            ) : (
              byStatus[status.value].map((todo, index) => (
                <TodoListItem key={todo.id} todo={todo} index={index} />
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
