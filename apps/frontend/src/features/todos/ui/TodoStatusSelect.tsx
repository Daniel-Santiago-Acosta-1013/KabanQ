import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { TODO_STATUSES, TodoStatus } from "../model";
import { cn } from "@/shared/lib/utils";

interface TodoStatusSelectProps {
  value: TodoStatus;
  onChange: (value: TodoStatus) => void;
  placeholder?: string;
}

export function TodoStatusSelect({
  value,
  onChange,
  placeholder = "Select status",
}: TodoStatusSelectProps) {
  const selected = TODO_STATUSES.find((s) => s.value === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10">
        <SelectValue placeholder={placeholder}>
          {selected && (
            <span className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", selected.color)} />
              {selected.label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TODO_STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            <span className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", s.color)} />
              {s.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
