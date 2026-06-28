import { API_BASE } from "@/shared/lib/api";
import type { BoardData, Todo, TodoCreatePayload, TodoUpdatePayload, TodoStatus } from "./model";

export async function fetchBoard(): Promise<BoardData> {
  const res = await fetch(`${API_BASE}/todos/board`);
  if (!res.ok) throw new Error("Failed to fetch board");
  return res.json();
}

export async function fetchTodos(status?: TodoStatus): Promise<Todo[]> {
  const url = status ? `${API_BASE}/todos?status=${status}` : `${API_BASE}/todos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export async function createTodo(payload: TodoCreatePayload): Promise<Todo> {
  const res = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  const data = await res.json();
  return data.data;
}

export async function updateTodo(
  id: number,
  payload: TodoUpdatePayload
): Promise<Todo> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  const data = await res.json();
  return data.data;
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete todo");
}
