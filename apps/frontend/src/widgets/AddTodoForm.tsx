import { TodoCreateForm } from "@/features/todos/ui/TodoCreateForm";
import { useTodoStore } from "@/features/todos";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PlusCircle } from "lucide-react";

interface AddTodoFormProps {
  onCreated?: () => void;
}

export function AddTodoForm({ onCreated }: AddTodoFormProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <PlusCircle className="h-5 w-5 text-primary" />
          New task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TodoCreateForm
          onCreated={() => {
            useTodoStore.getState().loadBoard();
            onCreated?.();
          }}
        />
      </CardContent>
    </Card>
  );
}
