import * as React from "react";
import { createTodo } from "../api";
import type { TodoStatus } from "../model";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { Plus } from "lucide-react";

interface QuickCreateTaskProps {
  status: TodoStatus;
  onCreated?: () => void;
  color?: string;
}

export function QuickCreateTask({ status, onCreated, color }: QuickCreateTaskProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) {
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      await createTodo({ title, description: "", status });
      setTitle("");
      setIsOpen(false);
      onCreated?.();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      setTitle("");
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-accent/50 hover:text-foreground"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span>Add task</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <div className={cn("h-2 w-2 rounded-full", color ?? "bg-slate-400")} />
      </div>
      <Input
        ref={inputRef}
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!title.trim()) setIsOpen(false);
        }}
        disabled={loading}
        className="h-9 pl-7 pr-3 text-sm"
      />
    </form>
  );
}
