import { create } from "zustand";
import { fetchBoard, createTodo, updateTodo, deleteTodo } from "./api";
import type { BoardData, TodoStatus, TodoCreatePayload, TodoUpdatePayload } from "./model";

interface TodoState {
  board: BoardData["board"];
  counts: BoardData["counts"];
  loading: boolean;
  error: string | null;
  loadBoard: () => Promise<void>;
  addTodo: (payload: TodoCreatePayload) => Promise<void>;
  editTodo: (id: number, payload: TodoUpdatePayload) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
  reorderTodo: (id: number, targetStatus: TodoStatus, targetIndex: number) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  board: { backlog: [], todo: [], in_progress: [], done: [] },
  counts: { backlog: 0, todo: 0, in_progress: 0, done: 0 },
  loading: false,
  error: null,

  loadBoard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchBoard();
      set({ board: data.board, counts: data.counts });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      set({ loading: false });
    }
  },

  addTodo: async (payload) => {
    await createTodo(payload);
    await get().loadBoard();
  },

  editTodo: async (id, payload) => {
    await updateTodo(id, payload);
    await get().loadBoard();
  },

  removeTodo: async (id) => {
    await deleteTodo(id);
    await get().loadBoard();
  },

  reorderTodo: async (id, targetStatus, targetIndex) => {
    const { board } = get();
    const sourceStatus = (Object.keys(board) as TodoStatus[]).find((s) =>
      board[s].some((t) => t.id === id)
    );
    if (!sourceStatus) return;

    const sourceColumn = board[sourceStatus];
    const sourceIndex = sourceColumn.findIndex((t) => t.id === id);
    if (sourceIndex === -1) return;

    const todo = sourceColumn[sourceIndex];

    if (sourceStatus === targetStatus && sourceIndex === targetIndex) return;

    const nextBoard: BoardData["board"] = {
      backlog: [...board.backlog],
      todo: [...board.todo],
      in_progress: [...board.in_progress],
      done: [...board.done],
    };

    nextBoard[sourceStatus].splice(sourceIndex, 1);

    const adjustedIndex =
      sourceStatus === targetStatus && sourceIndex < targetIndex
        ? targetIndex - 1
        : targetIndex;

    nextBoard[targetStatus].splice(adjustedIndex, 0, { ...todo, status: targetStatus });

    set({ board: nextBoard });

    try {
      await updateTodo(id, {
        title: todo.title,
        description: todo.description,
        status: targetStatus,
        position: adjustedIndex,
      });
    } catch {
      await get().loadBoard();
    }
  },
}));
