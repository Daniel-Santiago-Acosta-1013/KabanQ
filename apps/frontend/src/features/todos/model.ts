export type Priority = "urgent" | "high" | "medium" | "low";

export interface Status {
  id: number;
  name: string;
  slug: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Cycle {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomField {
  id: number;
  name: string;
  field_type: "text" | "number" | "date" | "select";
  options: string;
  created_at: string;
  updated_at: string;
}

export interface Relation {
  id: number;
  source_id: number;
  target_id: number;
  relation_type: string;
  target_title: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  status_id: number | null;
  status_slug?: string;
  status_name?: string;
  status_color?: string;
  priority: Priority;
  position: number;
  due_date: string | null;
  estimate: number | null;
  project_id: number | null;
  project_name?: string;
  project_color?: string;
  cycle_id: number | null;
  cycle_name?: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  label_ids: number[];
  labels: Label[];
  sub_issues: Issue[];
  relations: Relation[];
  custom_field_values: { custom_field_id: number; value: string; field_name?: string; field_type?: string }[];
}

export interface BoardData {
  board: Record<string, Issue[]>;
  counts: Record<string, number>;
  statuses: Status[];
}

export type IssueCreatePayload = {
  title: string;
  description?: string;
  status_id?: number | null;
  priority?: Priority;
  position?: number;
  due_date?: string | null;
  estimate?: number | null;
  project_id?: number | null;
  cycle_id?: number | null;
  parent_id?: number | null;
  label_ids?: number[];
  custom_field_values?: { custom_field_id: number; value: string }[];
};

export type IssueUpdatePayload = Partial<IssueCreatePayload>;

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "urgent", label: "Urgent", color: "#ef4444" },
  { value: "high", label: "High", color: "#f97316" },
  { value: "medium", label: "Medium", color: "#3b82f6" },
  { value: "low", label: "Low", color: "#22c55e" },
];

export const priorityLabel = (priority: Priority) =>
  PRIORITIES.find((p) => p.value === priority)?.label ?? priority;

export const priorityColor = (priority: Priority) =>
  PRIORITIES.find((p) => p.value === priority)?.color ?? "#94a3b8";
