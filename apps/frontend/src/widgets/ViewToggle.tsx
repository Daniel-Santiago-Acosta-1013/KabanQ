import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { Columns2, List } from "lucide-react";

export function ViewToggle() {
  const navigate = useNavigate();
  const location = useLocation();
  const view = location.pathname.includes("/list") ? "list" : "board";

  return (
    <div className="flex items-center rounded-lg border bg-muted p-0.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/board")}
        className={cn(
          "h-8 w-8 rounded-md",
          view === "board" && "bg-card text-foreground shadow-sm"
        )}
        title="Board view"
      >
        <Columns2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/list")}
        className={cn(
          "h-8 w-8 rounded-md",
          view === "list" && "bg-card text-foreground shadow-sm"
        )}
        title="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
