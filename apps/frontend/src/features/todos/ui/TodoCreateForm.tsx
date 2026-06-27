import * as React from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { TodoStatusSelect } from "./TodoStatusSelect";
import { createTodo } from "../api";
import type { TodoStatus } from "../model";
import { Loader2, Plus } from "lucide-react";

interface TodoCreateFormProps {
  onCreated?: () => void;
}

export function TodoCreateForm({ onCreated }: TodoCreateFormProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TodoStatus>("backlog");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTodo({ title, description, status });
      setTitle("");
      setDescription("");
      setStatus("backlog");
      onCreated?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-10"
      />
      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[90px] resize-none"
      />
      <TodoStatusSelect value={status} onChange={setStatus} />
      <Button
        type="submit"
        disabled={loading || !title.trim()}
        className="mt-1 w-full"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Add task
      </Button>
    </form>
  );
}
