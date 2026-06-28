import * as React from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import { TodoStatusSelect } from "./TodoStatusSelect";
import { updateTodo } from "../api";
import type { Todo, TodoStatus } from "../model";
import { cn } from "@/shared/lib/utils";

interface TodoEditDialogProps {
  todo: Todo;
  onUpdated?: () => void;
}

export function TodoEditDialog({ todo, onUpdated }: TodoEditDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(todo.title);
  const [description, setDescription] = React.useState(todo.description);
  const [status, setStatus] = React.useState<TodoStatus>(todo.status);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitle(todo.title);
      setDescription(todo.description);
      setStatus(todo.status);
    }
  }, [open, todo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await updateTodo(todo.id, { title, description, status });
      setOpen(false);
      onUpdated?.();
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<TodoStatus, string> = {
    backlog: "bg-slate-400",
    todo: "bg-blue-500",
    in_progress: "bg-amber-500",
    done: "bg-emerald-500",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-[calc(100vw-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", statusColors[status])} />
            <span>Edit task</span>
          </div>
          <DialogTitle className="sr-only">Edit task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="px-6 py-8">
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-0 bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          </div>

          <div className="mt-4 flex-1">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Add a more detailed description..."
              className="rounded-none shadow-none focus-within:ring-0"
              contentClassName="[&_.ProseMirror]:min-h-[220px]"
            />
          </div>

          <div className="flex items-center justify-between border-t bg-muted/30 px-6 py-4">
            <TodoStatusSelect value={status} onChange={setStatus} />

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading || !title.trim()}
              >
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
