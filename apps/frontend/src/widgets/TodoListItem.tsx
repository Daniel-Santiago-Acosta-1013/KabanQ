import { Issue } from "@/features/todos/model";
import { useAppStore } from "@/features/todos";
import { cn } from "@/shared/lib/utils";
import { priorityColor, priorityLabel } from "@/features/todos/model";
import { Badge } from "@/shared/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TodoListItemProps {
  issue: Issue;
  index: number;
}

export function TodoListItem({ issue, index }: TodoListItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSelectedIssue, selectedIssueIds } = useAppStore();
  const isSelected = selectedIssueIds.includes(issue.id);

  return (
    <div
      onClick={() => navigate(`${location.pathname}?issue=${issue.id}`)}
      className={cn(
        "group flex cursor-pointer items-center gap-3 border-b border-border/40 px-4 py-3 transition-colors hover:bg-accent/40 animate-in fade-in",
        isSelected && "bg-accent/60",
        index === 0 && "border-t-0"
      )}
      style={{
        animationDelay: `${index * 20}ms`,
        animationFillMode: "backwards",
      }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onClick={(e) => e.stopPropagation()}
        onChange={() => toggleSelectedIssue(issue.id)}
        className="h-4 w-4 rounded border-muted-foreground"
      />

      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: issue.status_color ?? "#94a3b8" }}
      />

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <span className="truncate text-sm font-medium">{issue.title}</span>
        <div className="flex flex-wrap items-center gap-1.5">
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

      <span className="text-xs text-muted-foreground">
        {issue.status_name ?? "No status"}
      </span>
    </div>
  );
}
