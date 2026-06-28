import { API_BASE } from "@/shared/lib/api";
import type {
  BoardData,
  Cycle,
  CustomField,
  Issue,
  IssueCreatePayload,
  IssueUpdatePayload,
  Label,
  Priority,
  Project,
  Status,
} from "./model";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to post ${url}: ${res.statusText}`);
  return res.json();
}

async function putJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to put ${url}: ${res.statusText}`);
  return res.json();
}

async function del(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete ${url}: ${res.statusText}`);
}

// Issues
export async function fetchBoard(projectId?: number, cycleId?: number): Promise<BoardData> {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", String(projectId));
  if (cycleId) params.set("cycle_id", String(cycleId));
  return getJson<BoardData>(`${API_BASE}/issues/board?${params.toString()}`);
}

export async function fetchIssues(params?: {
  status_id?: number;
  project_id?: number;
  cycle_id?: number;
  label_ids?: number[];
  priority?: Priority;
  parent_id?: number | null;
  due_before?: string;
  due_after?: string;
  q?: string;
}): Promise<Issue[]> {
  const query = new URLSearchParams();
  if (params?.status_id) query.set("status_id", String(params.status_id));
  if (params?.project_id) query.set("project_id", String(params.project_id));
  if (params?.cycle_id) query.set("cycle_id", String(params.cycle_id));
  if (params?.priority) query.set("priority", params.priority);
  if (params?.parent_id !== undefined) query.set("parent_id", String(params.parent_id));
  if (params?.due_before) query.set("due_before", params.due_before);
  if (params?.due_after) query.set("due_after", params.due_after);
  if (params?.q) query.set("q", params.q);
  params?.label_ids?.forEach((id) => query.append("label_ids", String(id)));
  return getJson<Issue[]>(`${API_BASE}/issues?${query.toString()}`);
}

export async function fetchInbox(): Promise<Issue[]> {
  return getJson<Issue[]>(`${API_BASE}/issues/inbox`);
}

export async function fetchIssue(id: number): Promise<Issue> {
  return getJson<Issue>(`${API_BASE}/issues/${id}`);
}

export async function createIssue(payload: IssueCreatePayload): Promise<{ data: Issue }> {
  return postJson<{ data: Issue }>(`${API_BASE}/issues`, payload);
}

export async function updateIssue(id: number, payload: IssueUpdatePayload): Promise<{ data: Issue }> {
  return putJson<{ data: Issue }>(`${API_BASE}/issues/${id}`, payload);
}

export async function deleteIssue(id: number): Promise<void> {
  return del(`${API_BASE}/issues/${id}`);
}

// Relations
export async function addRelation(
  issueId: number,
  targetId: number,
  relationType: string
): Promise<unknown> {
  return postJson<unknown>(`${API_BASE}/issues/${issueId}/relations`, {
    target_id: targetId,
    relation_type: relationType,
  });
}

export async function removeRelation(relationId: number): Promise<void> {
  return del(`${API_BASE}/issues/relations/${relationId}`);
}

// Statuses
export async function fetchStatuses(): Promise<Status[]> {
  return getJson<Status[]>(`${API_BASE}/statuses`);
}

export async function createStatus(payload: Omit<Status, "id" | "created_at" | "updated_at">): Promise<Status> {
  return postJson<Status>(`${API_BASE}/statuses`, payload);
}

export async function updateStatus(id: number, payload: Omit<Status, "id" | "created_at" | "updated_at">): Promise<Status> {
  return putJson<Status>(`${API_BASE}/statuses/${id}`, payload);
}

export async function deleteStatus(id: number): Promise<void> {
  return del(`${API_BASE}/statuses/${id}`);
}

// Labels
export async function fetchLabels(): Promise<Label[]> {
  return getJson<Label[]>(`${API_BASE}/labels`);
}

export async function createLabel(payload: Omit<Label, "id" | "created_at" | "updated_at">): Promise<Label> {
  return postJson<Label>(`${API_BASE}/labels`, payload);
}

export async function updateLabel(id: number, payload: Omit<Label, "id" | "created_at" | "updated_at">): Promise<Label> {
  return putJson<Label>(`${API_BASE}/labels/${id}`, payload);
}

export async function deleteLabel(id: number): Promise<void> {
  return del(`${API_BASE}/labels/${id}`);
}

// Projects
export async function fetchProjects(): Promise<Project[]> {
  return getJson<Project[]>(`${API_BASE}/projects`);
}

export async function createProject(payload: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project> {
  return postJson<Project>(`${API_BASE}/projects`, payload);
}

export async function updateProject(id: number, payload: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project> {
  return putJson<Project>(`${API_BASE}/projects/${id}`, payload);
}

export async function deleteProject(id: number): Promise<void> {
  return del(`${API_BASE}/projects/${id}`);
}

// Cycles
export async function fetchCycles(): Promise<Cycle[]> {
  return getJson<Cycle[]>(`${API_BASE}/cycles`);
}

export async function createCycle(payload: Omit<Cycle, "id" | "created_at" | "updated_at">): Promise<Cycle> {
  return postJson<Cycle>(`${API_BASE}/cycles`, payload);
}

export async function updateCycle(id: number, payload: Omit<Cycle, "id" | "created_at" | "updated_at">): Promise<Cycle> {
  return putJson<Cycle>(`${API_BASE}/cycles/${id}`, payload);
}

export async function deleteCycle(id: number): Promise<void> {
  return del(`${API_BASE}/cycles/${id}`);
}

// Custom fields
export async function fetchCustomFields(): Promise<CustomField[]> {
  return getJson<CustomField[]>(`${API_BASE}/custom-fields`);
}

export async function createCustomField(payload: Omit<CustomField, "id" | "created_at" | "updated_at">): Promise<CustomField> {
  return postJson<CustomField>(`${API_BASE}/custom-fields`, payload);
}

export async function updateCustomField(id: number, payload: Omit<CustomField, "id" | "created_at" | "updated_at">): Promise<CustomField> {
  return putJson<CustomField>(`${API_BASE}/custom-fields/${id}`, payload);
}

export async function deleteCustomField(id: number): Promise<void> {
  return del(`${API_BASE}/custom-fields/${id}`);
}
