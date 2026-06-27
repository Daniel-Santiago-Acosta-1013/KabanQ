import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { deleteTodo } from "../api";

interface TodoDeleteButtonProps {
  todoId: number;
  onDeleted?: () => void;
}

export function TodoDeleteButton({ todoId, onDeleted }: TodoDeleteButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    try {
      await deleteTodo(todoId);
      onDeleted?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={loading}
      aria-label="Delete"
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
