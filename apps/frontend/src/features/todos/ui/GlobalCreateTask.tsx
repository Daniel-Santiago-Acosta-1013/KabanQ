import * as React from "react";
import { createTodo } from "../api";
import type { TodoStatus } from "../model";
import { Input } from "@/shared/ui/input";
import { Plus, Command } from "lucide-react";

interface GlobalCreateTaskProps {
  onCreated?: () => void;
  defaultStatus?: TodoStatus;
}

export function GlobalCreateTask({
  onCreated,
  defaultStatus = "backlog",
}: GlobalCreateTaskProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTodo({ title, description: "", status: defaultStatus });
      setTitle("");
      onCreated?.();
      inputRef.current?.focus();
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
      inputRef.current?.blur();
    }
  };

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const target = e.target as HTMLElement;
        const isOwnInput = target === inputRef.current;
        const isOtherInput =
          !isOwnInput &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable);

        if (isOtherInput) return;

        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className={
        "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-all " +
        (isFocused
          ? "border-primary/50 ring-1 ring-primary/20"
          : "border-border hover:border-border/80")
      }
    >
      <Plus className="h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="Create new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={loading}
        className="h-7 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
      />
      {!isFocused && (
        <span className="hidden items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          <Command className="h-2.5 w-2.5" />K
        </span>
      )}
    </form>
  );
}
