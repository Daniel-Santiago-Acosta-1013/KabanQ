import { Issue } from "@/features/todos/model";
import { useAppStore } from "@/features/todos";
import { cn } from "@/shared/lib/utils";
import { GripVertical, Calendar, Clock } from "lucide-react";
import { RichTextContent } from "@/shared/ui/rich-text-content";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/shared/ui/badge";
import { priorityColor, priorityLabel } from "@/features/todos/model";

interface TodoItemProps {
  issue: Issue;
  isOverlay?: boolean;
}

export function TodoItem({ issue, isOverlay }: TodoItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedIssueIds } = useAppStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const isSelected = selectedIssueIds.includes(issue.id);

  const openDetail = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-drag-handle]")) return;
    navigate(`${location.pathname}?issue=${issue.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={openDetail}
      className={cn(
        "group relative cursor-pointer rounded-lg border border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isSelected && "ring-2 ring-primary/50",
        isDragging && "opacity-40 shadow-none ring-2 ring-primary/30",
        isOverlay && "rotate-2 scale-105 shadow-xl"
      )}
      {...attributes}
      {...listeners}
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-lg"
        style={{ backgroundColor: issue.status_color ?? "#94a3b8" }}
      />

      <div className="flex items-start gap-1 px-3 pt-3 pl-4">
        <div
          data-drag-handle
          className="mt-0.5 cursor-grab text-muted-foreground/40 active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 shrink-0" />
        </div>
        <div className="flex-1">
          <h3
            className={cn(
              "text-sm font-medium leading-snug",
              issue.status_slug === "done" && "line-through text-muted-foreground"
            )}
          >
            {issue.title}
          </h3>
        </div>
      </div>

      {issue.description && (
        <div className="px-3 pb-2 pl-4 pt-0">
          <RichTextContent html={issue.description} compact />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 px-3 pb-3 pl-4 pt-0">
        {issue.labels.map((label) => (
          <Badge
            key={label.id}
            variant="outline"
            className="text-[10px] font-normal"
            style={{ borderColor: label.color, color: label.color }}
          >
            {label.name}
          </Badge>
        ))}

        <Badge
          className="text-[10px]"
          style={{
            backgroundColor: `${priorityColor(issue.priority)}20`,
            color: priorityColor(issue.priority),
            borderColor: "transparent",
          }}
        >
          {priorityLabel(issue.priority)}
        </Badge>

        {issue.due_date && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(issue.due_date).toLocaleDateString()}
          </span>
        )}

        {issue.estimate !== null && issue.estimate !== undefined && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {issue.estimate}m
          </span>
        )}
      </div>
    </div>
  );
}
