import * as React from "react";
import { Todo, TodoStatus } from "@/features/todos/model";
import { TodoItem } from "./TodoItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTodoStore } from "@/features/todos";
import { cn } from "@/shared/lib/utils";
import { Inbox } from "lucide-react";
import { QuickCreateTask } from "@/features/todos/ui/QuickCreateTask";

interface TodoColumnProps {
  status: TodoStatus;
  label: string;
  color: string;
  todos: Todo[];
  onDrop?: (todoId: number, status: TodoStatus) => void;
  onCreated?: () => void;
}

export function TodoColumn({ status, label, color, todos, onDrop, onCreated }: TodoColumnProps) {
  const counts = useTodoStore((state) => state.counts);
  const [dragOver, setDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const id = Number(e.dataTransfer.getData("text/plain"));
    if (id && onDrop) {
      onDrop(id, status);
    }
  };

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden border bg-card shadow-sm transition-all duration-200",
        dragOver && "ring-2 ring-primary/40 border-primary/40 scale-[1.01]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn("h-1 w-full", color)} />
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
          <CardTitle className="text-sm font-semibold">{label}</CardTitle>
        </div>
        <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-secondary px-2 text-xs font-semibold text-secondary-foreground">
          {counts[status] ?? 0}
        </span>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-3 pb-4 pt-0 min-h-[140px]">
        <QuickCreateTask status={status} onCreated={onCreated} color={color} />
        {todos.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
            <Inbox className="h-8 w-8 opacity-40" />
            <span>No tasks</span>
          </div>
        ) : (
          todos.map((todo, index) => (
            <TodoItem key={todo.id} todo={todo} index={index} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
