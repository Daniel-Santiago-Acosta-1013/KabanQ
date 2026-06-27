import { create } from "zustand";
import { fetchBoard, createTodo, updateTodo, deleteTodo } from "./api";
import type { BoardData, Todo } from "./model";

interface TodoState {
  board: BoardData["board"];
  counts: BoardData["counts"];
  loading: boolean;
  error: string | null;
  loadBoard: () => Promise<void>;
  addTodo: (payload: Omit<Todo, "id" | "created_at" | "updated_at">) => Promise<void>;
  editTodo: (id: number, payload: Omit<Todo, "id" | "created_at" | "updated_at">) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
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
}));
