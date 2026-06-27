import * as React from "react";
import { useTodoStore } from "@/features/todos";
import { TodoColumn } from "./TodoColumn";
import { TodoListView } from "./TodoListView";
import { TODO_STATUSES, TodoStatus } from "@/features/todos/model";
import { updateTodo } from "@/features/todos/api";
import { Confetti } from "./Confetti";

export type ViewMode = "board" | "list";

interface TodoBoardProps {
  query?: string;
  view?: ViewMode;
}

export function TodoBoard({ query = "", view = "board" }: TodoBoardProps) {
  const board = useTodoStore((state) => state.board);
  const loadBoard = useTodoStore((state) => state.loadBoard);
  const [showConfetti, setShowConfetti] = React.useState(false);

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

  return (
    <>
      {view === "board" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 items-start">
          {TODO_STATUSES.map((status) => (
            <TodoColumn
              key={status.value}
              status={status.value}
              label={status.label}
              color={status.color}
              todos={filteredBoard[status.value]}
              onDrop={handleDrop}
              onCreated={loadBoard}
            />
          ))}
        </div>
      ) : (
        <TodoListView todos={allFilteredTodos} onDrop={handleDrop} onCreated={loadBoard} />
      )}
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />
    </>
  );
}
