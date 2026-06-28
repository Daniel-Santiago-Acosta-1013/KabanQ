import { useAppStore } from "@/features/todos";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { PRIORITIES } from "@/features/todos/model";
import { X } from "lucide-react";

export function FiltersBar() {
  const { statuses, labels, projects, cycles, filters, setFilters, resetFilters } = useAppStore();

  const hasFilters =
    filters.status_id ||
    filters.project_id ||
    filters.cycle_id ||
    filters.label_ids.length ||
    filters.priority ||
    filters.q;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-card/50 px-6 py-2">
      <Input
        placeholder="Search issues..."
        value={filters.q}
        onChange={(e) => setFilters({ q: e.target.value })}
        className="h-8 w-48 text-xs"
      />

      <Select
        value={filters.status_id ? String(filters.status_id) : "all"}
        onValueChange={(v) =>
          setFilters({ status_id: v === "all" ? null : Number(v) })
        }
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || "all"}
        onValueChange={(v) =>
          setFilters({ priority: v === "all" ? null : (v as any) })
        }
      >
        <SelectTrigger className="h-8 w-28 text-xs">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {PRIORITIES.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.project_id ? String(filters.project_id) : "all"}
        onValueChange={(v) =>
          setFilters({ project_id: v === "all" ? null : Number(v) })
        }
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.cycle_id ? String(filters.cycle_id) : "all"}
        onValueChange={(v) =>
          setFilters({ cycle_id: v === "all" ? null : Number(v) })
        }
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue placeholder="Cycle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All cycles</SelectItem>
          {cycles.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.label_ids.length ? String(filters.label_ids[0]) : "all"}
        onValueChange={(v) =>
          setFilters({ label_ids: v === "all" ? [] : [Number(v)] })
        }
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue placeholder="Label" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All labels</SelectItem>
          {labels.map((l) => (
            <SelectItem key={l.id} value={String(l.id)}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 gap-1 text-xs"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
