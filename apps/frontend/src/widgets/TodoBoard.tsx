import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { useTodoStore } from "@/features/todos";
import { TodoColumn } from "./TodoColumn";
import { TodoListView } from "./TodoListView";
import { TODO_STATUSES, TodoStatus } from "@/features/todos/model";
import { TodoItem } from "./TodoItem";
import { updateTodo } from "@/features/todos/api";
import { Confetti } from "./Confetti";

export type ViewMode = "board" | "list";

interface TodoBoardProps {
  query?: string;
  view?: ViewMode;
}

function findColumn(board: Record<TodoStatus, { id: number }[]>, id: number): TodoStatus | null {
  for (const status of TODO_STATUSES.map((s) => s.value)) {
    if (board[status].some((t) => t.id === id)) return status;
  }
  return null;
}

export function TodoBoard({ query = "", view = "board" }: TodoBoardProps) {
  const board = useTodoStore((state) => state.board);
  const loadBoard = useTodoStore((state) => state.loadBoard);
  const reorderTodo = useTodoStore((state) => state.reorderTodo);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [activeId, setActiveId] = React.useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const filteredBoard = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return board;
    const next: Record<TodoStatus, typeof board.backlog> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
    };
    (Object.keys(board) as TodoStatus[]).forEach((status) => {
      next[status] = board[status].filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    });
    return next;
  }, [board, query]);

  const allFilteredTodos = React.useMemo(
    () =>
      (Object.keys(filteredBoard) as TodoStatus[]).flatMap(
        (status) => filteredBoard[status]
      ),
    [filteredBoard]
  );

  const activeTodo = React.useMemo(() => {
    if (!activeId) return null;
    return Object.values(board).flat().find((t) => t.id === activeId) ?? null;
  }, [activeId, board]);

  const handleDrop = async (todoId: number, status: TodoStatus) => {
    const current = Object.values(board).flat().find((t) => t.id === todoId);
    if (!current || current.status === status) return;

    await updateTodo(todoId, {
      title: current.title,
      description: current.description,
      status,
    });
    await loadBoard();
    if (status === "done") {
      setShowConfetti(true);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;
    const isOverColumn = TODO_STATUSES.some((s) => s.value === overId);

    let targetStatus: TodoStatus;
    let targetIndex: number;

    if (isOverColumn) {
      targetStatus = overId as TodoStatus;
      targetIndex = board[targetStatus].length;
    } else {
      const overItemId = Number(overId);
      const overColumn = findColumn(board, overItemId);
      if (!overColumn) return;
      targetStatus = overColumn;
      const overIndex = board[targetStatus].findIndex((t) => t.id === overItemId);

      const activeRect = active.rect.current.translated;
      const overRect = over.rect;
      if (activeRect && overRect) {
        const activeCenterY = activeRect.top + activeRect.height / 2;
        const overCenterY = overRect.top + overRect.height / 2;
        targetIndex = activeCenterY > overCenterY ? overIndex + 1 : overIndex;
      } else {
        targetIndex = overIndex;
      }
    }

    reorderTodo(activeId, targetStatus, targetIndex);
    if (targetStatus === "done") {
      setShowConfetti(true);
    }
  };

  return (
    <>
      {view === "board" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 items-start">
            {TODO_STATUSES.map((status) => (
              <TodoColumn
                key={status.value}
                status={status.value}
                label={status.label}
                color={status.color}
                todos={filteredBoard[status.value]}
                onCreated={loadBoard}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTodo ? <TodoItem todo={activeTodo} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <TodoListView todos={allFilteredTodos} onDrop={handleDrop} onCreated={loadBoard} />
      )}
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />
    </>
  );
}
