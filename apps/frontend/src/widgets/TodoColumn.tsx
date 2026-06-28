import * as React from "react";
import { Todo, TodoStatus } from "@/features/todos/model";
import { TodoItem } from "./TodoItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTodoStore } from "@/features/todos";
import { cn } from "@/shared/lib/utils";
import { Inbox } from "lucide-react";
import { QuickCreateTask } from "@/features/todos/ui/QuickCreateTask";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

interface TodoColumnProps {
  status: TodoStatus;
  label: string;
  color: string;
  todos: Todo[];
  onCreated?: () => void;
}

export function TodoColumn({ status, label, color, todos, onCreated }: TodoColumnProps) {
  const counts = useTodoStore((state) => state.counts);
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const itemIds = React.useMemo(() => todos.map((t) => t.id), [todos]);

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "flex h-full flex-col overflow-hidden border bg-card shadow-sm transition-all duration-200",
        isOver && "ring-2 ring-primary/40 border-primary/40 scale-[1.01]"
      )}
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
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {todos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
}
