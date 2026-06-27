import { Todo } from "@/features/todos/model";
import { TodoEditDialog } from "@/features/todos/ui/TodoEditDialog";
import { TodoDeleteButton } from "@/features/todos/ui/TodoDeleteButton";
import { useTodoStore } from "@/features/todos";
import { cn } from "@/shared/lib/utils";
import { statusLabel } from "@/features/todos/model";
import { GripVertical, CheckCircle2 } from "lucide-react";

interface TodoListItemProps {
  todo: Todo;
  index: number;
}

const statusBadgeStyles: Record<Todo["status"], string> = {
  backlog: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  todo: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function TodoListItem({ todo, index }: TodoListItemProps) {
  const loadBoard = useTodoStore((state) => state.loadBoard);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", String(todo.id));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-3 shadow-sm transition-all duration-200 hover:shadow-md animate-in fade-in slide-in-from-bottom-2 cursor-grab active:cursor-grabbing",
        todo.status === "done" && "opacity-75"
      )}
      style={{
        animationDelay: `${index * 30}ms`,
        animationFillMode: "backwards",
      }}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span
          className={cn(
            "truncate text-sm font-medium",
            todo.status === "done" && "line-through text-muted-foreground"
          )}
        >
          {todo.title}
        </span>
        {todo.description && (
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {todo.description}
          </span>
        )}
      </div>

      <span
        className={cn(
          "hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0",
          statusBadgeStyles[todo.status]
        )}
      >
        {todo.status === "done" && <CheckCircle2 className="h-3 w-3" />}
        {statusLabel(todo.status)}
      </span>

      <div className="flex items-center shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <TodoEditDialog todo={todo} onUpdated={loadBoard} />
        <TodoDeleteButton todoId={todo.id} onDeleted={loadBoard} />
      </div>
    </div>
  );
}
