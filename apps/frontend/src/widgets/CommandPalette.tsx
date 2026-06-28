import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/command";
import { useAppStore } from "@/features/todos";
import {
  LayoutDashboard,
  List,
  Inbox,
  FolderKanban,
  Settings,
  Search,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { board, projects, cycles } = useAppStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const issues = React.useMemo(
    () => (board ? Object.values(board.board).flat() : []),
    [board]
  );

  const run = (cb: () => void) => {
    setOpen(false);
    cb();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run(() => navigate("/board"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Board
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/list"))}>
            <List className="mr-2 h-4 w-4" />
            List
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/inbox"))}>
            <Inbox className="mr-2 h-4 w-4" />
            Inbox
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Projects">
          {projects.map((project) => (
            <CommandItem
              key={project.id}
              onSelect={() => run(() => navigate(`/projects/${project.id}`))}
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              {project.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Cycles">
          {cycles.map((cycle) => (
            <CommandItem
              key={cycle.id}
              onSelect={() => run(() => navigate(`/cycles/${cycle.id}`))}
            >
              <Search className="mr-2 h-4 w-4" />
              {cycle.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Issues">
          {issues.slice(0, 20).map((issue) => (
            <CommandItem
              key={issue.id}
              onSelect={() => run(() => navigate(`/board?issue=${issue.id}`))}
            >
              <Search className="mr-2 h-4 w-4" />
              {issue.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
