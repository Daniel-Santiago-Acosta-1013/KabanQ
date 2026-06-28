import * as React from "react";
import { NavLink } from "react-router-dom";
import { useAppStore } from "@/features/todos";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  LayoutDashboard,
  List,
  Inbox,
  RotateCcw,
  Settings,
  Moon,
  Sun,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export function Sidebar() {
  const {
    projects,
    cycles,
    labels,
    loadMetadata,
    darkMode,
    toggleDarkMode,
    loading,
  } = useAppStore();
  const [showProjects, setShowProjects] = React.useState(true);
  const [showCycles, setShowCycles] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
      isActive
        ? "bg-accent text-accent-foreground font-medium"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <span className="font-semibold tracking-tight">KabanQ</span>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-auto p-3">
        <NavLink to="/board" className={linkClass}>
          <LayoutDashboard className="h-4 w-4" />
          Board
        </NavLink>
        <NavLink to="/list" className={linkClass}>
          <List className="h-4 w-4" />
          List
        </NavLink>
        <NavLink to="/inbox" className={linkClass}>
          <Inbox className="h-4 w-4" />
          Inbox
        </NavLink>

        <div className="mt-4">
          <button
            onClick={() => setShowProjects(!showProjects)}
            className="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <span>Projects</span>
            {showProjects ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
          {showProjects && (
            <div className="mt-1 flex flex-col gap-0.5">
              {projects.map((project) => (
                <NavLink
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={linkClass}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={() => setShowCycles(!showCycles)}
            className="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <span>Cycles</span>
            {showCycles ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
          {showCycles && (
            <div className="mt-1 flex flex-col gap-0.5">
              {cycles.map((cycle) => (
                <NavLink
                  key={cycle.id}
                  to={`/cycles/${cycle.id}`}
                  className={linkClass}
                >
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span className="truncate">{cycle.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <span>Labels</span>
            {showLabels ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
          {showLabels && (
            <div className="mt-1 flex flex-col gap-0.5">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="truncate">{label.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleDarkMode}
            title="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={loadMetadata}
            disabled={loading}
            title="Refresh"
          >
            <RotateCcw
              className={cn("h-4 w-4", loading && "animate-spin")}
            />
          </Button>
          <NavLink to="/settings" className={linkClass}>
            <Settings className="h-4 w-4" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
