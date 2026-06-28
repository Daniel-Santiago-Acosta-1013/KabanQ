import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  CollisionDetection,
} from "@dnd-kit/core";
import { useAppStore } from "@/features/todos";
import { TodoColumn } from "./TodoColumn";
import { TodoItem } from "./TodoItem";
import { Confetti } from "./Confetti";


const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCenter(args);
};

export function TodoBoard() {
  const { board, statuses, loadBoard, updateIssue } = useAppStore();
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [activeId, setActiveId] = React.useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 10 } })
  );

  const boardStatuses = React.useMemo(() => {
    if (!board) return [];
    const slugs = Object.keys(board.board);
    return statuses
      .filter((s) => slugs.includes(s.slug))
      .sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
  }, [board, statuses]);

  const activeIssue = React.useMemo(() => {
    if (!activeId || !board) return null;
    return Object.values(board.board).flat().find((i) => i.id === activeId) ?? null;
  }, [activeId, board]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !board) return;

    const issueId = Number(active.id);
    const overId = over.id;
    const targetStatus = statuses.find((s) => String(s.id) === overId || s.slug === overId);

    if (!targetStatus) return;

    const issue = Object.values(board.board).flat().find((i) => i.id === issueId);
    if (!issue || issue.status_id === targetStatus.id) return;

    await updateIssue(issueId, { status_id: targetStatus.id });
    if (targetStatus.slug === "done") setShowConfetti(true);
  };

  if (!board || statuses.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading board...
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 items-start">
          {boardStatuses.map((status) => (
            <TodoColumn
              key={status.id}
              status={status}
              issues={board.board[status.slug] ?? []}
              onCreated={loadBoard}
            />
          ))}
        </div>
        <DragOverlay>
          {activeIssue ? <TodoItem issue={activeIssue} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />
    </>
  );
}
