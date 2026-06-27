export type TodoStatus = "backlog" | "todo" | "in_progress" | "done";

export interface Todo {
  id: number;
  title: string;
  description: string;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
}

export interface BoardData {
  board: Record<TodoStatus, Todo[]>;
  counts: Record<TodoStatus, number>;
}

export const TODO_STATUSES: { value: TodoStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: "bg-slate-500" },
  { value: "todo", label: "To Do", color: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-500" },
  { value: "done", label: "Done", color: "bg-emerald-500" },
];

export const statusLabel = (status: TodoStatus) =>
  TODO_STATUSES.find((s) => s.value === status)?.label ?? status;
