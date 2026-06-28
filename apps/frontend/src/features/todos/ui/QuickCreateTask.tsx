import * as React from "react";
import { createIssue } from "../api";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { Plus } from "lucide-react";

interface QuickCreateTaskProps {
  statusId: number;
  onCreated?: () => void;
  color?: string;
  variant?: "card" | "list";
}

export function QuickCreateTask({
  statusId,
  onCreated,
  color,
  variant = "card",
}: QuickCreateTaskProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) {
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      await createIssue({ title, description: "", status_id: statusId });
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

  if (variant === "list") {
    if (!isOpen) {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex w-full items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
          <span>Add issue</span>
        </button>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="relative px-4 py-1.5">
        <div className="absolute left-7 top-1/2 -translate-y-1/2">
          <div
            className={cn("h-1.5 w-1.5 rounded-full")}
            style={{ backgroundColor: color ?? "#94a3b8" }}
          />
        </div>
        <Input
          ref={inputRef}
          placeholder="Issue title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!title.trim()) setIsOpen(false);
          }}
          disabled={loading}
          className="h-7 pl-6 pr-3 text-xs bg-transparent border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </form>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-accent/50 hover:text-foreground"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span>Add issue</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <div
          className={cn("h-2 w-2 rounded-full")}
          style={{ backgroundColor: color ?? "#94a3b8" }}
        />
      </div>
      <Input
        ref={inputRef}
        placeholder="Issue title..."
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
