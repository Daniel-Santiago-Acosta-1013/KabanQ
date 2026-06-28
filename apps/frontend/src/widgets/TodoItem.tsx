import { Todo } from "@/features/todos/model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { TodoEditDialog } from "@/features/todos/ui/TodoEditDialog";
import { TodoDeleteButton } from "@/features/todos/ui/TodoDeleteButton";
import { useTodoStore } from "@/features/todos";
import { cn } from "@/shared/lib/utils";
import { GripVertical, CheckCircle2 } from "lucide-react";
import { statusLabel } from "@/features/todos/model";
import { RichTextContent } from "@/shared/ui/rich-text-content";

interface TodoItemProps {
  todo: Todo;
  index: number;
}

const statusStyles: Record<Todo["status"], string> = {
  backlog: "border-l-slate-400",
  todo: "border-l-blue-500",
  in_progress: "border-l-amber-500",
  done: "border-l-emerald-500",
};

const statusBadgeStyles: Record<Todo["status"], string> = {
  backlog: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  todo: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function TodoItem({ todo, index }: TodoItemProps) {
  const loadBoard = useTodoStore((state) => state.loadBoard);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", String(todo.id));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group relative border border-border/60 border-l-[5px] bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-in fade-in slide-in-from-bottom-3 cursor-grab active:cursor-grabbing",
        statusStyles[todo.status],
        todo.status === "done" && "opacity-75"
      )}
      style={{
        animationDelay: `${index * 35}ms`,
        animationFillMode: "backwards",
      }}
    >
      <CardHeader className="px-3 pb-1 pt-3">
        <div className="flex items-start gap-1">
          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
          <div className="flex-1">
            <CardTitle
              className={cn(
                "text-sm font-medium leading-snug",
                todo.status === "done" && "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      {todo.description && (
        <CardContent className="px-3 pb-2 pt-0">
          <RichTextContent html={todo.description} compact />
        </CardContent>
      )}

      <div className="flex items-center justify-between px-3 pb-3 pt-0">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            statusBadgeStyles[todo.status]
          )}
        >
          {todo.status === "done" && (
            <CheckCircle2 className="h-3 w-3" />
          )}
          {statusLabel(todo.status)}
        </span>

        <div className="flex items-center opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <TodoEditDialog todo={todo} onUpdated={loadBoard} />
          <TodoDeleteButton todoId={todo.id} onDeleted={loadBoard} />
        </div>
      </div>
    </Card>
  );
}
