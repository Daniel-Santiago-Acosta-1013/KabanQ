import { Todo } from "@/features/todos/model";
import { TodoEditDialog } from "@/features/todos/ui/TodoEditDialog";
import { TodoDeleteButton } from "@/features/todos/ui/TodoDeleteButton";
import { TodoStatusSelect } from "@/features/todos/ui/TodoStatusSelect";
import { useTodoStore } from "@/features/todos";
import { updateTodo } from "@/features/todos/api";
import { cn } from "@/shared/lib/utils";
import { statusLabel } from "@/features/todos/model";
import { RichTextContent } from "@/shared/ui/rich-text-content";
import { useState } from "react";

interface TodoListItemProps {
  todo: Todo;
  index: number;
}

const statusDotStyles: Record<Todo["status"], string> = {
  backlog: "bg-slate-400",
  todo: "bg-blue-500",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};

export function TodoListItem({ todo, index }: TodoListItemProps) {
  const loadBoard = useTodoStore((state) => state.loadBoard);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status: Todo["status"]) => {
    if (status === todo.status) return;
    setUpdating(true);
    try {
      await updateTodo(todo.id, {
        title: todo.title,
        description: todo.description,
        status,
      });
      await loadBoard();
    } finally {
      setUpdating(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", String(todo.id));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group flex items-center gap-3 border-b border-border/40 px-4 py-2.5 transition-colors hover:bg-accent/40 cursor-grab active:cursor-grabbing animate-in fade-in",
        todo.status === "done" && "opacity-60"
      )}
      style={{
        animationDelay: `${index * 20}ms`,
        animationFillMode: "backwards",
      }}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full ring-2 ring-background",
          statusDotStyles[todo.status]
        )}
      />

      <div className="flex flex-1 items-center gap-3 min-w-0">
        <span
          className={cn(
            "truncate text-sm",
            todo.status === "done" && "line-through text-muted-foreground"
          )}
        >
          {todo.title}
        </span>
        {todo.description && (
          <div className="hidden sm:block min-w-0 flex-1">
            <RichTextContent html={todo.description} compact />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <div className="hidden sm:block">
          <TodoStatusSelect value={todo.status} onChange={handleStatusChange} disabled={updating} />
        </div>
        <TodoEditDialog todo={todo} onUpdated={loadBoard} />
        <TodoDeleteButton todoId={todo.id} onDeleted={loadBoard} />
      </div>

      <span className="text-xs text-muted-foreground sm:hidden">
        {statusLabel(todo.status)}
      </span>
    </div>
  );
}
